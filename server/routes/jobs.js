const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authMiddleware } = require('./middleware');
const { notifyNewJob, notifyStatusChange } = require('./emailService');

const router = express.Router();

// Get all jobs/internships
router.get('/', async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const jobs = await Job.find(filter);
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get jobs by company (all employees see same jobs)
router.get('/recruiter/:company_id', authMiddleware, async (req, res) => {
  try {
    const cid = req.params.company_id;
    // Match by company_id OR recruiter_id to handle legacy jobs
    const jobs = await Job.find({
      $or: [{ company_id: cid }, { recruiter_id: cid }]
    });
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create job/internship
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Fall back to recruiter_id if company_id not in token (legacy accounts)
    const company_id = req.user.company_id || req.user.recruiter_id;
    const job = await new Job({
      ...req.body,
      recruiter_id: req.user.recruiter_id,
      company_id
    }).save();
    res.status(201).json(job);
    // Notify all students asynchronously (non-blocking)
    const Student = require('../models/Student');
    Student.find({}, 'email').then(students => {
      const emails = students.map(s => s.email).filter(Boolean);
      notifyNewJob(job, emails).catch(() => {});
    }).catch(() => {});
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
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Calculate smart match score
    const StudentProfile = require('../models/StudentProfile');
    const profile = await StudentProfile.findOne({ student_id });
    let score = 50; // base

    if (profile) {
      // CGPA score (40 pts) — if min_cgpa set, scale relative to it; else scale to 10
      const minCgpa = job.min_cgpa || 0;
      const cgpa = profile.cgpa || 0;
      if (minCgpa > 0) {
        score = cgpa >= minCgpa
          ? 40 + Math.round(((cgpa - minCgpa) / (10 - minCgpa)) * 20)  // 40-60 pts
          : Math.round((cgpa / minCgpa) * 35);                           // 0-35 pts (below requirement)
      } else {
        score = Math.round((cgpa / 10) * 40);
      }

      // Skills match score (40 pts)
      if (job.description) {
        const jobText = (job.role + ' ' + job.description + ' ' + (job.eligible_branches || '')).toLowerCase();
        const studentSkills = (profile.skills || []).map(s => s.name?.toLowerCase());
        const matched = studentSkills.filter(sk => sk && jobText.includes(sk)).length;
        const skillScore = Math.min(40, matched * 10);
        score += skillScore;
      } else {
        score += 20; // neutral if no description
      }

      // Semester bonus (20 pts) — final year students get higher score for placements
      const sem = profile.semester || 0;
      if (job.type === 'Placement' && sem >= 7) score += 20;
      else if (job.type === 'Placement' && sem >= 5) score += 10;
      else if (job.type === 'Internship' && sem >= 3) score += 20;
      else if (job.type === 'Internship') score += 10;
    }

    score = Math.max(1, Math.min(100, Math.round(score)));

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

// Update application status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('job_id', 'role company type');
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json(app);
    // Notify student asynchronously
    const Student = require('../models/Student');
    Student.findOne({ student_id: app.student_id }, 'email name').then(student => {
      if (student?.email) {
        notifyStatusChange(student.email, student.name, app.job_id, status).catch(() => {});
      }
    }).catch(() => {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search candidates across student profiles
router.get('/candidates/search', authMiddleware, async (req, res) => {
  try {
    const StudentProfile = require('../models/StudentProfile');
    const { skill, dept, minCgpa, maxCgpa, search } = req.query;
    const filter = {};
    if (dept) filter.department = { $regex: dept, $options: 'i' };
    if (minCgpa || maxCgpa) {
      filter.cgpa = {};
      if (minCgpa) filter.cgpa.$gte = parseFloat(minCgpa);
      if (maxCgpa) filter.cgpa.$lte = parseFloat(maxCgpa);
    }
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { student_id: { $regex: search, $options: 'i' } }
    ];
    let students = await StudentProfile.find(filter, 'student_id name email department cgpa sgpaList skills semester');
    if (skill) {
      students = students.filter(s =>
        (s.skills || []).some(sk => sk.name?.toLowerCase().includes(skill.toLowerCase()))
      );
    }
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get applicants by company_id (all employees see same applicants)
router.get('/applicants/:company_id', authMiddleware, async (req, res) => {
  try {
    const cid = req.params.company_id;
    const jobs = await Job.find({
      $or: [{ company_id: cid }, { recruiter_id: cid }]
    });
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ job_id: { $in: jobIds } }).populate('job_id', 'role type');
    res.json(applications);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get applicant counts per job for a company
router.get('/applicant-counts/:company_id', authMiddleware, async (req, res) => {
  try {
    const cid = req.params.company_id;
    const jobs = await Job.find({ $or: [{ company_id: cid }, { recruiter_id: cid }] }, '_id');
    const jobIds = jobs.map(j => j._id);
    const counts = await Application.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      { $group: { _id: '$job_id', count: { $sum: 1 } } }
    ]);
    const map = {};
    counts.forEach(c => { map[c._id.toString()] = c.count; });
    res.json(map);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
