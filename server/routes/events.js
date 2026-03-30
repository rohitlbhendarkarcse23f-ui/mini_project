const express = require('express');
const Event = require('../models/Event');
const { authMiddleware } = require('./middleware');

const router = express.Router();

// Get all active events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ is_removed: false }, '-registrations');
    res.json(events);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create event (teacher)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const event_id = Date.now();
    const event = await new Event({ ...req.body, event_id, created_by: req.user.id }).save();
    res.status(201).json(event);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Remove event (teacher)
router.delete('/:event_id', authMiddleware, async (req, res) => {
  try {
    await Event.findOneAndUpdate({ event_id: parseInt(req.params.event_id) }, { is_removed: true });
    res.json({ message: 'Event removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Register student for event
router.post('/:event_id/register', authMiddleware, async (req, res) => {
  try {
    const { student_id, email, name, phone, department } = req.body;
    const event = await Event.findOne({ event_id: parseInt(req.params.event_id) });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const alreadyRegistered = event.registrations.some(r => r.student_id === student_id);
    if (alreadyRegistered) return res.status(400).json({ error: 'Already registered' });

    event.registrations.push({ student_id, email, name, phone, department });
    event.registered_count += 1;
    await event.save();
    res.json({ registered_count: event.registered_count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get registrations for an event (teacher download)
router.get('/:event_id/registrations', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: parseInt(req.params.event_id) });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event.registrations);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
