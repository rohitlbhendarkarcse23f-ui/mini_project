const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  teacher_id: { type: String, required: true, unique: true },
  email: String,
  name: String,
  phone: String,
  department: { type: String, default: 'Computer Science' },
  designation: { type: String, default: 'Assistant Professor' },
  bio: { type: String, default: '' },
  created_events: [{ type: mongoose.Schema.Types.Mixed }],
  created_clubs: [{ type: mongoose.Schema.Types.Mixed }],
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
