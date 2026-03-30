import '../App.css';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <section className="header">
        <div className="header">
          <div className="headerLeft">
            <div className="webLogo"><img src="/img/smartCampusLogo.png" alt="Logo" /></div>
            <div className="webName">Campus-Connect</div>
          </div>
          <div className="headerRight">
            <Link to="/login"><button className="headerBtn">Log In</button></Link>
            <Link to="/student/signup"><button className="headerBtn">Sign Up</button></Link>
          </div>
        </div>
      </section>

      <section className="section1Blog">
        <div className="section1BlogContainer">
          <div className="Collegedetail">
            <p>KDK</p>
            <p>College Of</p>
            <p>Engineering</p>
            <div className="Collegedetail1">
              <div className="Collegedetail1Left">
                <p>- An Autonomous Institute -</p>
                <p>IMPARTING TECHNICAL</p>
                <p>EDUCATION SINCE 1984</p>
                <p>NBA Accredited - Five programs</p>
              </div>
              <div className="Collegedetail1Right">
                <p>Grade A, </p>
                <p>NAAC Accredited</p>
              </div>
            </div>
          </div>
          <div className="StatusCards">
            <div className="BlocksData1">
              <h1>12,000+</h1>
              <h5>students</h5>
            </div>
            <div className="BlocksData1">
              <h1>2,400+</h1>
              <h5>Placements</h5>
            </div>
            <div className="BlocksData1">
              <h1>80+</h1>
              <h5>Active Clubs</h5>
            </div>
            <div className="BlocksData1">
              <h1>50+</h1>
              <h5>Events/Year</h5>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="Section2Container">
          <div className="Section2ContainerUp">
            <h1>Everything You Need</h1>
            <h3>Built for modern campus life</h3>
          </div>
          <div className="Section2ContainerDown">
            <div className="contdets1">
              <div className="Section2ContainerDownDetail">
                <div className="detailcont">
                  <div className="webLogo"><img src="" alt="Icon" /></div>
                  <h3>Campus Clubs</h3>
                  <h5>Join active clubs, participate in events and build your extracurricular profile</h5>
                </div>
              </div>
              <div className="Section2ContainerDownDetail">
                <div className="detailcont">
                  <div className="webLogo"><img src="" alt="Icon" /></div>
                  <h3>Campus Clubs</h3>
                  <h5>Join active clubs, participate in events and build your extracurricular profile</h5>
                </div>
              </div>
            </div>
            <div className="contdets1">
              <div className="Section2ContainerDownDetail">
                <div className="detailcont">
                  <div className="webLogo"><img src="" alt="Icon" /></div>
                  <h3>Campus Clubs</h3>
                  <h5>Join active clubs, participate in events and build your extracurricular profile</h5>
                </div>
              </div>
              <div className="Section2ContainerDownDetail">
                <div className="detailcont">
                  <div className="webLogo"><img src="" alt="Icon" /></div>
                  <h3>Campus Clubs</h3>
                  <h5>Join active clubs, participate in events and build your extracurricular profile</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section3Container">
          <div className="section3title">
            <h1>Are you a Recruiter ??</h1>
            <h5>Built for modern campus life</h5>
          </div>
          <div className="section3contData">
            <h2>Hire Exceptional Talent from Our Campus</h2>
            <h4>Connect with highly motivated students equipped with practical knowledge and real-world experience.</h4>
            <div style={{display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px'}}>
              <Link to="/recruiter/login"><button style={{background: 'rgba(249,115,22,0.1)', border: '2px solid #f97316', color: '#f97316'}}>Recruiter Login</button></Link>
              <Link to="/recruiter/signup"><button>Start Hiring Now</button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="footer">
        <div className="footerContainer">
          <div className="footleft">
            <p>Home</p>
            <p>Login</p>
            <p>Signup</p>
            <p>Recruit</p>
            <p>Contact Us</p>
          </div>
          <div className="footright">
            <button><img src="/img/Icon.png" alt="Social" /></button>
            <button><img src="/img/Icon-1.png" alt="Social" /></button>
            <button><img src="/img/Icon-2.png" alt="Social" /></button>
            <button><img src="/img/x.png" alt="Social" /></button>
            <button><img src="/img/Icon-3.png" alt="Social" /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
