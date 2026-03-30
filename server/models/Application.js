const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['applied', 'shortlisted', 'rejected'], default: 'applied' },
  applied_at: { type: Date, default: Date.now }
});

applicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
