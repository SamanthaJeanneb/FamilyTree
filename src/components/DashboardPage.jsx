import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaQuestionCircle, FaPlus, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DashboardPage.css';
import { Trash, Star, Network, PanelsTopLeft } from 'lucide-react';
import axios from "axios";
import MergeHandler from './handlers/MergeHandler';

const DashboardPage = ({ isAuthenticated, setIsAuthenticated, setUser, user }) => {
    const [isCreatePromptOpen, setCreatePromptOpen] = useState(false);
    const [mergeId, setMergeId] = useState(null); // Store mergeId for MergeHandler
    const [showMergeHandler, setShowMergeHandler] = useState(false); // Toggle MergeHandler visibility
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
    const [mergeRequests, setMergeRequests] = useState([]);


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
    const handleMergeNotificationClick = (notification) => {
      console.log("Notification clicked:", notification); // Log the entire notification object
      const mergeId = parseInt(notification.url, 10); // Extract mergeId from URL
  
      if (!isNaN(mergeId)) {
          console.log("Extracted mergeId:", mergeId); // Log the extracted mergeId
          setMergeId(mergeId); // Set the mergeId
          setShowMergeHandler(true); // Show MergeHandler
      } else {
          console.error("Invalid mergeId in notification URL:", notification.url); // Log an error with the invalid URL
      }
  };
  

  const closeMergeHandler = () => {
      setShowMergeHandler(false);
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

    const handleNotificationClick = async (notification) => {
      try {
          if (notification.message.startsWith("A merge")) {
              // Handle merge request using stored mergeRequestId
              const mergeRequest = mergeRequests.find(
                  (request) => request.treeName === notification.treeId.treeName
              );
  
              if (mergeRequest) {
                  const action = notification.action || "accept";
                  const url =
                      action === "accept"
                          ? `/demo/acceptMergeRequest?mergeRequestId=${mergeRequest.id}`
                          : `/demo/declineMergeRequest?mergeRequestId=${mergeRequest.id}`;
  
                  await axios.post(url, {}, { withCredentials: true });
                  setMessage(`Merge request ${action}ed successfully.`);
              } else {
                  setMessage("Merge request not found.");
              }
  
              // Delete the notification after opening the merge handler
              await axios.delete(`/demo/notifications/delete`, {
                  params: { userId, notificationId: notification.id },
                  withCredentials: true,
              });
  
              setNotifications((prev) => prev.filter((notif) => notif.id !== notification.id));
          } else if (notification.message.startsWith("A new")) {
              // Handle suggested edits
              navigate(`/tree/${encodeURIComponent(notification.treeId.treeName)}`, {
                  state: { treeId: notification.treeId.id, userId },
              });
          } else if (notification.message.startsWith("You")) {
              // Handle collaboration invite
              const action = notification.action || "accept";
              const url =
                  action === "accept"
                      ? `/demo/acceptCollaboration?notificationId=${notification.id}&userId=${userId}`
                      : `/demo/declineCollaboration?notificationId=${notification.id}&userId=${userId}`;
  
              const response = await axios.post(url, {}, { withCredentials: true });
              setMessage(`Collaboration ${action}ed successfully.`);
              if (response.data.includes("accepted") || response.data.includes("declined")) {
                  setMessage(`Collaboration ${action}ed successfully.`);
              }
              // Navigate to the accepted tree
              if (action === "accept" && notification.treeId?.treeName) {
                  navigate(`/tree/${encodeURIComponent(notification.treeId.treeName)}`, {
                      state: { treeId: notification.treeId.id, userId },
                  });
              }
          }
  
          // Delete the notification (fallback for other cases)
          await axios.delete(`/demo/notifications/delete`, {
              params: { userId, notificationId: notification.id },
              withCredentials: true,
          });
  
          setNotifications((prev) => prev.filter((notif) => notif.id !== notification.id));
      } catch (error) {
          console.error("Error handling notification:", error);
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
            const updatedTrees = attachTreeImages(data); // Attach images to trees
            setTrees(updatedTrees);
        } catch (error) {
            console.error("Error fetching trees:", error);
            setMessage(`Error fetching trees: ${error.message}`);
        }
    };


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
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    treeName: treeName || 'SampleTree',
                    privacySetting: visibility === 'public' ? 'Public' : 'Private',
                    userId: userId.toString(),
                }),
            });

            if (response.ok) {
                const data = await response.json(); // Parse JSON response
                if (data.treeId) {
                    setMessage(`Success: Tree '${treeName}' created successfully.`);
                    closeCreatePrompt();
                    navigate(`/tree/${encodeURIComponent(treeName)}`, { state: { treeId: data.treeId, userId } });
                } else {
                    setMessage(`Error: ${data.error || 'Tree ID not returned.'}`);
                }
            } else {
                setMessage(`Error: ${response.status}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };


    const openTree = (treeId, treeName, userId) => {
        console.log("Opening tree with ID:", treeId); // Debugging
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
    const attachTreeImages = (trees) => {
        return trees.map(tree => {
            const storedImage = localStorage.getItem(`treeImage_${tree.id}`);
            return {
                ...tree,
                image: storedImage || 'placeholder.png', // Use stored image or fallback
            };
        });
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
                    {/* <a className="star-icon">
              <Star/>
              <a href="#">Saved Trees</a>
            </a> */}
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
                            <a
                                key={tree.id}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent the default action
                                    openTree(tree.id, tree.treeName, user.id); // Use `user.id` as in the first example
                                }}
                            >
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
                                    <FaBell style={{ fontSize: '20px',
                                        color: '#333',
                                        marginRight: '15px',
                                        cursor: 'pointer', }} />
                                </button>
                                {notifications.length > 0 && (
                                    <span
                                        className="notification-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                                )}
                            </div>

                            {/* Notification Dropdown */}
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
                    {notification.message.startsWith("A new") ? (
                        // Suggested Edits Notification
                        <>
                            <p>
                                Suggested Edit for Tree: <strong>{notification.treeId.treeName}</strong>
                            </p>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                View Edits
                            </button>
                        </>
                    ) : notification.message.startsWith("A merge") ? (
                        // Merge Request Notification
                        <>
                            <p>
                                Merge Request for Tree: <strong>{notification.treeId.treeName}</strong>
                            </p>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleMergeNotificationClick(notification)}
                            >
                                View Merge Request
                            </button>
                        </>
                    ) : notification.message.startsWith("You") ? (
                        // Collaboration Invite
                        <>
                            <p>
                                Invited to tree: <strong>{notification.treeId.treeName}</strong>
                            </p>
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleNotificationClick({ ...notification, action: "accept" })}
                                style={{
                                    marginRight: '2rem',
                                }}
                            >
                                Accept
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleNotificationClick({ ...notification, action: "deny" })}
                            >
                                Deny
                            </button>
                        </>
                    ) : (
                        <p>Unknown notification type</p>
                    )}
                </div>
            ))
        ) : (
            <p className="no-notifications">No new notifications</p>
        )}
         
    </div>
)}


                            <button className="btn btn-link">
                                <FaQuestionCircle style={{ color: 'black' }} />
                            </button>
                            <div
                                className="d-flex align-items-center"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/account')}
                            >
                                {/* Placeholder Profile Picture */}
                                <img
                                    src="/profile-placeholder.png"
                                    alt="Profile"
                                    style={{
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        marginRight: '8px',
                                    }}
                                />
                                {/* Username */}
                                <span style={{ fontSize: '16px', color: 'black' }}>
              {username || 'User'}
            </span>
                                {/* Caret Down Icon */}
                                <FaCaretDown
                                    style={{ fontSize: '14px', marginLeft: '5px', color: '#333' }}
                                />
                            </div>

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
                                {trees.map(tree => (
                                    <div
                                        className="col-md-3 mb-4"
                                        key={tree.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, tree.id)}
                                    >
                                        <div className="card tree-card" onClick={() => openTree(tree.id, tree.treeName, user.id)}>
                                            <img src={tree.image} className="card-img-top tree-image" alt={tree.treeName} />
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
                        {message && (
                            <div
                                className="custom-alert"
                                style={{
                                    "--bg-color": message.includes("Success") ? "#eafaf1" : "#ffecec",
                                    "--border-color": message.includes("Success") ? "#8bc34a" : "#f44336",
                                    "--text-color": message.includes("Success") ? "#4caf50" : "#f44336",
                                    "--icon-bg": message.includes("Success") ? "#d9f2e6" : "#ffe6e6",
                                    "--icon-color": message.includes("Success") ? "#4caf50" : "#f44336",
                                }}
                            >
                                <div className="icon">
                                    {message.includes("Success") ? "✓" : "✕"}
                                </div>
                                <span>{message}</span>
                                <button className="close-btn" onClick={() => setMessage("")}>
                                    ✕
                                </button>
                            </div>
                        )}




                    </>) }
                    <div className = "merge-handler">
{showMergeHandler && (
                    <MergeHandler mergeId={mergeId} onClose={closeMergeHandler} />
                )}

</div>
            </div>
        </div>
    );
};

export default DashboardPage;