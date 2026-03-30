# AI-Powered Marksheet Extraction Setup Guide

## Overview
This system uses Google's Gemini AI to automatically extract student data, subjects, and grades from uploaded marksheet images or PDFs.

## Features
- ✅ **Automatic Data Extraction** - AI reads and extracts all information
- ✅ **Multi-format Support** - Works with images (JPG, PNG) and PDFs
- ✅ **Smart Recognition** - Identifies student ID, name, semester, subjects, grades
- ✅ **Auto SGPA Calculation** - Calculates SGPA automatically
- ✅ **Edit Mode** - Review and correct extracted data before saving
- ✅ **Free Tier Available** - Google Gemini offers free API usage

## Setup Instructions

### Step 1: Get Gemini API Key (FREE)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Add API Key to Project

1. Open `.env` file in project root
2. Add your API key:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Update Component

Replace the old MarksheetUpload component with AIMarksheetUpload:

```javascript
// In StudentDashboard.jsx
import AIMarksheetUpload from './AIMarksheetUpload';

// Use it in your modal
<AIMarksheetUpload onDataExtracted={(data) => {
  console.log('Extracted:', data);
  // Save to student profile
}} />
```

## How It Works

### 1. Student Uploads Marksheet
- Supports: JPG, PNG, PDF
- Max size: 10MB
- Clear, readable images work best

### 2. AI Analyzes Document
- Gemini AI reads the entire document
- Extracts: Student ID, Name, Semester, Branch
- Identifies all subjects with codes, names, credits, grades

### 3. Data Validation
- Student can review extracted data
- Edit mode allows corrections
- SGPA recalculates automatically

### 4. Save to Profile
- Data saved to student profile
- SGPA added to sgpaList for merit ranking
- Ready for merit calculation

## Example Extracted Data

```json
{
  "studentId": "kf23cs164",
  "name": "Rahul Sharma",
  "semester": 3,
  "branch": "Computer Science",
  "subjects": [
    {
      "code": "CS301",
      "name": "Data Structures",
      "credits": "4",
      "grade": "A+",
      "marks": "92"
    },
    {
      "code": "CS302",
      "name": "Operating Systems",
      "credits": "4",
      "grade": "O",
      "marks": "95"
    }
  ],
  "sgpa": 9.25
}
```

## API Usage & Limits

### Free Tier (Gemini 1.5 Flash)
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**
- Perfect for campus use (100-500 students)

### Cost (if exceeding free tier)
- Very affordable
- ~$0.00001 per request
- Even 10,000 extractions = ~$0.10

## Supported Marksheet Formats

✅ **Works with:**
- University marksheets (any format)
- Grade cards
- Transcripts
- Semester result sheets
- Typed or printed documents

❌ **May struggle with:**
- Handwritten marksheets
- Very low quality scans
- Heavily watermarked documents
- Rotated or skewed images

## Tips for Best Results

1. **Image Quality**
   - Use clear, high-resolution scans
   - Ensure good lighting
   - Avoid shadows and glare

2. **Document Orientation**
   - Keep marksheet straight
   - Crop unnecessary borders
   - Remove background objects

3. **File Format**
   - PDF works best for multi-page documents
   - JPG/PNG for single-page marksheets
   - Compress large files before upload

## Troubleshooting

### "API Key Invalid"
- Check if API key is correctly added to `.env`
- Ensure no extra spaces in the key
- Restart development server after adding key

### "Extraction Failed"
- Try a clearer image
- Check if marksheet is readable
- Use edit mode to manually correct data

### "No JSON Found"
- AI couldn't parse the document
- Try a different image
- Use manual entry as fallback

## Alternative: Manual Entry

If AI extraction fails, the system automatically falls back to manual entry mode where students can input data themselves.

## Integration with Merit Ranking

Extracted SGPA is automatically:
1. Added to student's sgpaList
2. Used in 4-step merit ranking algorithm
3. Displayed in teacher's merit list
4. Updated in real-time

## Privacy & Security

- ✅ Images processed via Google's secure API
- ✅ No data stored by Google (per their policy)
- ✅ Extracted data saved only in your database
- ✅ Students can review before saving
- ✅ GDPR compliant

## Support

For issues:
1. Check console for error messages
2. Verify API key is active
3. Test with sample marksheet
4. Use manual entry as backup

---

**Ready to use!** Just add your Gemini API key and start uploading marksheets. 🚀
