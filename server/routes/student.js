const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const { authMiddleware } = require('./middleware');

const router = express.Router();

// Get all students (teacher/merit list)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profiles = await StudentProfile.find({}, '-__v');
    res.json(profiles);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get profile
router.get('/:student_id', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ student_id: req.params.student_id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create or update full profile
router.put('/:student_id', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { ...req.body, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update skills
router.put('/:student_id/skills', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { skills: req.body.skills, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile.skills);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update experiences
router.put('/:student_id/experiences', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { experiences: req.body.experiences, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile.experiences);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update certificates
router.put('/:student_id/certificates', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { certificates: req.body.certificates, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile.certificates);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update marksheets
router.put('/:student_id/marksheets', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { marksheets: req.body.marksheets, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(profile.marksheets);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Register for event
router.post('/:student_id/events/:event_id', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { $addToSet: { registered_events: parseInt(req.params.event_id) }, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json({ registered_events: profile.registered_events });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Join club
router.post('/:student_id/clubs/:club_id', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { $addToSet: { joined_clubs: parseInt(req.params.club_id) }, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json({ joined_clubs: profile.joined_clubs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Apply for job
router.post('/:student_id/jobs/:job_id', authMiddleware, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { student_id: req.params.student_id },
      { $addToSet: { applied_jobs: req.params.job_id }, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json({ applied_jobs: profile.applied_jobs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
