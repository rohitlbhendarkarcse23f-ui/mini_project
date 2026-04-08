import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-inner">
        <div className="notfound-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="notfound-actions">
          <Link to="/"><button className="notfound-btn-primary">← Back to Home</button></Link>
          <Link to="/login"><button className="notfound-btn-outline">Sign In</button></Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
