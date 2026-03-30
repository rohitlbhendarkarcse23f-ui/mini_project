const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  event_id: { type: Number, unique: true },
  type: String,
  title: { type: String, required: true },
  desc: String,
  date: String,
  time: String,
  location: String,
  capacity: { type: Number, default: 100 },
  registered_count: { type: Number, default: 0 },
  days_left: Number,
  color: String,
  is_removed: { type: Boolean, default: false },
  created_by: String,
  registrations: [{
    student_id: String,
    email: String,
    name: String,
    phone: String,
    department: String,
    registered_at: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
