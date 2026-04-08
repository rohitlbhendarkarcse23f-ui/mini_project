import '../App.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🎓', title: 'Student Portfolio', desc: 'Showcase skills, experiences, and certificates in a dynamic digital profile.', color: '#3B82F6' },
  { icon: '📊', title: 'Academic Tracking', desc: 'Upload marksheets, auto-calculate SGPA/CGPA, and track semester progress.', color: '#8B5CF6' },
  { icon: '💼', title: 'Jobs & Internships', desc: 'Browse and apply for placements and internships posted by top recruiters.', color: '#10B981' },
  { icon: '🎯', title: 'Campus Events', desc: 'Register for workshops, seminars, and cultural events happening on campus.', color: '#F59E0B' },
  { icon: '🤝', title: 'Campus Clubs', desc: 'Join active clubs, participate in activities, and build your extracurricular profile.', color: '#EC4899' },
  { icon: '🏆', title: 'Merit List', desc: 'Teachers can generate and export merit lists based on student performance.', color: '#F97316' },
];

const roles = [
  {
    icon: '👨‍🎓',
    role: 'Students',
    color: '#3B82F6',
    points: ['Build a digital portfolio', 'Track academic progress', 'Apply for jobs & internships', 'Join clubs & events'],
    cta: 'Get Started',
    link: '/student/signup',
  },
  {
    icon: '👨‍🏫',
    role: 'Teachers',
    color: '#8B5CF6',
    points: ['Monitor student performance', 'Manage campus events', 'Oversee clubs & activities', 'Generate merit lists'],
    cta: 'Teacher Login',
    link: '/login',
  },
  {
    icon: '🏢',
    role: 'Recruiters',
    color: '#F97316',
    points: ['Post job openings', 'Browse student profiles', 'Filter by skills & CGPA', 'Manage applications'],
    cta: 'Start Hiring',
    link: '/recruiter/signup',
  },
];

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#roles',    label: 'For You' },
  { href: '#recruit',  label: 'Recruit' },
];

function Home() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [showTop, setShowTop]     = useState(false);
  const menuRef = useRef(null);

  // Scrolled state for navbar + back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: highlight nav link matching visible section
  useEffect(() => {
    const ids = ['features', 'roles', 'recruit'];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveHash('#' + e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener('scroll', handler, { passive: true, once: true });
    return () => window.removeEventListener('scroll', handler);
  }, [menuOpen]);

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
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">🎓 KDK College of Engineering</div>
            <h1 className="hero-title">One Platform.<br />Entire Campus.</h1>
            <p className="hero-subtitle">
              Connecting students, teachers, and recruiters in a unified digital ecosystem — portfolios, academics, placements, and more.
            </p>
            <div className="hero-cta">
              <Link to="/student/signup"><button className="btn-primary btn-lg">Get Started Free</button></Link>
              <Link to="/login"><button className="btn-outline btn-lg">Log In</button></Link>
            </div>
            <div className="hero-trust">
              <span>✓ NBA Accredited</span>
              <span>✓ NAAC Grade A</span>
              <span>✓ Est. 1984</span>
            </div>
          </div>
          <div className="hero-stats">
            {[
              { num: '12,000+', label: 'Students', icon: '👨‍🎓' },
              { num: '2,400+', label: 'Placements', icon: '💼' },
              { num: '80+', label: 'Active Clubs', icon: '🤝' },
              { num: '50+', label: 'Events/Year', icon: '🎯' },
            ].map(({ num, label, icon }) => (
              <div key={label} className="stat-block">
                <div className="stat-icon">{icon}</div>
                <h2>{num}</h2>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Features</div>
            <h2>Everything You Need</h2>
            <p>Built for every corner of modern campus life</p>
          </div>
          <div className="features-grid">
            {features.map(({ icon, title, desc, color }) => (
              <div key={title} className="feature-card" style={{ '--card-accent': color }}>
                <div className="feature-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="roles-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Who It's For</div>
            <h2>Built for Everyone on Campus</h2>
            <p>A tailored experience for each role</p>
          </div>
          <div className="roles-grid">
            {roles.map(({ icon, role, color, points, cta, link }) => (
              <div key={role} className="role-card" style={{ '--role-color': color }}>
                <div className="role-icon">{icon}</div>
                <h3>{role}</h3>
                <ul className="role-points">
                  {points.map(p => <li key={p}>{p}</li>)}
                </ul>
                <Link to={link}><button className="role-btn">{cta} →</button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recruiter CTA ── */}
      <section id="recruit" className="recruiter-section">
        <div className="section-inner">
          <div className="recruiter-card">
            <div className="recruiter-badge">🏢 For Recruiters</div>
            <h2>Hire Exceptional Talent<br />from Our Campus</h2>
            <p>Connect with highly motivated students equipped with practical knowledge and real-world experience. Filter by skills, CGPA, and more.</p>
            <div className="recruiter-actions">
              <Link to="/recruiter/login"><button className="btn-outline-orange">Recruiter Login</button></Link>
              <Link to="/recruiter/signup"><button className="btn-primary">Start Hiring Now</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo">
              <img src="/img/smartCampusLogo.png" alt="Logo" />
            </div>
            <span className="nav-name">Campus Connect</span>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <a href="#features">Features</a>
            <Link to="/login">Login</Link>
            <Link to="/student/signup">Sign Up</Link>
            <Link to="/recruiter/signup">Recruit</Link>
          </div>
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
        <p className="footer-copy">© {new Date().getFullYear()} Campus Connect · KDK College of Engineering</p>
      </footer>

      {/* ── Back to top ── */}
      <button
        className={`back-to-top${showTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  );
}

export default Home;
