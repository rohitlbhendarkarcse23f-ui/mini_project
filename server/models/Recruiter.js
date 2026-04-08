const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  recruiter_id: { type: String, unique: true },   // individual ID
  company_id:   { type: String, index: true },     // shared across all employees of same company
  company:      { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  phone:        String,
  website:      String,
  industry:     String,
  role:         String,                            // job title of this employee
  is_admin:     { type: Boolean, default: false }, // first registrant is admin
  password:     { type: String, required: true },
  created_at:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
