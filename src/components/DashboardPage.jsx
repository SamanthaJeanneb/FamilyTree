import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DashboardPage.css';
import { Trash, Star, Network, PanelsTopLeft } from 'lucide-react';
import axios from "axios";

const DashboardPage = ({ isAuthenticated, setIsAuthenticated, setUser, user }) => {
  const [isCreatePromptOpen, setCreatePromptOpen] = useState(false);
  const [treeName, setTreeName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [trees, setTrees] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState(''); // State to store username
  const navigate = useNavigate();
  const userId = 1; // Hardcoded user ID for testing
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);



  const toggleNotifications = () => {
    setShowNotifications(prevShowNotifications => !prevShowNotifications);
  }

  const handleNotificationClick = async (id, url) => {
    try {
      // Deletes notification in the server
      const response = await axios.delete(`/demo/notifications/delete?userId=${userId}&notificationId=${id}`);
      if (response.data === "Notification deleted successfully.") {
        // Deletes notification in the display
        setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
    if (!accessToken) {
      console.error("User not authenticated");
      setUser(null);
      navigate('/');
    } else {
      fetchUser();
      fetchTrees();
      fetchNotifications();
    }

    }, []);

    const fetchUser = () => {
      axios.get('http://localhost:8080/api/login', { withCredentials: true })
          .then(response => {
            if (response.data) {
              if (response.data.token) {
                localStorage.setItem('accessToken', response.data.token);
                setIsAuthenticated(true);
                setUser(response.data);
                setUsername(response.data.name);
              }
            }
          })
          .catch(error => {
            console.error("User not authenticated:", error);
            setIsAuthenticated(false);
          });
    }


    // Fetch user information to get the username
    // const fetchUser = async () => {
    //   try {
    //     const response = await fetch(`/demo/getUserById?userId=${userId}`);
    //     if (!response.ok) throw new Error(`Error: ${response.status}`);
    //
    //     const data = await response.json();
    //     if (data && data.username) {
    //       setUsername(data.username); // Set the username in state
    //     }
    //   } catch (error) {
    //     console.error("Error fetching user:", error);
    //     setMessage(`Error fetching user: ${error.message}`);
    //   }
    // };

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
  }

  {/*Fetch Notifications*/}
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/demo/notifications/${userId}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      console.log("Fetched Notifications:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setMessage(`Error fetching notifications: ${error.message}`);
    }
  };


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

  const openTree = (treeId, treeName, userId) => {
    navigate(`/tree/${encodeURIComponent(treeName)}`, { state: { treeId, userId } });
  };
  // Drag and drop handlers
  const handleDragStart = (e, treeId) => {
    e.dataTransfer.setData("treeId", treeId);
  };

  const handleDropOnTrash = async (e) => {
    e.preventDefault();
    const treeId = e.dataTransfer.getData("treeId");
  
    try {
      const response = await fetch('/demo/deleteFamilyTree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ treeId }),
      });
  
      if (response.ok) {
        const message = await response.text();
        setMessage(`Success: ${message}`);
        // Update the trees state to remove the deleted tree
        setTrees((prevTrees) => prevTrees.filter((tree) => tree.id !== parseInt(treeId)));
      } else {
        setMessage(`Error: ${response.status}`);
      }
    } catch (error) {
      setMessage(`Error deleting tree: ${error.message}`);
    }
  };

  const allowDrop = (e) => e.preventDefault();

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
              <a key={tree.id} href="#" onClick={() => openTree(tree.id, tree.treeName, user.id)
              }>
                {tree.treeName}
              </a>
            ))}
          </div>
          <hr />
          <a
            className="trash-icon"
            onDrop={handleDropOnTrash}
            onDragOver={allowDrop}
          >
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
              <button className="btn btn-link" onClick={toggleNotifications}>
                <FaBell />
              </button>

            {/* Notification Dropdown */}
            {/* CHANGE ALL INSTANCES OF "demoNotifications" TO "notifications".*/}
            {showNotifications && (
                <div className="notification-dropdown">
                  <h5>Notifications</h5>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="notification-item"
                      onClick={() => handleNotificationClick(notification.id, notification.url)}
                      style={{ cursor: 'pointer', color: '#007bff' }}>
                        {notification.message}
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No new notifications</p>
                  )}
                </div>
              )}

              <button className="btn btn-link">
                <FaQuestionCircle />
              </button>
              <button className="btn btn-link person-name" onClick={() => navigate('/account')}>
                {username || "User"} {/* Display actual username or "User" if not loaded */}
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
                  <FaPlus/>
                  <h5 className="card-title tree-title mt-2">New Tree</h5>
                </div>
              </div>
            </div>

            {/* Existing Tree Cards */}
            {trees.map((tree) => (
  <div
    className="col-md-3 mb-4"
    key={tree.id}
    draggable
    onDragStart={(e) => handleDragStart(e, tree.id)}
  >
    <div className="card tree-card" onClick={() => openTree(tree.id, tree.treeName, user.id)}>
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
      <div className="create-prompt-inner">
        
        <div className="create-prompt-image">
          <img src="treebackground.png" alt="Tree Background" height="90%" width="90%" />
        </div>
        
        <div className="create-prompt-form">
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

          <div className="radio-group">
            <label>
              <input
                type="radio"
                id="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              <span className="circle"></span> Public
            </label>
            <label>
              <input
                type="radio"
                id="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              <span className="circle"></span> Private
            </label>
          </div> <br/>

          <div className="button-container">
            <button className="cancel-button" onClick={closeCreatePrompt}>Close</button>
            <button className="submit-button" onClick={submit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        
        {message && <p style={{ padding: '20px', color: message.includes('Success') ? 'green' : 'red' }}>{message}</p>}
      </div>
    </div>
  );
};

export default DashboardPage;