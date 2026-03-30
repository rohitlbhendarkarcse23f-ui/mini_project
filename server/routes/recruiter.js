const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Recruiter = require('../models/Recruiter');
const RecruiterProfile = require('../models/RecruiterProfile');
const { authMiddleware } = require('./middleware');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { company, email, phone, website, industry, role, password } = req.body;

    if (await Recruiter.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const recruiter_id = 'REC' + Date.now();
    const recruiter = await new Recruiter({
      recruiter_id, company, email, phone, website, industry, role, password: hashedPassword
    }).save();

    // Create recruiter profile
    await new RecruiterProfile({ recruiter_id, company, email, phone, website, industry, role }).save();

    const token = jwt.sign({ id: recruiter._id, recruiter_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...recruiterData } = recruiter.toObject();
    res.status(201).json({ token, recruiter: recruiterData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter || !(await bcrypt.compare(password, recruiter.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: recruiter._id, recruiter_id: recruiter.recruiter_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...recruiterData } = recruiter.toObject();
    res.json({ token, recruiter: recruiterData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recruiter profile
router.get('/profile/:recruiter_id', authMiddleware, async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ recruiter_id: req.params.recruiter_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update recruiter profile
router.put('/profile/:recruiter_id', authMiddleware, async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOneAndUpdate(
      { recruiter_id: req.params.recruiter_id },
      { ...req.body, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
