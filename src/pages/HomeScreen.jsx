import { useDispatch, useSelector } from 'react-redux';
import { removeUser } from "../helper/authStorage";
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import './HomeScreen.css';
import { Cpu, Scale, UserCircle, BrainCircuit, Box, FileText, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from 'react';


const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const forms = [
    { label: 'PLC Modification Request', route: '/plcmodificationform' },
    { label: 'Weigh Feeder Calibration', route: '/weighfeederform' }
  ];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const name = user?.displayName || 'User';

  const handleFormSelect = (route) => {
    setDropdownOpen(false);
    navigate(route);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
          <UserCircle className="user-icon" size={28} />
          <span className="user-name">{name}</span>
        </div>
        <h1 className="app-title">
          <BrainCircuit className="app-title-icon" size={36} aria-hidden="true" />
          <span className="app-title-text">instruPro</span>
        </h1>

        {/* Right side - Buttons */}
        <div className="header-buttons">
          <div className="forms-dropdown" ref={dropdownRef}>
            <button 
              className="forms-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FileText size={18} />
              <span>Forms</span>
              <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="forms-dropdown-menu">
                {forms.map((form, index) => (
                  <button
                    key={index}
                    className="forms-dropdown-item"
                    onClick={() => handleFormSelect(form.route)}
                  >
                    <FileText size={18} />
                    <span>{form.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>


          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Icon Showcase Section */}
      <div className="icon-showcase">
        {/* <h2 className="showcase-title">Instrumentation & Sensors Icons</h2> */}

        <div className="icon-grid">
          {/* PLC Icon - Microchip/Processor */}
          <div className="icon-item" onClick={() => navigate('/plcchangerequest')} style={{ cursor: 'pointer' }}>
            {/* <svg className="showcase-icon" viewBox="0 0 24 24" fill="#248A3D">
              <path d="M7 2h2V0h2v2h2V0h2v2h2c1.1 0 2 .9 2 2v2h2v2h-2v4h2v2h-2v2c0 1.1-.9 2-2 2h-2v2h-2v-2h-2v2h-2v-2H7c-1.1 0-2-.9-2-2v-2H3v-2h2V8H3V6h2V4c0-1.1.9-2 2-2zm2 4v12h6V6H9zm2 2h2v2h-2V8zm0 4h2v2h-2v-2z"/>
            </svg> */}
            {/* <div style={{ display: "flex", alignItems: "center", gap: "8px" }}> */}
            <Cpu size={64} color="#248A3D" />
            {/* </div> */}
            <p className="icon-label">PLC Change Request</p>
          </div>

          {/* Gauge/Meter Icon */}

          <div className="icon-item" onClick={() => navigate('/weighfeeder')} style={{ cursor: 'pointer' }}>
            <Scale size={64} color="#248A3D" />

            <p className="icon-label">Weigh Feeder</p>
          </div>

          {/* Sensor/Circuit Icon */}
          <div className="icon-item" onClick={() => navigate('/packers-history')} style={{ cursor: 'pointer' }}>
            <Box size={64} color="#248A3D" />

            <p className="icon-label">Packing</p>
          </div>

          {/* Dashboard/Monitor Icon */}
          <div className="icon-item" >
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#d8ec00ff">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <p className="icon-label">Dashboard</p>
          </div>

          {/* Radar/Signal Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#d8ec00ff">
              <path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.89 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z" />
            </svg>
            <p className="icon-label">Radar/Signal</p>
          </div>

          {/* Analytics/Measurement Icon */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#d8ec00ff">
              <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            </svg>
            <p className="icon-label">Analytics</p>
          </div>

          {/* Speedometer/Tachometer */}
          <div className="icon-item">
            <svg className="showcase-icon" viewBox="0 0 24 24" fill="#d8ec00ff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            <p className="icon-label">Speedometer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;