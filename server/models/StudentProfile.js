const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  email: String,
  phone: String,
  name: String,
  department: { type: String, default: '' },
  bio: { type: String, default: '' },
  semester: { type: Number, default: 1 },
  year: { type: Number, default: 1 },
  cgpa: { type: Number, default: 0 },
  skills: [{ name: String, percent: Number, color: String }],
  experiences: [{ role: String, company: String, duration: String, type: String, desc: String, link: String, file_url: String }],
  certificates: [{ name: String, issuer: String, year: String, link: String, file_url: String }],
  marksheets: [{ semester: Number, sgpa: Number, subjects: [{ name: String, credits: Number, grade: String }], file_url: String }],
  sgpaList: [Number],
  semesterData: { type: mongoose.Schema.Types.Mixed, default: {} },
  resume_url: { type: String, default: '' },
  joined_clubs: [{ type: mongoose.Schema.Types.Mixed }],
  registered_events: [{ type: mongoose.Schema.Types.Mixed }],
  applied_jobs: [{ type: mongoose.Schema.Types.Mixed }],
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
