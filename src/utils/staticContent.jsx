import React from 'react';

export const STATIC_CONTENT = {
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: 'August 15, 2024',
    content: (
      <>
        <p>At Campus Connect, accessible from campusconnect.edu, one of our main priorities is the privacy of our students, teachers, and recruiters. This Privacy Policy document contains types of information that is collected and recorded by Campus Connect and how we use it.</p>
        
        <h3>Information We Collect</h3>
        <p>We collect personal information that you voluntarily provide to us when you register on the platform. This includes:</p>
        <ul>
          <li><strong>Student Data:</strong> Name, university roll numbers, uploaded marksheets, resulting SGPA calculations, and extracurricular portfolios.</li>
          <li><strong>Recruiter Data:</strong> Company details, verified corporate email addresses, and active job postings.</li>
          <li><strong>Teacher Data:</strong> Faculty ID, department associations, and generated merit lists.</li>
        </ul>

        <h3>How We Use Your Information</h3>
        <p>We use the information we collect in various ways, including to:</p>
        <ul>
          <li>Provide, operate, and maintain our digital ecosystem.</li>
          <li>Improve, personalize, and expand the visibility of student portfolios to verified enterprise recruiters.</li>
          <li>Understand and analyze how you use our platform using basic session analytics.</li>
          <li>Develop new features (e.g., AI marksheet extraction efficiency).</li>
        </ul>

        <h3>Data Security</h3>
        <p>We implement strict access control protocols. Recruiters can only access student profiles who actively opt-in to the placement pool. Teachers are restricted to viewing students exclusively within their verified academic department.</p>
      </>
    )
  },
  'terms-of-service': {
    title: 'Terms of Service',
    lastUpdated: 'January 10, 2025',
    content: (
      <>
        <p>Welcome to Campus Connect. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Campus Connect if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h3>License and Access</h3>
        <p>Unless otherwise stated, KDK College of Engineering owns the intellectual property rights for all material on Campus Connect. All intellectual property rights are reserved. You may access this from Campus Connect for your own personal and academic use subjected to restrictions set in these terms and conditions.</p>

        <h3>Platform Restrictions</h3>
        <p>You must not:</p>
        <ul>
          <li>Republish material (including student portfolios) from Campus Connect without explicit consent.</li>
          <li>Sell, rent, or sub-license material from Campus Connect.</li>
          <li>Attempt to manipulate the automated SGPA calculator or upload falsified marksheet PDFs. Violations will result in immediate suspension pending academic review.</li>
        </ul>

        <h3>Recruiter Code of Conduct</h3>
        <p>Recruiters granted access to the talent pool must utilize student contact information exclusively for legitimate employment or internship opportunities. Spamming or third-party data brokering is strictly prohibited.</p>
      </>
    )
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    lastUpdated: 'November 2, 2024',
    content: (
      <>
        <p>This is the Cookie Policy for Campus Connect.</p>

        <h3>What Are Cookies</h3>
        <p>As is common practice with almost all professional web platforms, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.</p>

        <h3>How We Use Cookies</h3>
        <p>We use cookies for a variety of reasons detailed below. In most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. We specifically use <strong>Authentication Cookies (JWT Tokens)</strong> to keep you securely logged into your Student, Teacher, or Recruiter dashboards.</p>

        <h3>The Cookies We Set</h3>
        <ul>
          <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
          <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site, we set cookies to remember your preferences (like custom dark-mode settings) when you interact with a page.</li>
        </ul>
      </>
    )
  },
  'security': {
    title: 'Security Posture',
    lastUpdated: 'February 20, 2025',
    content: (
      <>
        <p>Data security is the backbone of Campus Connect. We handle sensitive academic records, and we take that responsibility seriously.</p>

        <h3>Encryption & Architecture</h3>
        <p>All data transmitted between your browser and our Node.js backends is encrypted in transit using industry-standard TLS 1.3. Passwords are securely hashed using bcrypt with adaptive salt rounds before they ever touch our database.</p>

        <h3>Vulnerability Management</h3>
        <p>We conduct regular dependency audits using npm audit, addressing high and critical vulnerabilities within 48 hours of disclosure. Our API layer utilizes generic middleware to prevent standard OWASP vulnerabilities like SQL injection, XSS, and CSRF attacks.</p>

        <h3>Responsible Disclosure</h3>
        <p>If you are a student or security researcher who has discovered a vulnerability within the Campus Connect ecosystem, please email <strong>security@campusconnect.edu</strong>. Do not discuss the vulnerability publicly until a patch has been confirmed and deployed.</p>
      </>
    )
  },
  'help-center': {
    title: 'Help Center',
    lastUpdated: 'March 1, 2025',
    content: (
      <>
        <p>Welcome to the Campus Connect Help Center. Below are quick answers to the most common issues faced by our community.</p>

        <h3>For Students</h3>
        <p><strong>Q: Why is my SGPA calculating incorrectly?</strong><br/>
        A: Ensure that you are uploading a clear, non-blurry PDF or Image of your marksheet. The AI extractor requires legible text. If it fails, you can manually override your marks via the Academic section in your dashboard.</p>
        <p><strong>Q: How do I apply for a club?</strong><br/>
        A: Navigate to the "Events & Clubs" tab inside your dashboard and click "Join". Approval is handled manually by your Teacher Coordinator.</p>

        <h3>For Teachers</h3>
        <p><strong>Q: Can I export the Merit List?</strong><br/>
        A: Yes. On the Teacher Dashboard, select your target semester and click "Export to PDF". The system utilizes jspdf to generate a formatted table automatically.</p>

        <h3>For Recruiters</h3>
        <p><strong>Q: How long does account verification take?</strong><br/>
        A: Employer verification typically takes 1-2 business days. Our administrative team manually verifies the corporate email provided.</p>
      </>
    )
  },
  'status': {
    title: 'System Status',
    lastUpdated: 'Updated Real-time',
    content: (
      <div className="status-container">
        <div className="status-banner all-clear">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h3>All Systems Operational</h3>
        </div>
        
        <ul className="status-list">
          <li>
            <span>Web Platform (Frontend)</span>
            <span className="status-badge green">Operational</span>
          </li>
          <li>
            <span>REST API Backend</span>
            <span className="status-badge green">Operational</span>
          </li>
          <li>
            <span>AI Marksheet OCR Engine</span>
            <span className="status-badge green">Operational</span>
          </li>
          <li>
            <span>Database (MongoDB)</span>
            <span className="status-badge green">Operational</span>
          </li>
        </ul>
        
        <h3>Past Incidents</h3>
        <p><em>No incidents reported in the last 30 days.</em></p>
      </div>
    )
  },
  'documentation': {
    title: 'Documentation',
    lastUpdated: 'Ongoing',
    content: (
      <>
        <p>Campus Connect provides a full suite of API documentation for integrations.</p>

        <h3>Overview</h3>
        <p>Campus Connect exposes a RESTful interface using JSON for payloads. Authentication utilizes Bearer JWT tokens attached in the <code>Authorization</code> header of Axios requests.</p>
        
        <h3>Core Endpoints</h3>
        <pre><code>
GET /api/public/events   // Retrieve all active campus events
GET /api/public/jobs     // Retrieve all active recruiter postings
POST /api/student/login  // Authenticate student
POST /api/upload         // Multi-part form data handler for Marksheets
        </code></pre>

        <h3>Need further technical access?</h3>
        <p>If you are a university developer seeking deeper database access or webhook configurations, please contact the IT Administrator directly or submit an issue on the internal campus network git repository.</p>
      </>
    )
  }
};
