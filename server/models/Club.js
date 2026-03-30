const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  club_id: { type: Number, unique: true },
  name: { type: String, required: true },
  desc: String,
  members: { type: Number, default: 0 },
  category: String,
  icon: String,
  color: String,
  whatsapp: String,
  gpay: String,
  fee: { type: Number, default: 500 },
  memberships: [{
    student_id: String,
    email: String,
    phone: String,
    transaction_id: String,
    joined_at: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Club', clubSchema);
