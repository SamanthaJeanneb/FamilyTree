import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle } from 'react-icons/fa'; // Icons for notification and help
import './DashboardPage.css';

const DashboardPage = () => {
  const [isCreatePromptOpen, setCreatePromptOpen] = useState(false);
  const [treeName, setTreeName] = useState('');
  const [visibility, setVisibility] = useState('public');
  
  const navigate = useNavigate(); // React Router's hook for navigation

  const openCreatePrompt = () => {
    setCreatePromptOpen(true);
  };

  const closeCreatePrompt = () => {
    setCreatePromptOpen(false);
  };

  // Submit function for creating a new tree and navigating to TreePage
  const submit = () => {
    if (treeName) {
      console.log(`Tree Name: ${treeName}, Visibility: ${visibility}`);
      closeCreatePrompt();
      // Redirect to the TreePage with the new tree's name
      navigate(`/tree/${treeName}`);
    } else {
      alert('Please name your tree!');
    }
  };

  // Function to navigate to an existing tree visualization
  const openTree = (treeName) => {
    navigate(`/tree/${treeName}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div>
          <img src="familytreelogo.png" alt="Tree" className="dashboard-logo" />
        </div>
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
          <div className="tree-card new-tree" onClick={openCreatePrompt}>
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">New Tree</span>
          </div>
          <div className="tree-card" onClick={() => openTree('Donald Duck Tree')}>
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Donald Duck Tree</span>
          </div>
          <div className="tree-card" onClick={() => openTree('Duck Dynasty Tree')}>
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Duck Dynasty Tree</span>
          </div>
          <div className="tree-card" onClick={() => openTree('Family Tree')}>
            <img src="placeholder.png" alt="Tree" className="tree-image" />
            <span className="tree-title">Family Tree</span>
          </div>
        </div>

        {isCreatePromptOpen && (
          <div className="create-prompt">
            <div className="create-prompt-content">
              <h2>Add New Tree</h2>
              <label htmlFor="tree-name">Tree Name...</label>
              <input
                type="text"
                id="tree-name"
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
                required
              />
              <br />
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <br />
              <button onClick={submit}>Submit</button>
              <button onClick={closeCreatePrompt}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
