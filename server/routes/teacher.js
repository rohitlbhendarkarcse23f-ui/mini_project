const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const Teacher = require('../models/Teacher');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const { authMiddleware } = require('./middleware');

const router = express.Router();

// GET /api/teachers/marksheets/all — list every student's uploaded marksheet files
router.get('/marksheets/all', authMiddleware, async (req, res) => {
  try {
    const students = await StudentProfile.find(
      { 'marksheets.0': { $exists: true } },
      'student_id name department marksheets sgpaList cgpa'
    );
    const result = students.map(s => ({
      student_id: s.student_id,
      name: s.name,
      department: s.department,
      cgpa: s.cgpa,
      sgpaList: s.sgpaList,
      marksheets: (s.marksheets || []).map(m => ({
        semester: m.semester,
        sgpa: m.sgpa,
        file_url: m.file_url,
        hasFile: !!m.file_url,
        subjectCount: (m.subjects || []).length,
      }))
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/teachers/marksheets/file?url=... — proxy a stored marksheet file to the teacher
router.get('/marksheets/file', authMiddleware, (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url param required' });
    // url is like /uploads/marksheet/filename.pdf
    const filePath = path.join(__dirname, '..', url);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.sendFile(filePath);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Teacher signup
router.post('/signup', async (req, res) => {
  try {
    const { teacher_id, email, password, name, department } = req.body;
    if (await Teacher.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const teacher = await new Teacher({ teacher_id, email, password: hashed, name, department }).save();
    const token = jwt.sign({ id: teacher._id, teacher_id: teacher.teacher_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, teacher: { teacher_id: teacher.teacher_id, email: teacher.email, name: teacher.name, department: teacher.department } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Teacher signin
router.post('/signin', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const teacher = await Teacher.findOne({ $or: [{ email: identifier }, { teacher_id: identifier }] });
    if (!teacher) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: teacher._id, teacher_id: teacher.teacher_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, teacher: { teacher_id: teacher.teacher_id, email: teacher.email, name: teacher.name, department: teacher.department } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get teacher profile
router.get('/:teacher_id', authMiddleware, async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ teacher_id: req.params.teacher_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create or update teacher profile
router.put('/:teacher_id', authMiddleware, async (req, res) => {
  try {
    const profile = await TeacherProfile.findOneAndUpdate(
      { teacher_id: req.params.teacher_id },
      { ...req.body, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
