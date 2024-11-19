import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa'; // For the search icon
import { GoogleLogin } from '@react-oauth/google';
import './GuestDashboardPage.css'; // Add custom styles
import { Star } from 'lucide-react';
import { Network } from 'lucide-react';
import { PanelsTopLeft } from 'lucide-react';
import { Trash } from 'lucide-react';

const GuestDashboardPage = ({ setIsAuthenticated }) => {

  const handleGoogleLogin = () => {
    // Redirect to the backend Google OAuth2 authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const [searchTerm, setSearchTerm] = useState(''); const navigate = useNavigate();

  const handleSearch = () => {
    console.log('Navigating to:', `/search-results?query=${searchTerm}`);
    navigate(`/search-results?query=${searchTerm}`);
  };

  return (
    <div className="guest-dashboard-container">
      <div className="sidebar">
        <img src="/familytreelogo.png" alt="Tree" className="dashboard-logo" />
        <nav className="nav-links">
          <a href="search-results" className="active">Search Public Trees</a>
          <a className="tree-icon">
            <Network />
            <a href="dashboard">Your Trees</a> </a>
          <a className="star-icon">
            <Star />
            <a href="#">Saved Trees</a> </a>
          <a className="collabPage-icon">
            <PanelsTopLeft />
            <a href="#">Collaborator Trees</a> </a>
        </nav>
      </div>
      <div className="guest-main-content">
        <div className="top-bar">
          <div className="google-login-button">
            <button onClick={handleGoogleLogin} className="google-login-button">
              <img
                src="/google.png"
                alt="Google logo"
                className="google-logo"
              />
              Sign in with Google
            </button>
          </div>
        </div>
        <div><img src="/treebackground.png" alt="Tree Background" className="tree-background2" /></div>
        <div className="search-section">
          <h1>Search Public Trees</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for family trees"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button className="search-icon" onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPage;