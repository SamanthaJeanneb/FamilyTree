import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DashboardPage.css';
import { Trash, Star, Network, PanelsTopLeft } from 'lucide-react';

const DashboardPage = ({ isAuthenticated }) => {
  const [isCreatePromptOpen, setCreatePromptOpen] = useState(false);
  const [treeName, setTreeName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [trees, setTrees] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const userId = 1; // Hardcoded user ID for testing

  useEffect(() => {
    if (!isAuthenticated) {
      console.error("User not authenticated");
      navigate('/');
      return;
    }

    const fetchTrees = async () => {
      try {
        const response = await fetch(`/demo/getUserFamilyTrees?userId=${userId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        setTrees(data);
      } catch (error) {
        console.error("Error fetching trees:", error);
        setMessage(`Error fetching trees: ${error.message}`);
      }
    };

    fetchTrees();
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
          treeName: treeName || 'SampleTree',
          privacySetting: visibility === 'public' ? 'Public' : 'Private',
          userId: userId.toString(),
        }),
      });

      if (response.ok) {
        const data = await response.text();
        setMessage(`Success: ${data}`);
        closeCreatePrompt();
        navigate(`/tree/${encodeURIComponent(treeName)}`);
      } else {
        setMessage(`Error: ${response.status}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const openTree = (treeName) => navigate(`/tree/${encodeURIComponent(treeName)}`);

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar */}
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
            {trees.slice(0, 3).map((tree) => (
              <a key={tree.id} href="#" onClick={() => openTree(tree.treeName)}>
                {tree.treeName}
              </a>
            ))}
          </div>
      
      <hr />
      
      <a className="trash-icon">
        <Trash />
        <a href="#">Trash</a>
      </a>
    </nav>
  </div>
      {/* Main Content */}
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
            {/* Create New Tree Card */}
            <div className="col-md-3 mb-4">
              <div className="card tree-card create-tree-card text-center" onClick={openCreatePrompt}>
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <FaPlus style={{ fontSize: '2rem', color: 'green' }} />
                  <h5 className="card-title tree-title mt-2">New Tree</h5>
                </div>
              </div>
            </div>

            {/* Existing Tree Cards */}
            {trees.map((tree) => (
              <div className="col-md-3 mb-4" key={tree.id}>
                <div className="card tree-card" onClick={() => openTree(tree.treeName)}>
                  <img src="placeholder.png" className="card-img-top tree-image" alt={tree.treeName} />
                  <div className="card-body text-center">
                    <h5 className="card-title tree-title">{tree.treeName}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Prompt */}
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
