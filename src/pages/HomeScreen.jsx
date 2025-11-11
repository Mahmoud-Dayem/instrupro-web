import { useDispatch, useSelector } from 'react-redux';
import { removeUser } from "../helper/authStorage";
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import './HomeScreen.css';

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const name = user?.displayName || 'User';

  const handleLogout = () => {
    const confirmed = window.confirm(
      'Are you sure you want to logout? You will need to sign in again.'
    );

    if (confirmed) {
      (async () => {
        try {
          dispatch(logout());
          await removeUser();
          navigate('/auth', { replace: true });
        } catch (error) {
          console.error('Logout error:', error);
        }
      })();
    }
  };

  return (
    <div className="home-container">
      <header className="header-bar">
        {/* Left side - User name */}
        <div className="user-info">
          <span className="user-name">{name}</span>
        </div>
          <h1 className="app-title">instruPro</h1>

        {/* Right side - Buttons */}
        <div className="header-buttons">
          <button className="header-btn" onClick={() => navigate('/packers-history')}>
            Packer
          </button>
          <button className="header-btn" onClick={() => navigate('/weighfeeder')}>
            Weigh Feeder
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Icon Showcase Section */}
      <div className="icon-showcase">
        <h2 className="showcase-title">Instrumentation & Sensors Icons</h2>
        
        <div className="icon-grid">
          {/* Documents Icon */}
          <div className="icon-item" onClick={() => navigate('/packersheet')} style={{ cursor: 'pointer' }}>
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <p className="icon-label">Documents</p>
          </div>

          {/* Gauge/Meter Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
            </svg>
            <p className="icon-label">Gauge/Meter</p>
          </div>

          {/* Sensor/Circuit Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/>
            </svg>
            <p className="icon-label">Sensor/Circuit</p>
          </div>

          {/* Dashboard/Monitor Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <p className="icon-label">Dashboard</p>
          </div>

          {/* Radar/Signal Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.89 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/>
            </svg>
            <p className="icon-label">Radar/Signal</p>
          </div>

          {/* Analytics/Measurement Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <p className="icon-label">Analytics</p>
          </div>

          {/* Speedometer/Tachometer */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
            <p className="icon-label">Speedometer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;