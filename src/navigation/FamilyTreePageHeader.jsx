import React from 'react';
import { FaBell, FaCaretDown } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FamilyTreePageHeader.css'; // Import the custom CSS

const FamilyTreePageHeader = ({ username }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the "About" page is active
  const isAboutActive = location.pathname === '/about';

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light shadow-sm"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1050,
        height: '70px',
        padding: '0 20px',
      }}
    >
      <div className="container-fluid">
        {/* Logo and Title */}
        <div
          className="navbar-brand d-flex align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <img
            src="/familytreelogo.png"
            alt="Tree Logo"
            style={{ height: '50px' }}
          />
        </div>

        {/* Center Navigation Links */}
        <div
          className="collapse navbar-collapse justify-content-center"
          style={{ flex: 1 }}
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <span
                className={`nav-link ${!isAboutActive ? 'default-active' : ''}`}
                onClick={() => navigate('/tree')}
              >
                Family Tree
              </span>
            </li>
            <li className="nav-item">
              <span                className="nav-link"

              >
                Dashboard
              </span>
            </li>
            <li className="nav-item">
              <span
                className={`nav-link ${isAboutActive ? 'active' : ''}`}
                onClick={() => navigate('/about')}
              >
                About
              </span>
            </li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center">
          {/* Bell Icon */}
          <FaBell
            style={{
              fontSize: '20px',
              color: '#333',
              marginRight: '15px',
              cursor: 'pointer',
            }}
          />

          {/* User Section */}
          <div
            className="d-flex align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/account')}
          >
            {/* Placeholder Profile Picture */}
            <img
              src="/profile-placeholder.png"
              alt="Profile"
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                marginRight: '8px',
              }}
            />
            {/* Username */}
            <span style={{ fontSize: '16px', color: 'black' }}>
              {username || 'User'}
            </span>
            {/* Caret Down Icon */}
            <FaCaretDown
              style={{ fontSize: '14px', marginLeft: '5px', color: '#333' }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FamilyTreePageHeader;
