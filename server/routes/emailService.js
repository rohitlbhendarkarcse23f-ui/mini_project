const nodemailer = require('nodemailer');

// Transporter — uses env vars; silently skips if not configured
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,   // Gmail App Password (not account password)
    },
  });
  return transporter;
}

const FROM = `"Smart Campus" <${process.env.SMTP_USER || 'noreply@smartcampus.edu'}>`;

// ── Generic send ──────────────────────────────────────────────────
async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) return; // SMTP not configured — skip silently
  try {
    await t.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
  }
}

// ── Templates ─────────────────────────────────────────────────────
function baseTemplate(content) {
  return `
  <div style="font-family:Inter,sans-serif;background:#0f172a;color:white;padding:0;margin:0;">
    <div style="max-width:560px;margin:0 auto;background:#0B0F19;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div style="background:linear-gradient(135deg,#1e3a8a,#1e40af);padding:28px 32px;display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;">SC</div>
        <div>
          <div style="font-size:18px;font-weight:700;">Smart Campus</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.6);">KDK College of Engineering</div>
        </div>
      </div>
      <div style="padding:32px;">${content}</div>
      <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-align:center;">
        This is an automated notification from Smart Campus. Do not reply to this email.
      </div>
    </div>
  </div>`;
}

// ── Notification functions ────────────────────────────────────────

/**
 * Notify all students when a new job/internship is posted.
 * @param {Object} job  - Job document
 * @param {Array}  emails - Array of student email strings
 */
async function notifyNewJob(job, emails) {
  if (!emails?.length) return;
  const type = job.type === 'Internship' ? 'Internship' : 'Job Placement';
  const color = job.type === 'Internship' ? '#10b981' : '#3b82f6';
  const html = baseTemplate(`
    <h2 style="font-size:20px;margin:0 0 8px;">New ${type} Posted 🎉</h2>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">A new opportunity is available on Smart Campus.</p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:700;margin-bottom:4px;">${job.role}</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:16px;">${job.company}</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:rgba(255,255,255,0.7);">
        <div>📍 ${job.location}</div>
        <div>💰 ${job.salary}</div>
        <div>⏰ Deadline: ${job.deadline}</div>
        ${job.min_cgpa ? `<div>📚 Min CGPA: ${job.min_cgpa}</div>` : ''}
        ${job.eligible_branches ? `<div>🏫 Eligible: ${job.eligible_branches}</div>` : ''}
      </div>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard" 
         style="display:inline-block;padding:12px 28px;background:${color};border-radius:10px;color:white;font-weight:600;font-size:14px;text-decoration:none;">
        View & Apply Now
      </a>
    </div>
  `);
  // Send in batches to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await sendMail({ to: batch.join(','), subject: `New ${type}: ${job.role} at ${job.company}`, html });
  }
}

/**
 * Notify a student when their application status changes.
 * @param {string} studentEmail
 * @param {string} studentName
 * @param {Object} job   - { role, company, type }
 * @param {string} status - new status
 */
async function notifyStatusChange(studentEmail, studentName, job, status) {
  const statusConfig = {
    shortlisted: { label: 'Shortlisted ✅', color: '#3b82f6', msg: 'Congratulations! You have been shortlisted for the next round.' },
    interview:   { label: 'Interview Scheduled 📅', color: '#f59e0b', msg: 'You have been selected for an interview. Please check your dashboard for details.' },
    hired:       { label: 'Offer Extended 🎉', color: '#10b981', msg: 'Congratulations! You have received an offer. Please check your dashboard.' },
    rejected:    { label: 'Application Update', color: '#6b7280', msg: 'Thank you for applying. Unfortunately, your application was not selected this time.' },
  };
  const cfg = statusConfig[status];
  if (!cfg) return;

  const html = baseTemplate(`
    <h2 style="font-size:20px;margin:0 0 8px;">Application Update</h2>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">Hi ${studentName || 'Student'},</p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px;">${job.role}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">${job.company} · ${job.type}</div>
      <div style="display:inline-block;padding:6px 16px;background:${cfg.color}22;border:1px solid ${cfg.color}44;border-radius:8px;color:${cfg.color};font-weight:600;font-size:13px;">
        ${cfg.label}
      </div>
    </div>
    <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0 0 24px;">${cfg.msg}</p>
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard"
         style="display:inline-block;padding:12px 28px;background:#3b82f6;border-radius:10px;color:white;font-weight:600;font-size:14px;text-decoration:none;">
        View Dashboard
      </a>
    </div>
  `);
  await sendMail({ to: studentEmail, subject: `Application Update: ${job.role} at ${job.company}`, html });
}

/**
 * Notify all students when a new event is created.
 * @param {Object} event
 * @param {Array}  emails
 */
async function notifyNewEvent(event, emails) {
  if (!emails?.length) return;
  const html = baseTemplate(`
    <h2 style="font-size:20px;margin:0 0 8px;">New Event: ${event.title} 📢</h2>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">A new campus event has been scheduled.</p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:700;margin-bottom:4px;">${event.title}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">${event.desc || ''}</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:rgba(255,255,255,0.7);">
        <div>📅 ${event.date} at ${event.time}</div>
        <div>📍 ${event.location}</div>
        <div>🏷️ ${event.type}</div>
      </div>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard"
         style="display:inline-block;padding:12px 28px;background:#8b5cf6;border-radius:10px;color:white;font-weight:600;font-size:14px;text-decoration:none;">
        Register Now
      </a>
    </div>
  `);
  const batchSize = 50;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await sendMail({ to: batch.join(','), subject: `New Event: ${event.title}`, html });
  }
}

module.exports = { notifyNewJob, notifyStatusChange, notifyNewEvent };
