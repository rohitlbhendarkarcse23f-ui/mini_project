const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  logo: String,
  location: String,
  salary: String,
  deadline: String,
  color: String,
  type: { type: String, enum: ['Placement', 'Internship'], required: true },
  recruiter_id: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
