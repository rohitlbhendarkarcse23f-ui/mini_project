const express = require('express');
const Club = require('../models/Club');
const { authMiddleware } = require('./middleware');

const router = express.Router();

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find({}, '-memberships');
    res.json(clubs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create club (teacher)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const club_id = Date.now();
    const club = await new Club({ ...req.body, club_id }).save();
    res.status(201).json(club);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete club (teacher)
router.delete('/:club_id', authMiddleware, async (req, res) => {
  try {
    await Club.findOneAndDelete({ club_id: parseInt(req.params.club_id) });
    res.json({ message: 'Club deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update member count
router.patch('/:club_id/members', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findOneAndUpdate(
      { club_id: parseInt(req.params.club_id) },
      { $inc: { members: 1 } },
      { new: true }
    );
    res.json({ members: club.members });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Join club (student)
router.post('/:club_id/join', authMiddleware, async (req, res) => {
  try {
    const { student_id, email, phone, transaction_id } = req.body;
    const club = await Club.findOne({ club_id: parseInt(req.params.club_id) });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const alreadyMember = club.memberships.some(m => m.student_id === student_id);
    if (alreadyMember) return res.status(400).json({ error: 'Already a member' });

    club.memberships.push({ student_id, email, phone, transaction_id });
    club.members += 1;
    await club.save();
    res.json({ members: club.members });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get club members (teacher download)
router.get('/:club_id/members', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findOne({ club_id: parseInt(req.params.club_id) });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club.memberships);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
