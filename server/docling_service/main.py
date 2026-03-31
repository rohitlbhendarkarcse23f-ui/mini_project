"""
Marksheet Parser Microservice — powered by Docling
PDF (text-layer + scanned) and images via Docling's unified pipeline.
Run: python main.py
"""

import io
import re
import tempfile
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from docling.document_converter import DocumentConverter

app = FastAPI(title="Marksheet Parser")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["POST", "GET"])

SUPPORTED = {
    "application/pdf",
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/tiff",
}

SUFFIX_MAP = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg", "image/jpg": ".jpg",
    "image/png": ".png", "image/webp": ".webp", "image/tiff": ".tiff",
}

GRADE_POINTS = {
    "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6,
    "C": 5,  "D": 4,  "E": 3, "F": 0,  "P": 5, "AB": 0,
}

_RE_GRADE   = re.compile(r"\b(O|A\+|A|B\+|B|C|D|E|F|P|AB)\b")
_RE_CREDITS = re.compile(r"\b([1-6])\b")
_RE_CODE    = re.compile(r"\b([A-Z]{2,4}\d{3,4}[A-Z]?)\b")
_RE_MARKS   = re.compile(r"\b(\d{1,3})\b")
_RE_SEM     = re.compile(r"(?:semester|sem)[^\d]*(\d+)|(\d+)(?:st|nd|rd|th)\s*sem", re.I)
_RE_ID      = re.compile(
    r"(?:enrollment|roll|student)\s*(?:no|number|id)?[\s:.]*([A-Z0-9]{6,15})"
    r"|([A-Z]{2}\d{2}[A-Z]{2}\d{3,4})"
    r"|(\d{2}[A-Z]{2}\d{3,4})",
    re.I,
)
_RE_NAME   = re.compile(r"(?:student\s*name|name)[\s:.]+([A-Za-z\s]{3,40})", re.I)
_RE_BRANCH = re.compile(r"(?:branch|department|programme)[\s:.]+([A-Za-z\s&]{3,40})", re.I)
_RE_SGPA   = re.compile(r"(?:sgpa|s\.g\.p\.a)[\s:.]*([0-9]+\.[0-9]{1,2})", re.I)
_RE_CGPA   = re.compile(r"(?:cgpa|c\.g\.p\.a)[\s:.]*([0-9]+\.[0-9]{1,2})", re.I)
_RE_YEAR   = re.compile(r"(?:exam\s*year|year\s*of\s*exam|academic\s*year)[\s:.]*(\d{4})", re.I)
_RE_UNIV   = re.compile(r"(?:university|institute|college)[\s:.]+([A-Za-z\s]{5,60})", re.I)

# Single shared converter instance
_converter = DocumentConverter()


def calc_sgpa(subjects: list) -> float:
    pts = creds = 0
    for s in subjects:
        pts   += GRADE_POINTS.get(s.get("grade", ""), 0) * int(s.get("credits") or 0)
        creds += int(s.get("credits") or 0)
    return round(pts / creds, 2) if creds else 0.0


def parse_text(text: str) -> dict:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    full  = " ".join(lines)

    student_id = student_name = semester = branch = exam_year = university = None
    declared_sgpa = declared_cgpa = None

    m = _RE_ID.search(full)
    if m:
        student_id = next(g for g in m.groups() if g).upper()

    m = _RE_NAME.search(full)
    if m: student_name = m.group(1).strip()

    m = _RE_SEM.search(full)
    if m: semester = int(m.group(1) or m.group(2))

    m = _RE_BRANCH.search(full)
    if m: branch = m.group(1).strip()

    m = _RE_YEAR.search(full)
    if m: exam_year = m.group(1)

    m = _RE_UNIV.search(full)
    if m: university = m.group(1).strip()

    m = _RE_SGPA.search(full)
    if m: declared_sgpa = float(m.group(1))

    m = _RE_CGPA.search(full)
    if m: declared_cgpa = float(m.group(1))

    subjects = []
    for line in lines:
        gm = _RE_GRADE.search(line)
        if not gm:
            continue
        grade = gm.group(1)

        cm      = _RE_CREDITS.search(line)
        credits = int(cm.group(1)) if cm else 3

        code_m = _RE_CODE.search(line)
        code   = code_m.group(1) if code_m else ""

        name = line
        if code: name = name.replace(code, "")
        name = _RE_GRADE.sub("", name)
        name = _RE_MARKS.sub("", name)
        name = re.sub(r"[^A-Za-z\s&/]", " ", name).strip()
        name = re.sub(r"\s{2,}", " ", name)
        if len(name) < 3:
            continue

        nums = [int(x) for x in _RE_MARKS.findall(line)]
        subjects.append({
            "code":          code,
            "name":          name,
            "credits":       credits,
            "grade":         grade,
            "gradePoints":   GRADE_POINTS.get(grade, 0),
            "internalMarks": nums[0] if len(nums) > 0 else None,
            "externalMarks": nums[1] if len(nums) > 1 else None,
            "totalMarks":    nums[2] if len(nums) > 2 else None,
            "result":        "FAIL" if grade == "F" else "PASS",
        })

    sgpa = declared_sgpa if declared_sgpa and declared_sgpa > 0 else calc_sgpa(subjects)

    return {
        "studentId":    student_id,
        "studentName":  student_name,
        "semester":     max(1, min(8, semester)) if semester else 1,
        "branch":       branch,
        "examYear":     exam_year,
        "university":   university,
        "subjects":     subjects,
        "totalCredits": sum(s["credits"] for s in subjects),
        "sgpa":         sgpa,
        "cgpa":         declared_cgpa,
        "result":       "PASS" if all(s["grade"] != "F" for s in subjects) else "FAIL",
    }


def score_confidence(data: dict) -> int:
    score = 0
    if data.get("studentId") and data["studentId"] != "UNKNOWN": score += 25
    if data.get("studentName") and len(data["studentName"]) > 2:  score += 20
    if 1 <= (data.get("semester") or 0) <= 8:                     score += 20
    if len(data.get("subjects") or []) >= 3:                      score += 25
    if (data.get("sgpa") or 0) > 0:                               score += 10
    return score


@app.get("/health")
def health():
    return {"status": "ok", "service": "marksheet-parser"}


@app.post("/parse")
async def parse_marksheet(file: UploadFile = File(...)):
    ct = (file.content_type or "").split(";")[0].strip().lower()
    if ct not in SUPPORTED:
        raise HTTPException(400, f"Unsupported type: {ct}")

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(413, "File too large (max 20 MB)")

    suffix = SUFFIX_MAP.get(ct, ".pdf")

    # Write to temp file — Docling needs a file path
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(contents)
        tmp_path = Path(tmp.name)

    try:
        result  = _converter.convert(str(tmp_path))
        md_text = result.document.export_to_markdown()
    except Exception as exc:
        raise HTTPException(500, f"Docling conversion failed: {exc}")
    finally:
        tmp_path.unlink(missing_ok=True)

    data       = parse_text(md_text)
    confidence = score_confidence(data)

    return {
        "success":    len(data["subjects"]) > 0,
        "data":       data,
        "confidence": confidence,
        "method":     "docling",
        "rawText":    md_text[:2000],
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=False, timeout_keep_alive=300)
