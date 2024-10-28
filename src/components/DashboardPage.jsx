import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DashboardPage.css';

const DashboardPage = () => {
  const [isCreatePromptOpen, setCreatePromptOpen] = useState(false);
  const [treeName, setTreeName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const navigate = useNavigate();

  const openCreatePrompt = () => setCreatePromptOpen(true);
  const closeCreatePrompt = () => {
    setCreatePromptOpen(false);
    setTreeName('');
    setVisibility('public');
  };

  const submit = () => {
    if (treeName) {
      console.log(`Tree Name: ${treeName}, Visibility: ${visibility}`);
      closeCreatePrompt();
      navigate(`/tree/${treeName}`);
    } else {
      alert('Please name your tree!');
    }
  };

  const openTree = (treeName) => navigate(`/tree/${treeName}`);

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
              <FaBell />
            </button>
            <button className="icon-button">
              <FaQuestionCircle />
            </button>
            <button
              className="person-name"
              onClick={() => navigate('/account')}
            >
              Person Name
            </button>
          </div>
        </div>
        
        {/* Bootstrap Cards with Hover Effects */}
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card tree-card" onClick={openCreatePrompt}>
              <img src="placeholder.png" className="card-img-top tree-image" alt="New Tree" />
              <div className="card-body text-center">
                <h5 className="card-title tree-title">New Tree</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card tree-card" onClick={() => openTree('Donald Duck Tree')}>
              <img src="placeholder.png" className="card-img-top tree-image" alt="Donald Duck Tree" />
              <div className="card-body text-center">
                <h5 className="card-title tree-title">Donald Duck Tree</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card tree-card" onClick={() => openTree('Duck Dynasty Tree')}>
              <img src="placeholder.png" className="card-img-top tree-image" alt="Duck Dynasty Tree" />
              <div className="card-body text-center">
                <h5 className="card-title tree-title">Duck Dynasty Tree</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card tree-card" onClick={() => openTree('Family Tree')}>
              <img src="placeholder.png" className="card-img-top tree-image" alt="Family Tree" />
              <div className="card-body text-center">
                <h5 className="card-title tree-title">Family Tree</h5>
              </div>
            </div>
          </div>
        </div>

        {isCreatePromptOpen && (
          <div className="create-prompt">
            <div className="create-prompt-content">
              <h2>Add New Tree</h2>
              <input
                type="text"
                id="tree-name"
                placeholder="Tree Name..."
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
                required
              />
              <br /><br />
              <label>
                <input
                  type="radio"
                  id="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span className="circle"></span> Public
                <br />
                <input
                  type="radio"
                  id="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                <span className="circle"></span> Private
              </label>
              <br /><br />
              <button className="cancel-button" onClick={closeCreatePrompt}>Close</button>
              <button className="submit-button" onClick={submit}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
