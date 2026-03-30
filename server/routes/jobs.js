const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authMiddleware } = require('./middleware');

const router = express.Router();

// Get all jobs/internships
router.get('/', async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const jobs = await Job.find(filter);
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get jobs by recruiter
router.get('/recruiter/:recruiter_id', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter_id: req.params.recruiter_id });
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create job/internship (recruiter)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const job = await new Job({ ...req.body, recruiter_id: req.user.recruiter_id || req.user.id }).save();
    res.status(201).json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete job (recruiter)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Apply for job (student)
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const { student_id } = req.body;
    const score = 70 + Math.floor(Math.random() * 30);
    const application = await new Application({
      student_id,
      job_id: req.params.id,
      score
    }).save();
    res.status(201).json(application);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Already applied' });
    res.status(500).json({ error: e.message });
  }
});

// Get applicants for recruiter's jobs
router.get('/applicants/:recruiter_id', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter_id: req.params.recruiter_id });
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ job_id: { $in: jobIds } }).populate('job_id', 'role type');
    res.json(applications);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
