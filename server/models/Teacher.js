const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacher_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  department: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', teacherSchema);
