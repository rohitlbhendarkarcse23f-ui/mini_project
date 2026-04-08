const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Recruiter = require('../models/Recruiter');
const RecruiterProfile = require('../models/RecruiterProfile');
const { authMiddleware } = require('./middleware');

const router = express.Router();

// ── Register a NEW company (first employee becomes admin) ─────────
router.post('/signup', async (req, res) => {
  try {
    const { company, email, phone, website, industry, role, password } = req.body;

    if (await Recruiter.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const recruiter_id = 'REC' + Date.now();
    const company_id   = 'CMP' + Date.now();

    const recruiter = await new Recruiter({
      recruiter_id, company_id, company, email, phone,
      website, industry, role, is_admin: true, password: hashedPassword
    }).save();

    // Create shared company profile
    await new RecruiterProfile({ company_id, company, email, phone, website, industry }).save();

    const token = jwt.sign(
      { id: recruiter._id, recruiter_id, company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...data } = recruiter.toObject();
    res.status(201).json({ token, recruiter: data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Join an EXISTING company using company_id code ────────────────
router.post('/join', async (req, res) => {
  try {
    const { company_id, email, phone, role, password } = req.body;

    if (!company_id) return res.status(400).json({ error: 'Company code is required' });

    const profile = await RecruiterProfile.findOne({ company_id });
    if (!profile) return res.status(404).json({ error: 'Invalid company code. No company found.' });

    if (await Recruiter.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const recruiter_id = 'REC' + Date.now();

    const recruiter = await new Recruiter({
      recruiter_id, company_id,
      company: profile.company,
      email, phone, role,
      is_admin: false,
      password: hashedPassword
    }).save();

    const token = jwt.sign(
      { id: recruiter._id, recruiter_id, company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...data } = recruiter.toObject();
    res.status(201).json({ token, recruiter: data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Sign in ───────────────────────────────────────────────────────
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    let recruiter = await Recruiter.findOne({ email });
    if (!recruiter || !(await bcrypt.compare(password, recruiter.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    // Backfill company_id for legacy accounts that predate the company_id field
    if (!recruiter.company_id) {
      recruiter.company_id = recruiter.recruiter_id;
      await recruiter.save();
    }

    const token = jwt.sign(
      { id: recruiter._id, recruiter_id: recruiter.recruiter_id, company_id: recruiter.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...data } = recruiter.toObject();
    res.json({ token, recruiter: data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Get all employees of a company ───────────────────────────────
router.get('/team/:company_id', authMiddleware, async (req, res) => {
  try {
    const members = await Recruiter.find(
      { company_id: req.params.company_id },
      '-password'
    );
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Get company profile ───────────────────────────────────────────
router.get('/profile/:company_id', authMiddleware, async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ company_id: req.params.company_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Update company profile (admin only) ──────────────────────────
router.put('/profile/:company_id', authMiddleware, async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOneAndUpdate(
      { company_id: req.params.company_id },
      { ...req.body, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
