import React from 'react';
import { FaBell, FaQuestionCircle } from 'react-icons/fa'; // Icons for notification and help
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="dashboard-logo">FamTree</div>
        <nav className="dashboard-nav-links">
          <a href="#" className="active">Your Trees</a>
          <a href="#">Saved Trees</a>
          <a href="#">Collaborator Trees</a>
          <a href="#">Search Public Trees</a>
          <div className="recent-trees">
            <h4>Recent</h4>
            <a href="#">Tree 1</a>
            <a href="#">Tree 2</a>
            <a href="#">Tree 3</a>
          </div>
          <a href="#">Trash</a>
        </nav>
      </div>
      <div className="dashboard-main-content">
        <div className="dashboard-top-bar">
          <h1>Your Trees</h1>
          <div className="user-info">
            <button className="icon-button">
              <FaBell /> {/* Notification Icon */}
            </button>
            <button className="icon-button">
              <FaQuestionCircle /> {/* Help Icon */}
            </button>
            <button className="person-name">Person Name</button>
          </div>
        </div>
        <div className="tree-grid">
          <div className="tree-card new-tree">
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">New Tree</span>
          </div>
          <div className="tree-card">
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Donald Duck Tree</span>
          </div>
          <div className="tree-card">
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Donald Duck Tree</span>
          </div>
          <div className="tree-card">
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Donald Duck Tree</span>
          </div>
          <div className="tree-card">
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Family Tree</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
