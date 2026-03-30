const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware: verify JWT
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Lazy model cache
const getModel = (collection) => {
  if (mongoose.modelNames().includes(collection)) return mongoose.model(collection);
  const schema = new mongoose.Schema({ _docId: { type: String, unique: true } }, { strict: false });
  return mongoose.model(collection, schema);
};

router.get('/:collection', auth, async (req, res) => {
  try {
    const docs = await getModel(req.params.collection).find();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:collection/:id', auth, async (req, res) => {
  try {
    const doc = await getModel(req.params.collection).findOne({ _docId: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:collection/:id', auth, async (req, res) => {
  try {
    const doc = await getModel(req.params.collection).findOneAndUpdate(
      { _docId: req.params.id },
      { ...req.body, _docId: req.params.id },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:collection/:id', auth, async (req, res) => {
  try {
    const doc = await getModel(req.params.collection).findOneAndUpdate(
      { _docId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:collection/:id', auth, async (req, res) => {
  try {
    await getModel(req.params.collection).findOneAndDelete({ _docId: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
