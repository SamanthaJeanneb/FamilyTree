import React from 'react';
import { FaBell, FaCaretDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const FamilyTreePageHeader = ({ username }) => {
  const navigate = useNavigate();

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
            <li
              className="nav-item"
              style={{ position: 'relative', marginRight: '30px' }}
            >
              <span
                className="nav-link fw-bold"
                style={{
                  fontSize: '18px',
                  color: 'green',
                  cursor: 'default',
                  paddingBottom: '0px', // Ensures spacing matches other links
                }}
              >
                Family Tree
              </span>
              {/* Green underline */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-3px', // Aligns underline to the navbar's bottom edge
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: 'green',
                }}
              ></div>
            </li>
            <li className="nav-item">
              <a
                href="/dashboard"
                className="nav-link fw-bold"
                style={{
                  fontSize: '18px',
                  marginRight: '30px',
                  color: 'black',
                }}
              >
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/about"
                className="nav-link fw-bold"
                style={{
                  fontSize: '18px',
                  color: 'black',
                }}
              >
                About
              </a>
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
