/**
 * AI-Powered Marksheet Data Extraction System
 * Extracts academic data from uploaded marksheet PDFs/Images
 * Calculates SGPA automatically for merit ranking
 */

import Tesseract from 'tesseract.js';

/**
 * Grade to Grade Point mapping (standard 10-point scale)
 */
const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6,
  'C': 5, 'D': 4, 'E': 3, 'F': 0, 'P': 5
};

/**
 * Extract text from image/PDF using Tesseract OCR
 */
async function extractTextFromImage(file) {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m)
    });
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from marksheet');
  }
}

/**
 * Parse student information from extracted text
 */
function parseStudentInfo(text) {
  const info = {
    studentId: null,
    name: null,
    semester: null,
    branch: null
  };

  // Extract Student ID (patterns: kf23cs164, 1KF23CS164, etc.)
  const idMatch = text.match(/(?:student\s*(?:id|no|number)?[\s:]*)?([a-z0-9]{8,15})/i);
  if (idMatch) info.studentId = idMatch[1].toLowerCase();

  // Extract Name
  const nameMatch = text.match(/name[\s:]+([a-z\s]+)/i);
  if (nameMatch) info.name = nameMatch[1].trim();

  // Extract Semester
  const semMatch = text.match(/semester[\s:]*(\d+)|sem[\s:]*(\d+)|(\d+)(?:st|nd|rd|th)\s*sem/i);
  if (semMatch) info.semester = parseInt(semMatch[1] || semMatch[2] || semMatch[3]);

  // Extract Branch
  const branchMatch = text.match(/branch[\s:]+([a-z\s]+)|department[\s:]+([a-z\s]+)/i);
  if (branchMatch) info.branch = (branchMatch[1] || branchMatch[2]).trim();

  return info;
}

/**
 * Parse subject marks and grades from text
 */
function parseSubjects(text) {
  const subjects = [];
  const lines = text.split('\n');

  // Common patterns for subject data
  const patterns = [
    // Pattern: Subject Code | Subject Name | Credits | Marks | Grade
    /([A-Z0-9]{5,10})\s+([A-Za-z\s&]+?)\s+(\d+)\s+(\d+)\s+([A-Z+]+)/,
    // Pattern: Subject Name | Marks | Grade | Credits
    /([A-Za-z\s&]+?)\s+(\d+)\s+([A-Z+]+)\s+(\d+)/,
    // Pattern: Code | Name | Grade | Credits
    /([A-Z0-9]{5,10})\s+([A-Za-z\s&]+?)\s+([A-Z+]+)\s+(\d+)/
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const subject = {
          code: match[1],
          name: match[2] ? match[2].trim() : match[1],
          credits: parseInt(match[3] || match[4]),
          marks: match[4] ? parseInt(match[4]) : null,
          grade: match[5] || match[3]
        };

        // Validate grade
        if (GRADE_POINTS[subject.grade]) {
          subjects.push(subject);
        }
        break;
      }
    }
  }

  return subjects;
}

/**
 * Calculate SGPA from subjects
 */
function calculateSGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0;

  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const subject of subjects) {
    const gradePoint = GRADE_POINTS[subject.grade] || 0;
    totalGradePoints += gradePoint * subject.credits;
    totalCredits += subject.credits;
  }

  return totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
}

/**
 * Validate extracted data
 */
function validateExtractedData(data) {
  const errors = [];

  if (!data.studentId) errors.push('Student ID not found');
  if (!data.semester) errors.push('Semester not found');
  if (!data.subjects || data.subjects.length === 0) errors.push('No subjects found');
  if (data.sgpa === 0) errors.push('Invalid SGPA calculation');

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Main function: Extract marksheet data from file
 */
export async function extractMarksheetData(file) {
  try {
    // Step 1: Extract text using OCR
    const extractedText = await extractTextFromImage(file);

    // Step 2: Parse student information
    const studentInfo = parseStudentInfo(extractedText);

    // Step 3: Parse subjects and grades
    const subjects = parseSubjects(extractedText);

    // Step 4: Calculate SGPA
    const sgpa = calculateSGPA(subjects);

    // Step 5: Prepare result
    const result = {
      ...studentInfo,
      subjects,
      sgpa: parseFloat(sgpa.toFixed(2)),
      extractedText, // For debugging
      extractedAt: new Date().toISOString()
    };

    // Step 6: Validate
    const validation = validateExtractedData(result);

    return {
      success: validation.isValid,
      data: result,
      errors: validation.errors
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [error.message]
    };
  }
}

/**
 * Process multiple marksheets and build SGPA list
 */
export async function processMultipleMarksheets(files) {
  const results = [];
  const sgpaList = [];

  for (const file of files) {
    const result = await extractMarksheetData(file);
    results.push(result);

    if (result.success && result.data.sgpa) {
      sgpaList.push({
        semester: result.data.semester,
        sgpa: result.data.sgpa
      });
    }
  }

  // Sort by semester
  sgpaList.sort((a, b) => a.semester - b.semester);

  return {
    results,
    sgpaList: sgpaList.map(item => item.sgpa),
    studentId: results[0]?.data?.studentId,
    name: results[0]?.data?.name
  };
}

/**
 * Manual correction interface for extracted data
 */
export function createCorrectionInterface(extractedData) {
  return {
    studentId: extractedData.studentId || '',
    name: extractedData.name || '',
    semester: extractedData.semester || 1,
    subjects: extractedData.subjects || [],
    sgpa: extractedData.sgpa || 0,
    
    // Methods to update data
    updateStudentId(id) { this.studentId = id; },
    updateSemester(sem) { this.semester = sem; },
    updateSubject(index, field, value) {
      if (this.subjects[index]) {
        this.subjects[index][field] = value;
        this.sgpa = calculateSGPA(this.subjects);
      }
    },
    addSubject(subject) {
      this.subjects.push(subject);
      this.sgpa = calculateSGPA(this.subjects);
    },
    removeSubject(index) {
      this.subjects.splice(index, 1);
      this.sgpa = calculateSGPA(this.subjects);
    },
    recalculateSGPA() {
      this.sgpa = calculateSGPA(this.subjects);
      return this.sgpa;
    }
  };
}

/**
 * Convert PDF to images for OCR processing
 */
export async function convertPDFToImages(pdfFile) {
  // This requires pdf.js library
  // For now, return instruction to use image format
  throw new Error('Please convert PDF to images (JPG/PNG) before uploading');
}

/**
 * Enhance image quality before OCR
 */
export function preprocessImage(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Enhance contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale and increase contrast
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const enhanced = avg > 128 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = enhanced;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        resolve(new File([blob], imageFile.name, { type: 'image/png' }));
      });
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Export functions
 */
export {
  GRADE_POINTS,
  calculateSGPA,
  parseStudentInfo,
  parseSubjects,
  validateExtractedData
};
