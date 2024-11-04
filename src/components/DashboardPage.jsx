import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DashboardPage.css';
import { Trash, Star, Network, PanelsTopLeft } from 'lucide-react';

const DashboardPage = ({ isAuthenticated }) => {
  const [isCreatePromptOpen, setCreatePromptOpen] = useState(false);
  const [treeName, setTreeName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      console.error("User not authenticated");
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const openCreatePrompt = () => setCreatePromptOpen(true);
  const closeCreatePrompt = () => {
    setCreatePromptOpen(false);
    setTreeName('');
    setVisibility('public');
  };

  const submit = async () => {
    try {
      const response = await fetch('/demo/createFamilyTree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          treeName: treeName || 'SampleTree', // Use entered tree name or default
          privacySetting: visibility === 'public' ? 'Public' : 'Private',
          userId: '1', // Hardcoded user ID for testing
        }),
      });

      if (response.ok) {
        const data = await response.text();
        setMessage(`Success: ${data}`);
        closeCreatePrompt();
        navigate(`/tree/${treeName}`);
      } else {
        setMessage(`Error: ${response.status}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const openTree = (treeName) => navigate(`/tree/${treeName}`);
  if (!isAuthenticated) return <p>Loading...</p>;

  return (
    <div className="dashboard-container d-flex">
      <div className="dashboard-sidebar bg-light position-fixed">
        <img src="familytreelogo.png" alt="Tree" className="dashboard-logo" />
        <nav className="dashboard-nav-links">
          <a href="#" className="search">Search Public Trees</a>

          <div className="active">
            <Network />
            <a href="#">Your Trees</a>
          </div>

          <div className="star-icon">
            <Star />
            <a href="#">Saved Trees</a>
          </div>

          <div className="collabPage-icon">
            <PanelsTopLeft />
            <a href="#">Collaborator Trees</a>
          </div>

          <div className="recent-trees">
            <h4>Recent</h4>
            <a href="#">Tree 1</a>
            <a href="#">Tree 2</a>
            <a href="#">Tree 3</a>
          </div>

          <hr />

          <div className="trash-icon">
            <Trash />
            <a href="#">Trash</a>
          </div>
        </nav>
      </div>

      <div className="main-content w-100" style={{ marginLeft: '200px' }}>
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
          <div className="container-fluid">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(73, 73, 73)' }}>Your Trees</h1>
            <div className="d-flex align-items-center">
              <button className="btn btn-link">
                <FaBell />
              </button>
              <button className="btn btn-link">
                <FaQuestionCircle />
              </button>
              <button className="btn btn-link person-name" onClick={() => navigate('/account')}>
                User Name
              </button>
            </div>
          </div>
        </nav>

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
                  onChange={() => setVisibility('public')}
                />
                <span className="circle"></span> Public
                <br />
                <input
                  type="radio"
                  id="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                />
                <span className="circle"></span> Private
              </label>
              <br /><br />
              <button className="cancel-button" onClick={closeCreatePrompt}>Close</button>
              <button className="submit-button" onClick={submit}>Submit</button>
            </div>
          </div>
        )}
        
        {message && <p style={{ padding: '20px', color: message.includes('Success') ? 'green' : 'red' }}>{message}</p>}
      </div>
    </div>
  );
};

export default DashboardPage;
