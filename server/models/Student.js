const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  phone: String,
  department: String,
  year: Number,
  semester: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
