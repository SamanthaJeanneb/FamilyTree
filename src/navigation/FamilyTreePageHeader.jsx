import React, { useState, useEffect } from 'react';
import { FaBell, FaCaretDown } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FamilyTreePageHeader.css'; // Import the custom CSS

const FamilyTreePageHeader = ({ username, userId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [message, setMessage] = useState('');
    // Determine if the "About" page is active
    const isAboutActive = location.pathname === '/about';

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

    // Toggle notifications dropdown
    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (notification.message.startsWith("A")) {

                navigate(`/tree/${encodeURIComponent(notification.treeId.treeName)}`, {
                    state: { treeId: notification.treeId.id, userId },
                });
                setNotifications((prev) => prev.filter((notif) => notif.id !== notification.id));

            } else if (notification.message.startsWith("You")) {
                // Collaboration Invite notification
                const action = notification.action || "accept"; // Default action is 'accept'
                const url =
                    action === "accept"
                        ? `/demo/acceptCollaboration?notificationId=${notification.id}&userId=${userId}`
                        : `/demo/declineCollaboration?notificationId=${notification.id}&userId=${userId}`;

                const response = await axios.post(url, {}, { withCredentials: true });

                console.log("Collaboration response:", response.data);

                if (response.data.includes("accepted") || response.data.includes("declined")) {
                    // Remove notification from the state
                    setNotifications((prev) => prev.filter((notif) => notif.id !== notification.id));
                    setMessage(`Collaboration ${action}ed successfully.`);
                }
            }
        } catch (error) {
            console.error("Error handling notification:", error);
            setMessage(`Error: ${error.message}`);
        }
    };


    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <nav
            className="navbar navbar-expand-lg navbar-light bg-light shadow-sm"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                height: '70px',
                padding: '0 20px',
            }}
        >
            <div className="container-fluid">
                {/* Logo and Title */}
                <div
                    className="navbar-brand d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <img
                        src="/familytreelogo.png"
                        alt="Tree Logo"
                        style={{ height: '50px' }}
                    />
                </div>

                {/* Center Navigation Links */}
                <div
                    className="collapse navbar-collapse justify-content-center"
                    style={{ flex: 1 }}
                >
                    <ul className="navbar-nav">
                        <li className="nav-item">
              <span
                  className={`nav-link ${!isAboutActive ? 'default-active' : ''}`}
                  onClick={() => navigate('/tree')}
              >
                Family Tree
              </span>
                        </li>
                        <li className="nav-item">
              <span className="nav-link" onClick={() => navigate('/dashboard')}>
                Dashboard
              </span>
                        </li>
                        <li className="nav-item">
              <span
                  className={`nav-link ${isAboutActive ? 'active' : ''}`}
                  onClick={() => navigate('/about')}
              >
                About
              </span>
                        </li>
                    </ul>
                </div>

                {/* Right Section */}
                <div className="d-flex align-items-center">
                    {/* Bell Icon */}
                    <div className="notification-icon-wrapper position-relative m-3">
                        <button className="btn btn-link" onClick={toggleNotifications} style={{padding: '0px'}}>
                            <FaBell style={{
                                fontSize: '20px',
                                color: '#333',
                                marginRight: '15px',
                                cursor: 'pointer',
                            }}/>
                        </button>
                        {notifications.length > 0 && (
                            <span className="notification-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.length}
              </span>
                        )}

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <h5>Notifications</h5>
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className="notification-item"
                                             style={{
                                                 padding: '10px',
                                                 borderBottom: '1px solid #f0f0f0',
                                             }}
                                        >

                                            {notification.message.startsWith('A') ? (
                                                // Suggested Edits
                                                <>
                                                    <p>
                                                        Suggested Edit: <strong>{notification.treeId.treeName}</strong>
                                                    </p>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        View Edits
                                                    </button>
                                                </>
                                            ) : notification.message.startsWith('You') ? (
                                                // Collaboration Invite
                                                <>
                                                    <p>
                                                        Invited to tree: <strong>{notification.treeId.treeName}</strong>
                                                    </p>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() =>
                                                            handleNotificationClick({...notification, action: 'accept'})
                                                        }
                                                        style={{
                                                            marginRight: '2rem',
                                                        }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            handleNotificationClick({...notification, action: 'deny'})
                                                        }
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
                    </div>

                    {/* User Section */}
                    <div
                        className="d-flex align-items-center"
                        style={{cursor: 'pointer'}}
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
    );
};

export default FamilyTreePageHeader;
