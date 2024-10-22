import React from 'react';
import { FaSearch } from 'react-icons/fa'; // For the search icon
import { GoogleLogin } from '@react-oauth/google'; // Assuming you're using Google OAuth
import './GuestDashboardPage.css'; // Add custom styles

const GuestDashboardPage = () => {
  const handleGoogleLoginSuccess = (response) => {
    console.log('Google Login Success:', response);
    // Handle successful login
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failure:', error);
  };

  return (
    <div className="guest-dashboard-container">
      <div className="sidebar">
        <div className="logo">FamTree</div>
        <nav className="nav-links">
          <a href="#" className="active">Search Public Trees</a>
          <a href="#">Your Trees</a>
          <a href="#">Saved Trees</a>
          <a href="#">Collaborator Trees</a>
          <div className="recent-trees">
            <h4>Recent</h4>
            <a href="#">Tree 1</a>
            <a href="#">Tree 2</a>
            <a href="#">Tree 3</a>
          </div>
          <a href="#">Trash</a>
        </nav>
      </div>
      <div className="guest-main-content">
        <div className="top-bar">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            text="signin_with"
            width="200"
            className="google-signin-button"
          />
        </div>
        <div className="search-section">
          <h1>Search Public Trees</h1>
          <div className="search-bar">
            <input type="text" placeholder="Search for family trees" />
            <button className="search-icon">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPage;
