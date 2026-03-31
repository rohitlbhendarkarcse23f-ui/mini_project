const express  = require('express');
const multer   = require('multer');
const FormData = require('form-data');
const http     = require('http');
const https    = require('https');
const axios    = require('axios');

const httpAgent  = new http.Agent({ keepAlive: false });
const httpsAgent = new https.Agent({ keepAlive: false });

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const DOCLING_URL = process.env.DOCLING_URL || 'http://localhost:5001';

async function parseWithDocling(buffer, mimetype, originalname) {
  const form = new FormData();
  form.append('file', buffer, { filename: originalname, contentType: mimetype });

  const res = await axios.post(`${DOCLING_URL}/parse`, form, {
    headers: form.getHeaders(),
    timeout: 300_000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    httpAgent,
    httpsAgent,
    decompress: true,
  });

  return res.data;
}

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const { buffer, mimetype, originalname } = req.file;
    const result = await parseWithDocling(buffer, mimetype, originalname);
    console.log('Docling result:', JSON.stringify(result).slice(0, 300));
    return res.json(result);
  } catch (err) {
    const msg = err.response?.data?.detail || err.response?.data?.error || err.message || err.code || String(err);
    console.error('Marksheet route error:', msg);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack?.split('\n')[0]);
    return res.status(502).json({ success: false, data: null, confidence: 0, method: 'none', errors: [msg] });
  }
});

module.exports = router;
