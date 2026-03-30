const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  recruiter_id: { type: String, required: true, unique: true },
  email: String,
  company: String,
  phone: String,
  website: String,
  industry: String,
  role: String,
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  posted_jobs: [{ type: mongoose.Schema.Types.Mixed }],
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
