const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('./middleware');

const router = express.Router();

const messageSchema = new mongoose.Schema({
  room_id: { type: String, required: true, index: true },
  sender_id: String,
  sender_name: String,
  text: String,
  created_at: { type: Date, default: Date.now }
});
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

const roomSchema = new mongoose.Schema({
  room_id: { type: String, unique: true },
  name: String,
  type: { type: String, enum: ['group', 'personal'], default: 'group' },
  members: [String],
  created_at: { type: Date, default: Date.now }
});
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

// Seed default rooms if none exist
async function seedRooms() {
  const count = await Room.countDocuments();
  if (count === 0) {
    await Room.insertMany([
      { room_id: 'cse_batch_2024', name: 'CSE Batch 2024', type: 'group' },
      { room_id: 'placement_cell', name: 'Placement Cell', type: 'group' },
      { room_id: 'tech_club', name: 'Tech Club', type: 'group' },
    ]);
  }
}
seedRooms().catch(() => {});

// GET /api/messages/rooms
router.get('/rooms', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ created_at: 1 });
    // Attach last message to each room
    const withLast = await Promise.all(rooms.map(async r => {
      const last = await Message.findOne({ room_id: r.room_id }).sort({ created_at: -1 });
      return { ...r.toObject(), lastMsg: last?.text || '', lastTime: last?.created_at || r.created_at };
    }));
    res.json(withLast);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/messages/:room_id?since=<iso>
router.get('/:room_id', authMiddleware, async (req, res) => {
  try {
    const query = { room_id: req.params.room_id };
    if (req.query.since) query.created_at = { $gt: new Date(req.query.since) };
    const msgs = await Message.find(query).sort({ created_at: 1 }).limit(100);
    res.json(msgs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/messages/:room_id
router.post('/:room_id', authMiddleware, async (req, res) => {
  try {
    const { text, sender_name } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Empty message' });
    const msg = await Message.create({
      room_id: req.params.room_id,
      sender_id: req.user?.id || req.user?.student_id || 'unknown',
      sender_name: sender_name || 'Unknown',
      text: text.trim()
    });
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SSE endpoint for real-time notifications
router.get('/stream', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Send initial snapshot
  try {
    const Event = require('../models/Event');
    const Job   = require('../models/Job');
    const [events, jobs] = await Promise.all([
      Event.find().sort({ created_at: -1 }).limit(5).lean(),
      Job.find().sort({ created_at: -1 }).limit(5).lean()
    ]);
    send({ type: 'init', events, jobs });
  } catch { send({ type: 'init', events: [], jobs: [] }); }

  // Heartbeat every 25s to keep connection alive
  const hb = setInterval(() => res.write(': heartbeat\n\n'), 25000);
  req.on('close', () => clearInterval(hb));
});

module.exports = router;
