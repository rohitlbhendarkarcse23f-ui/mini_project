import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { STATIC_CONTENT } from '../utils/staticContent';
import { ArrowLeft } from 'lucide-react';

const StaticPage = ({ docId }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [docId]);

  const contentObj = STATIC_CONTENT[docId];

  if (!contentObj) {
    return <Navigate to="/" />;
  }

  return (
    <div className="static-page-container">
      <nav className="static-nav">
        <div className="nav-inner">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div className="nav-brand">
            <div className="nav-logo">
              <img src="/img/smartCampusLogo.png" alt="Logo" />
            </div>
            <span className="nav-name">Campus Connect</span>
          </div>
        </div>
      </nav>

      <main className="static-content-wrapper">
        <header className="static-header">
          <h1>{contentObj.title}</h1>
          <p className="last-updated">Last Updated: {contentObj.lastUpdated}</p>
        </header>
        <section className="static-body">
          {contentObj.content}
        </section>
      </main>
    </div>
  );
};

export default StaticPage;
