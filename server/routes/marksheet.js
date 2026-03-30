const express = require('express');
const multer  = require('multer');
const fs      = require('fs');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const OLLAMA_URL   = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llava';

const PROMPT = `You are an expert at reading Indian university marksheets.
Extract all data from this marksheet image and return ONLY a JSON object with this structure:
{
  "studentId": "enrollment/roll number",
  "studentName": "full name",
  "semester": 3,
  "branch": "branch name",
  "examYear": "2024",
  "university": "university name",
  "subjects": [
    {
      "code": "CS301",
      "name": "subject name",
      "credits": 4,
      "internalMarks": 25,
      "externalMarks": 70,
      "totalMarks": 95,
      "grade": "O",
      "gradePoints": 10,
      "result": "PASS"
    }
  ],
  "totalCredits": 24,
  "sgpa": 8.75,
  "cgpa": 8.50,
  "result": "PASS"
}
Rules:
- Extract EVERY subject row
- Grade must be one of: O, A+, A, B+, B, C, D, E, F, P, AB
- credits must be an integer
- semester must be a number 1-8
- Use null for missing fields
- Return ONLY the JSON, no markdown, no explanation`;

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const base64 = req.file.buffer.toString('base64');

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:  OLLAMA_MODEL,
        prompt: PROMPT,
        images: [base64],
        stream: false,
        options: { temperature: 0.1 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `Ollama error: ${err.slice(0, 200)}` });
    }

    const json = await response.json();
    const raw  = json.response || '';

    const match = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\{[\s\S]*\}/);
    if (!match) return res.status(422).json({ error: 'No JSON in model response', raw });

    res.json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
