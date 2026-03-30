# AI Marksheet Extraction - Installation Guide

## Required Dependencies

Add the following dependency to your project:

```bash
npm install tesseract.js
```

## Package.json Addition

Add this to your `package.json` dependencies:

```json
{
  "dependencies": {
    "tesseract.js": "^5.0.4"
  }
}
```

## Alternative: Manual Text Entry Component

If you prefer not to use OCR, you can create a manual entry form instead.
See `ManualMarksheetEntry.jsx` for implementation.

## Usage in Your Project

### 1. Import the Component

```javascript
import MarksheetUpload from './components/Student/MarksheetUpload';
```

### 2. Use in Student Dashboard

```javascript
function StudentDashboard() {
  const handleDataExtracted = (data) => {
    console.log('Extracted Data:', data);
    // Save to student profile
    // Update SGPA list for merit ranking
  };

  return (
    <div>
      <MarksheetUpload onDataExtracted={handleDataExtracted} />
    </div>
  );
}
```

### 3. Integrate with Merit Ranking

```javascript
import { sortStudentsByMerit } from './utils/meritSort';

async function updateStudentRanking(studentId, newSGPA) {
  // Get current student data
  const student = getStudentById(studentId);
  
  // Add new SGPA to list
  student.sgpaList.push(newSGPA);
  
  // Recalculate rankings
  const allStudents = getAllStudents();
  const rankedStudents = await sortStudentsByMerit(allStudents);
  
  // Update database
  saveRankings(rankedStudents);
}
```

## File Upload Formats Supported

- **Images**: JPG, PNG, JPEG
- **PDF**: Requires conversion to images first

## OCR Accuracy Tips

1. **Image Quality**: Use high-resolution scans (300 DPI minimum)
2. **Lighting**: Ensure even lighting, no shadows
3. **Orientation**: Keep marksheet straight, not tilted
4. **Contrast**: Black text on white background works best
5. **Format**: Clear, printed marksheets work better than handwritten

## Troubleshooting

### OCR Not Working
- Check if Tesseract.js is properly installed
- Verify image quality and format
- Try preprocessing the image (increase contrast)

### Incorrect Data Extraction
- Use the manual correction interface
- Adjust OCR confidence threshold
- Consider manual entry for complex formats

### Performance Issues
- Process one marksheet at a time
- Compress images before upload
- Use web workers for background processing

## Advanced Configuration

### Custom Grade Mapping

Edit `marksheetExtractor.js`:

```javascript
const GRADE_POINTS = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'D': 4,
  'E': 3,
  'F': 0
};
```

### Custom Text Patterns

Modify regex patterns in `parseSubjects()` function to match your university's marksheet format.

## Security Considerations

1. **File Size Limits**: Implement max file size (5MB recommended)
2. **File Type Validation**: Only allow image formats
3. **Data Sanitization**: Validate extracted data before saving
4. **Privacy**: Process files client-side, don't upload to external servers

## Future Enhancements

- [ ] PDF direct processing
- [ ] Batch processing with progress bar
- [ ] AI model training for better accuracy
- [ ] Support for multiple university formats
- [ ] Automatic semester detection
- [ ] Grade trend visualization
