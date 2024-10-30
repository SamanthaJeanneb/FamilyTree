import React from 'react';
import { FaSearch } from 'react-icons/fa'; // For the search icon
import { GoogleLogin } from '@react-oauth/google'; 
import './GuestDashboardPage.css'; // Add custom styles
import { Trash } from 'lucide-react';
import { Star } from 'lucide-react';
import { Network } from 'lucide-react';
import { PanelsTopLeft } from 'lucide-react';
const GuestDashboardPage = ({ setIsAuthenticated }) => {
  const handleGoogleLoginSuccess = (response) => {
    console.log('Google Login Success:', response);
    setIsAuthenticated(true);
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failure:', error);
  };

  return (
    <div className="guest-dashboard-container">
      <div className="sidebar">
      <img src="familytreelogo.png" alt="Tree" className="dashboard-logo" />
      <nav className="nav-links">
          <a href="#" className="active">Search Public Trees</a> 
          <a className="tree-icon">
          <Network />
          <a href="#">Your Trees</a> </a>
          <a className="star-icon">
          <Star />
          <a href="#">Saved Trees</a> </a>
          <a className="collabPage-icon">
          <PanelsTopLeft />
          <a href="#">Collaborator Trees</a> </a>
          <div className="recent-trees">
            <h4>Recent</h4>
            <a href="#">Tree 1</a>
            <a href="#">Tree 2</a>
            <a href="#">Tree 3</a>
          </div>
          <hr></hr>
          <a className="trash-icon">
            <Trash />
          <a href="#">Trash</a> </a>
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
        <div><img src="treebackground.png" alt="Tree Background" className="tree-background2" /></div>
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