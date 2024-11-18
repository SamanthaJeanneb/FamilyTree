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
  const [userId, setUserId] = useState() // Hardcoded user ID for testing
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [collaboratorTrees, setCollaboratorTrees] = useState([]);
  const [showCollaboratorTrees, setShowCollaboratorTrees] = useState(false);
  const [activeLink, setActiveLink] = useState("myTrees");


  const fetchCollaboratorTrees = () => {
    axios
        .get(`/demo/getCollaborationByUser?userId=${userId}`, { withCredentials: true })
        .then((response) => {
          const familyTrees = response.data.map((collaboration) => collaboration.familyTree);
          setCollaboratorTrees((prevTrees) => [...prevTrees, ...familyTrees]);
          setShowCollaboratorTrees(true); // Show collaborator trees when data is fetched
        })
        .catch((error) => {
          console.error('Error fetching collaborator trees:', error);
        });
  };

  const handleCollaboratorTreesClick = (e) => {
    e.preventDefault();
    setActiveLink("collaboratorTrees");
    setCollaboratorTrees('')
    fetchCollaboratorTrees();
  };

  const handleYourTreesClick = (e) => {
    e.preventDefault();
    setActiveLink("myTrees");
    setCollaboratorTrees('');
    setShowCollaboratorTrees(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(prevShowNotifications => !prevShowNotifications);
  }

  const handleNotificationClick = async (id, action, treeId) => {
    try {
      const url =
          action === 'accept'
              ? `/demo/acceptCollaboration?collaborationId=${id}`
              : `/demo/declineCollaboration?collaborationId=${id}`;

      const response = await axios.post(url, {}, { withCredentials: true });

      if (response.data.includes('accepted') || response.data.includes('declined')) {
        // Remove notification from display
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
        );
        setMessage(`Collaboration ${action}ed successfully.`);
      }
    } catch (error) {
      console.error('Error handling collaboration:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    const authenticateAndFetchData = () => {
      axios
          .get('http://localhost:8080/api/login', { withCredentials: true })
          .then((response) => {
            if (response.data && response.data.token) {
              setIsAuthenticated(true);
              setUser(response.data);
              setUsername(response.data.name);
              setUserId(response.data.id); // This ensures `userId` is set correctly
            }
          })
          .then(() => {
            if (userId) {
              fetchTrees();
              fetchNotifications();
            }
          })
          .catch((error) => {
            console.log('User not authenticated:', error);
            setIsAuthenticated(false);
            setUser(null);
            navigate('/');
          });
    };

    authenticateAndFetchData();
  }, [userId]);


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
  const fetchNotifications = () => {
    axios
        .get(`/demo/notifications/${userId}`, { withCredentials: true })
        .then((response) => {
          // Check if response is okay

          if (response.statusText === "OK") {
            console.log("Fetched Notifications:", response.data);
            setNotifications(response.data);
          } else {
            throw new Error(`Error: ${response.status}`);
          }
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
          setMessage(`Error fetching notifications: ${error.message}`);
        });
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
            <a href="search-results" className="search">Search Public Trees</a>
            <a className={activeLink === "myTrees" ? "active" : ""}>
              <Network/>
              <a href="#"
                 onClick={handleYourTreesClick}
              >Your Trees</a>
            </a>
            <a className="star-icon">
              <Star/>
              <a href="#">Saved Trees</a>
            </a>
            <a
                href="#"
                className={activeLink === "collaboratorTrees" ? "active collabPage-icon" : ""}
                onClick={handleCollaboratorTreesClick}
            >
              <PanelsTopLeft/>
              Collaborator Trees
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
            <hr/>
            <a
                className="trash-icon"
                onDrop={handleDropOnTrash}
                onDragOver={allowDrop}
            >
              <Trash/>
              <a href="#">Trash</a>
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content w-100" style={{marginLeft: '200px'}}>
          <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
            <div className="container-fluid">
              <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: 'rgb(73, 73, 73)'}}>
                {showCollaboratorTrees ? 'Collaborator Trees' : 'Your Trees'}
              </h1>
              <div className="d-flex align-items-center">
                <div className="notification-icon-wrapper position-relative">
                  <button className="btn btn-link" onClick={toggleNotifications} style={{padding: '0px'}}>
                    <FaBell/>
                  </button>
                  {notifications.length > 0 && (
                      <span
                          className="notification-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                  )}
                </div>

                {/* Notification Dropdown */}
                {/* CHANGE ALL INSTANCES OF "demoNotifications" TO "notifications".*/}
                {showNotifications && (
                    <div className="notification-dropdown">
                      <h5>Notifications</h5>
                      {notifications.length > 0 ? (
                          notifications.map((notification) => (
                              <div
                                  key={notification.id}
                                  className="notification-item"
                                  style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #f0f0f0',
                                  }}
                              >
                                <p>
                                  Invited to tree: <strong>{notification.treeId.treeName}</strong>
                                </p>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification.id,
                                            'accept',
                                            notification.treeId
                                        )
                                    }
                                    style={{
                                      marginRight: '2rem'
                                    }}
                                >
                                  Accept
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification.id,
                                            'deny',
                                            notification.treeId
                                        )
                                    }
                                >
                                  Deny
                                </button>
                              </div>
                          ))
                      ) : (
                          <p className="no-notifications">No new notifications</p>
                      )}
                    </div>
                )}
                <button className="btn btn-link">
                  <FaQuestionCircle/>
                </button>
                <button className="btn btn-link person-name" onClick={() => navigate('/account')}>
                  {username || "User"} {/* Display actual username or "User" if not loaded */}
                </button>
              </div>
            </div>
          </nav>

          {showCollaboratorTrees ? (
              <div className="container-custom">
                <div className="row">
                  {collaboratorTrees.map((tree) => (
                      <div key={tree.id} className="col-md-3 mb-4">
                        <div className="card tree-card" onClick={() => openTree(tree.id, tree.treeName, userId)}>
                          <img src="placeholder.png" className="card-img-top tree-image" alt={tree.treeName} />
                          <div className="card-body text-center">
                            <h5 className="card-title tree-title">{tree.treeName}</h5>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          ) : (
              <>
                <div className="container-custom">
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
              </>) }
        </div>
      </div>
  );
};

export default DashboardPage;