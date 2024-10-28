import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DashboardPage.css';
import { Trash } from 'lucide-react';
import { Star } from 'lucide-react';
import { Network } from 'lucide-react';
import { PanelsTopLeft } from 'lucide-react';

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
<div className="dashboard-container d-flex">
  <div className="dashboard-sidebar bg-light position-fixed">
    <img src="familytreelogo.png" alt="Tree" className="dashboard-logo" />
    <nav className="dashboard-nav-links">
      <a href="#" className="search">Search Public Trees</a> 
      
      <a className="active">
        <Network />
        <a href="#">Your Trees</a>
      </a>
      
      <a className="star-icon">
        <Star />
        <a href="#">Saved Trees</a>
      </a>
      
      <a className="collabPage-icon">
        <PanelsTopLeft />
        <a href="#">Collaborator Trees</a>
      </a>
      
      <div className="recent-trees">
        <h4>Recent</h4>
        <a href="#">Tree 1</a>
        <a href="#">Tree 2</a>
        <a href="#">Tree 3</a>
      </div>
      
      <hr />
      
      <a className="trash-icon">
        <Trash />
        <a href="#">Trash</a>
      </a>
    </nav>
  </div>

      {/* Main Content Area */}
      <div className="main-content w-100" style={{ marginLeft: '200px' }}>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
          <div className="container-fluid">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold',   color: 'rgb(73, 73, 73)' }}>Your Trees</h1>
          <div className="d-flex align-items-center">
              <button className="btn btn-link">
                <FaBell />
              </button>
              <button className="btn btn-link">
                <FaQuestionCircle />
              </button>
              <button
                className="btn btn-link person-name"
                onClick={() => navigate('/account')}
              >
                Person Name
              </button>
            </div>
          </div>
        </nav>

        {/* Main Dashboard Content */}
        <div className="container">
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
              <div className="card tree-card" onClick={() => openTree('Donald Duck Tree')}>
                <img src="placeholder.png" className="card-img-top tree-image" alt="Donald Duck Tree" />
                <div className="card-body text-center">
                  <h5 className="card-title tree-title">Donald Duck Tree</h5>
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
              <div className="card tree-card" onClick={() => openTree('Donald Duck Tree')}>
                <img src="placeholder.png" className="card-img-top tree-image" alt="Donald Duck Tree" />
                <div className="card-body text-center">
                  <h5 className="card-title tree-title">Donald Duck Tree</h5>
                </div>
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
