import '../StudentDashboard.css';
import '../StudentDashboard2.css';
import '../../../theme.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getRemovedEvents } from '../../../utils/eventsStore';
import { getJobs, getInternships, applyForJob } from '../../../utils/jobsStore';
import { getClubs } from '../../../utils/clubsStore';
import MarksheetUpload from '../MarksheetUpload';
import AIMarksheetUpload from '../MarksheetUpload';
import { getStudentProfile, saveStudentProfile, saveSkills, saveExperiences, saveCertificates, saveMarksheets, uploadFile } from '../../../api/profiles';
import { toast } from '../../Toast';

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Other'
];

function PaymentsContent() {
  const student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
  const [filter, setFilter] = useState('Pending');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  const payments = [
    { id: 1, title: 'Hostel Fee', semester: '2025-26 · Semester 5', amount: 25000, due: 'Due 15 Mar 2026', status: 'pending', transactionId: null },
    { id: 2, title: 'Library Fee', semester: '2025-26 · Semester 5', amount: 2000, due: 'Due 31 Mar 2026', status: 'pending', transactionId: null },
    { id: 3, title: 'Tuition Fee', semester: '2025-26 · Semester 5', amount: 45000, due: 'Paid 10 Jan 2026', status: 'paid', transactionId: 'TXN123456789', paidDate: '10 Jan 2026' },
    { id: 4, title: 'Lab Fee', semester: '2025-26 · Semester 5', amount: 8000, due: 'Paid 10 Jan 2026', status: 'paid', transactionId: 'TXN987654321', paidDate: '10 Jan 2026' },
    { id: 5, title: 'Sports Fee', semester: '2025-26 · Semester 5', amount: 1500, due: 'Paid 10 Jan 2026', status: 'paid', transactionId: 'TXN456789123', paidDate: '10 Jan 2026' }
  ];

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  
  const filtered = payments.filter(p => filter === 'Pending' ? p.status === 'pending' : p.status === 'paid');
  
  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };
  
  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };
  
  const handleProcessPayment = () => {
    setShowPaymentModal(false);
    toast('Payment processed successfully!');
  };

  const handleDownloadReceipt = async (payment) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const W = 148;
    doc.setFillColor(30, 58, 138); doc.rect(0, 0, W, 28, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text('Smart Campus', 10, 12);
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text('KDK College of Engineering', 10, 20);
    doc.text('PAYMENT RECEIPT', W - 10, 12, { align: 'right' });
    let y = 38;
    doc.setTextColor(30,30,30); doc.setFontSize(10);
    const row = (l, v) => { doc.setFont('helvetica','bold'); doc.text(l, 10, y); doc.setFont('helvetica','normal'); doc.text(String(v), 80, y); y += 8; };
    row('Student Name:', student.name || student.email?.split('@')[0] || 'Student');
    row('Student ID:', student.student_id || 'N/A');
    row('Payment Type:', payment.title);
    row('Semester:', payment.semester);
    row('Transaction ID:', payment.transactionId || 'N/A');
    row('Payment Date:', payment.paidDate || new Date().toLocaleDateString('en-IN'));
    doc.setDrawColor(200,200,200); doc.line(10, y, W - 10, y); y += 8;
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.text('Amount Paid:', 10, y); doc.setTextColor(22,163,74);
    doc.text(`Rs. ${payment.amount.toLocaleString()}`, 80, y);
    y += 14; doc.setTextColor(150,150,150); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text('This is a computer-generated receipt.', W / 2, y, { align: 'center' });
    doc.save(`receipt_${payment.title.replace(/\s+/g,'_')}.pdf`);
    toast('Receipt downloaded!');
  };

  return (
    <div className="payments-content">
      <div className="payments-header">
        <div>
          <h2>Fee Management</h2>
          <p>Track and manage your fee payments</p>
        </div>
      </div>
      <div className="payment-summary">
        <div className="summary-card pending">
          <div className="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3>₹{totalPending.toLocaleString()}</h3>
          <p>Total Pending</p>
        </div>
        <div className="summary-card paid">
          <div className="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3>₹{totalPaid.toLocaleString()}</h3>
          <p>Total Paid</p>
        </div>
        <div className="summary-card dues">
          <div className="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h3>{pendingCount}</h3>
          <p>Pending Dues</p>
        </div>
      </div>
      <div className="payment-filters">
        <button className={filter === 'Pending' ? 'active' : ''} onClick={() => setFilter('Pending')}>Pending ({pendingCount})</button>
        <button className={filter === 'Paid' ? 'active' : ''} onClick={() => setFilter('Paid')}>Paid ({paidCount})</button>
      </div>
      <div className="payments-list">
        {filtered.map(payment => (
          <div key={payment.id} className="payment-item">
            <div className="payment-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div className="payment-details">
              <h3>{payment.title}</h3>
              <p>{payment.semester}</p>
            </div>
            <div className="payment-amount">
              <h3>₹{payment.amount.toLocaleString()}</h3>
              <p className="payment-due">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {payment.due}
              </p>
            </div>
            {payment.status === 'pending' ? (
              <button className="pay-now-btn" onClick={() => handlePayNow(payment)}>Pay Now</button>
            ) : (
              <button className="view-receipt-btn" onClick={() => handleViewReceipt(payment)}>View Receipt</button>
            )}
          </div>
        ))}
      </div>
      
      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Gateway</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="payment-summary-header">
                  <div className="payment-icon-large">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <h3>{selectedPayment.title}</h3>
                    <p>{selectedPayment.semester}</p>
                  </div>
                </div>
                <div className="payment-amount-display">
                  <span>Total Amount</span>
                  <strong>₹{selectedPayment.amount.toLocaleString()}</strong>
                </div>
              </div>
              <div className="payment-methods">
                <h4>Payment Method</h4>
                <div className="payment-method-options">
                  <label className="payment-option selected">
                    <input type="radio" name="payment" value="upi" checked readOnly />
                    <div className="payment-option-content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#60a5fa">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>UPI Payment</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Enter UPI ID</label>
                <input type="text" placeholder="yourname@paytm" />
              </div>
              <button className="save-changes-btn" onClick={handleProcessPayment}>Pay ₹{selectedPayment.amount.toLocaleString()}</button>
            </div>
          </div>
        </div>
      )}
      
      {showReceipt && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceipt(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-content">
                <div className="receipt-header">
                  <h3>Smart Campus</h3>
                  <p>KDK College of Engineering</p>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-details">
                  <div className="receipt-row">
                    <span>Student Name:</span>
                    <strong>{student.name || student.email?.split('@')[0] || 'Student'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Student ID:</span>
                    <strong>{student.student_id || 'N/A'}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Type:</span>
                    <strong>{selectedPayment.title}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Semester:</span>
                    <strong>{selectedPayment.semester}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction ID:</span>
                    <strong>{selectedPayment.transactionId}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Date:</span>
                    <strong>{selectedPayment.paidDate}</strong>
                  </div>
                  <div className="receipt-divider"></div>
                  <div className="receipt-row receipt-total">
                    <span>Amount Paid:</span>
                    <strong>₹{selectedPayment.amount.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="receipt-footer">
                  <p>This is a computer-generated receipt</p>
                </div>
              </div>
              <button className="save-changes-btn" onClick={() => handleDownloadReceipt(selectedPayment)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsContent;
