const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  recruiter_id: { type: String, unique: true },
  company: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  website: String,
  industry: String,
  role: String,
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
