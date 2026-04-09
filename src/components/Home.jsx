import '../App.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, LineChart, Briefcase, CalendarDays, Users, Trophy,
  GraduationCap, MonitorCheck, Building2, UsersRound,
  Target, Zap, Mail, Phone, MapPin, Send, CheckCircle
} from 'lucide-react';

const features = [
  { icon: FolderGit2, title: 'Student Portfolio', desc: 'Showcase skills, experiences, and certificates in a dynamic digital profile.', color: '#3B82F6' },
  { icon: LineChart, title: 'Academic Tracking', desc: 'Upload marksheets, auto-calculate SGPA/CGPA, and track semester progress.', color: '#8B5CF6' },
  { icon: Briefcase, title: 'Jobs & Internships', desc: 'Browse and apply for placements and internships posted by top recruiters.', color: '#10B981' },
  { icon: CalendarDays, title: 'Campus Events', desc: 'Register for workshops, seminars, and cultural events happening on campus.', color: '#F59E0B' },
  { icon: Users, title: 'Campus Clubs', desc: 'Join active clubs, participate in activities, and build your extracurricular profile.', color: '#EC4899' },
  { icon: Trophy, title: 'Merit List', desc: 'Teachers can generate and export merit lists based on student performance.', color: '#F97316' },
];

const roles = [
  {
    icon: GraduationCap,
    role: 'Students',
    color: '#3B82F6',
    points: ['Build a digital portfolio', 'Track academic progress', 'Apply for jobs & internships', 'Join clubs & events'],
    cta: 'Get Started',
    link: '/student/signup',
  },
  {
    icon: MonitorCheck,
    role: 'Teachers',
    color: '#8B5CF6',
    points: ['Monitor student performance', 'Manage campus events', 'Oversee clubs & activities', 'Generate merit lists'],
    cta: 'Teacher Login',
    link: '/login',
  },
  {
    icon: Building2,
    role: 'Recruiters',
    color: '#F97316',
    points: ['Post job openings', 'Browse student profiles', 'Filter by skills & CGPA', 'Manage applications'],
    cta: 'Start Hiring',
    link: '/recruiter/signup',
  },
];

const heroStats = [
  { num: '12,000+', label: 'Students', icon: GraduationCap },
  { num: '2,400+', label: 'Placements', icon: Briefcase },
  { num: '80+', label: 'Active Clubs', icon: UsersRound },
  { num: '50+', label: 'Events/Year', icon: CalendarDays },
];

const NAV_LINKS = [
  { href: '#about',    label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#roles',    label: 'For You' },
  { href: '#recruit',  label: 'Recruit' },
  { href: '#contact',  label: 'Contact' },
];

// Motion Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

function Home() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [showTop, setShowTop]     = useState(false);
  
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['about', 'features', 'roles', 'recruit', 'contact'];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveHash('#' + e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener('scroll', handler, { passive: true, once: true });
    return () => window.removeEventListener('scroll', handler);
  }, [menuOpen]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('loading');
    setTimeout(() => {
      setContactStatus('success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setContactStatus(''), 5000);
    }, 1500);
  };

  return (
    <div className="home-page">
      {/* ── Navbar ── */}
      <header className={`home-nav${scrolled ? ' scrolled' : ''}`} ref={menuRef}>
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <div className="nav-logo">
              <img src="/img/smartCampusLogo.png" alt="Logo" />
            </div>
            <span className="nav-name">Campus Connect</span>
          </Link>
          <nav className="nav-links">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className={activeHash === href ? 'nav-link-active' : ''}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <Link to="/login"><button className="btn-outline">Log In</button></Link>
            <Link to="/student/signup"><button className="btn-primary">Sign Up</button></Link>
          </div>
          <button
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="bar bar-top" />
            <span className="bar bar-mid" />
            <span className="bar bar-bot" />
          </button>
        </div>
        <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className={activeHash === href ? 'nav-link-active' : ''} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div className="nav-mobile-actions">
            <Link to="/login" onClick={() => setMenuOpen(false)}><button className="btn-outline nav-mobile-btn">Log In</button></Link>
            <Link to="/student/signup" onClick={() => setMenuOpen(false)}><button className="btn-primary nav-mobile-btn">Sign Up</button></Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-gradient-overlay"></div>
        <div className="hero-inner">
          <motion.div 
            className="hero-text"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="hero-badge">🎓 KDK College of Engineering</motion.div>
            <motion.h1 variants={fadeInUp} className="hero-title">One Platform.<br />Entire Campus.</motion.h1>
            <motion.p variants={fadeInUp} className="hero-subtitle">
              Connecting students, teachers, and recruiters in a unified digital ecosystem — portfolios, academics, placements, and more.
            </motion.p>
            <motion.div variants={fadeInUp} className="hero-cta">
              <Link to="/student/signup"><button className="btn-primary btn-lg glow-btn">Get Started Free</button></Link>
              <Link to="/login"><button className="btn-outline btn-lg">Log In</button></Link>
            </motion.div>
            <motion.div variants={fadeInUp} className="hero-trust">
              <span>✓ NBA Accredited</span>
              <span>✓ NAAC Grade A</span>
              <span>✓ Est. 1984</span>
            </motion.div>
          </motion.div>

          <motion.div 
            className="hero-stats"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {heroStats.map(({ num, label, icon: Icon }) => (
              <motion.div variants={fadeInUp} key={label} className="stat-block premium-glass">
                <div className="stat-icon"><Icon size={30} strokeWidth={1.5} color="#3B82F6" /></div>
                <h2>{num}</h2>
                <p>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section id="about" className="about-section">
        <div className="section-inner">
          <motion.div 
            className="about-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="about-text" variants={fadeInUp}>
              <div className="section-badge">About Us</div>
              <h2>Empowering Education Through Innovation</h2>
              <p>Campus Connect was born out of a simple need: to bridge the gap between academic progress, extracurricular activities, and career opportunities.</p>
              <p>By digitizing manual workflows like marksheet extraction, club registrations, and merit lists, we give educators more time to teach and students more visibility into their growth.</p>
              <div className="about-metrics">
                <div className="about-metric">
                  <div className="am-icon" style={{ background: 'rgba(59,130,246,0.1)' }}><Target size={24} color="#3B82F6" /></div>
                  <div className="am-val">Mission-Driven</div>
                  <div className="am-sub">Focused on student success and placement rates.</div>
                </div>
                <div className="about-metric">
                  <div className="am-icon" style={{ background: 'rgba(139,92,246,0.1)' }}><Zap size={24} color="#8B5CF6" /></div>
                  <div className="am-val">High Performance</div>
                  <div className="am-sub">Real-time alerts, AI-parsing, and instant calculations.</div>
                </div>
              </div>
            </motion.div>
            <motion.div className="about-visual premium-glass" variants={fadeInUp}>
              <div className="visual-orb"></div>
              <div className="mockup-window">
                <div className="mw-header">
                  <div className="vc-dot red"></div>
                  <div className="vc-dot yellow"></div>
                  <div className="vc-dot green"></div>
                  <div className="mw-url">campusconnect.edu/dashboard</div>
                </div>
                <div className="mw-body">
                  <div className="mw-sidebar">
                    <div className="mw-avatar"></div>
                    <div className="mw-nav-item active"></div>
                    <div className="mw-nav-item"></div>
                    <div className="mw-nav-item"></div>
                  </div>
                  <div className="mw-content">
                    <div className="mw-title">Welcome back, Student</div>
                    <div className="mw-stats">
                      <div className="mw-stat-box"><div className="mw-stat-val">8.4 SGPA</div></div>
                      <div className="mw-stat-box"><div className="mw-stat-val">2 Internships</div></div>
                    </div>
                    <div className="mw-list">
                      <div className="mw-list-item"></div>
                      <div className="mw-list-item"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="section-inner">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="section-badge">Features</div>
            <h2>Everything You Need</h2>
            <p>Built for every corner of modern campus life</p>
          </motion.div>
          
          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div variants={fadeInUp} key={title} className="feature-card premium-glass" style={{ '--card-accent': color }}>
                <div className="feature-glow" style={{ background: color }}></div>
                <div className="feature-icon" style={{ color }}><Icon size={32} strokeWidth={1.5} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="roles-section">
        <div className="section-inner">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="section-badge">Who It's For</div>
            <h2>Built for Everyone on Campus</h2>
            <p>A tailored experience for each role</p>
          </motion.div>
          <motion.div 
            className="roles-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {roles.map(({ icon: Icon, role, color, points, cta, link }) => (
              <motion.div variants={fadeInUp} key={role} className="role-card premium-glass" style={{ '--role-color': color }}>
                <div className="role-glow" style={{ background: color }}></div>
                <div className="role-icon" style={{ color }}><Icon size={40} strokeWidth={1.5} /></div>
                <h3>{role}</h3>
                <ul className="role-points">
                  {points.map(p => <li key={p}>{p}</li>)}
                </ul>
                <Link to={link}><button className="role-btn">{cta} &rarr;</button></Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="section-badge">Testimonials</div>
            <h2>What People Are Saying</h2>
            <p>Real stories from our campus community</p>
          </motion.div>
          <motion.div 
            className="testimonials-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="testimonial-card premium-glass" variants={fadeInUp}>
              <div className="t-quote">
                "Campus Connect made tracking my SGPA and applying for placements absolutely effortless. I had my portfolio ready in minutes."
              </div>
              <div className="t-author">
                <div className="t-avatar"><GraduationCap size={20} color="#3B82F6"/></div>
                <div className="t-info">
                  <h4>Priya Sharma</h4>
                  <p>Computer Science, Year 4</p>
                </div>
              </div>
            </motion.div>
            <motion.div className="testimonial-card premium-glass" variants={fadeInUp}>
              <div className="t-quote">
                "The unified platform allowed us to filter candidates by actual verified skills and past SGPAs. It saved us weeks of screening."
              </div>
              <div className="t-author">
                <div className="t-avatar"><Building2 size={20} color="#F97316"/></div>
                <div className="t-info">
                  <h4>Rahul Verma</h4>
                  <p>HR Manager, Tech Corp</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Recruiter CTA ── */}
      <section id="recruit" className="recruiter-section">
        <div className="section-inner">
          <motion.div 
            className="recruiter-card premium-glass-border"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="recruiter-blob"></div>
            <div className="recruiter-badge">🏢 For Recruiters</div>
            <h2>Hire Exceptional Talent<br />from Our Campus</h2>
            <p>Connect with highly motivated students equipped with practical knowledge and real-world experience. Filter by skills, CGPA, and more.</p>
            <div className="recruiter-actions">
              <Link to="/recruiter/login"><button className="btn-outline-orange">Recruiter Login</button></Link>
              <Link to="/recruiter/signup"><button className="btn-primary glow-btn glow-orange">Start Hiring Now</button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="contact-section">
        <div className="section-inner">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="section-badge">Get In Touch</div>
            <h2>Contact Us</h2>
            <p>Have questions? We'd love to hear from you.</p>
          </motion.div>

          <motion.div 
            className="contact-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="contact-info-panel" variants={fadeInUp}>
              <div className="contact-card premium-glass">
                <Mail className="cc-icon" size={24} color="#3B82F6" />
                <div className="cc-details">
                  <h4>Email Us</h4>
                  <p>support@campusconnect.edu</p>
                </div>
              </div>
              <div className="contact-card premium-glass">
                <Phone className="cc-icon" size={24} color="#10B981" />
                <div className="cc-details">
                  <h4>Call Us</h4>
                  <p>+91 (0712) 123-4567</p>
                </div>
              </div>
              <div className="contact-card premium-glass">
                <MapPin className="cc-icon" size={24} color="#EC4899" />
                <div className="cc-details">
                  <h4>Location</h4>
                  <p>KDK College of Engineering<br/>Great Nag Rd, Nandanvan, Nagpur</p>
                </div>
              </div>
            </motion.div>

            <motion.form 
              className="contact-form premium-glass"
              variants={fadeInUp}
              onSubmit={handleContactSubmit}
            >
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  rows="4" 
                  placeholder="How can we help you?" 
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn-primary glow-btn submit-btn"
                disabled={contactStatus === 'loading' || contactStatus === 'success'}
              >
                {contactStatus === 'loading' ? 'Sending...' : 
                 contactStatus === 'success' ? <><CheckCircle size={18} /> Sent Successfully</> : 
                 <><Send size={18} /> Send Message</>}
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="footer-inner mega-footer">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="nav-logo">
                <img src="/img/smartCampusLogo.png" alt="Logo" />
              </div>
              <span className="nav-name">Campus Connect</span>
            </div>
            <p className="footer-desc">A unified digital ecosystem connecting students, teachers, and recruiters.</p>
            <div className="footer-social">
              {[
                { src: '/img/Icon.png',   href: 'https://facebook.com',  label: 'Facebook' },
                { src: '/img/Icon-1.png', href: 'https://instagram.com', label: 'Instagram' },
                { src: '/img/Icon-2.png', href: 'https://linkedin.com',  label: 'LinkedIn' },
                { src: '/img/x.png',      href: 'https://x.com',         label: 'X' },
                { src: '/img/Icon-3.png', href: 'https://youtube.com',   label: 'YouTube' },
              ].map(({ src, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label={label}>
                  <img src={src} alt={label} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#about">About Us</a>
            <Link to="/student/signup">Students</Link>
            <Link to="/recruiter/signup">Recruiters</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#contact">Contact Us</a>
            <Link to="/support/help-center">Help Center</Link>
            <Link to="/support/status">System Status</Link>
            <Link to="/support/documentation">Documentation</Link>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/legal/privacy-policy">Privacy Policy</Link>
            <Link to="/legal/terms-of-service">Terms of Service</Link>
            <Link to="/legal/cookie-policy">Cookie Policy</Link>
            <Link to="/legal/security">Security</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
          <p className="footer-kdk">KDK College of Engineering, Nagpur</p>
        </div>
      </footer>

      <button
        className={`back-to-top${showTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        &uarr;
      </button>
    </div>
  );
}

export default Home;
