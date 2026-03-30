const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { student_id, email, password } = req.body;

    if (!email.endsWith('@kdkce.edu.in')) {
      return res.status(400).json({ error: 'Only kdkce.edu.in emails are allowed' });
    }

    const existingStudent = await Student.findOne({ student_id });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student ID already registered' });
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { name, phone, department, year, semester } = req.body;

    const student = new Student({
      student_id, email, password: hashedPassword,
      name, phone, department, year, semester
    });

    await student.save();
    const token = jwt.sign(
      { id: student._id, student_id: student.student_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, student_id: student.student_id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const student = await Student.findOne({
      $or: [{ student_id: identifier }, { email: identifier }]
    });

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student._id, student_id: student.student_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year,
      semester: student.semester
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
