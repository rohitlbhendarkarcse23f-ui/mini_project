const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  company_id:  { type: String, required: true, unique: true },
  company:     String,
  email:       String,   // primary contact email
  phone:       String,
  website:     String,
  industry:    String,
  description: { type: String, default: '' },
  logo:        { type: String, default: '' },
  updated_at:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
