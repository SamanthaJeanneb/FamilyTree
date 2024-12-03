import React, { useState, useEffect } from 'react';
import { FaBell, FaCaretDown } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FamilyTreePageHeader.css'; // Import the custom CSS

const FamilyTreePageHeader = ({ username, userId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the "About" page is active
  const isAboutActive = location.pathname === '/about';

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = () => {
    axios
      .get(`/demo/notifications/${userId}`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setNotifications(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
      });
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  // Mark notification as read
  const handleNotificationClick = async (notification) => {
    try {
      // If the action is to accept or deny a collaboration, handle it accordingly
      if (notification.action) {
        await axios.post(`/demo/notifications/${notification.id}/action`, {
          action: notification.action,
          withCredentials: true,
        });
      } else {
        await axios.post(`/demo/notifications/${notification.id}/mark-read`, {
          withCredentials: true,
        });
      }

      // Remove the notification from the state
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notification.id)
      );
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  // Fetch notifications on mount
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
          <div className="notification-wrapper">
            <FaBell
              style={{
                fontSize: '20px',
                color: '#333',
                marginRight: '15px',
                cursor: 'pointer',
              }}
              onClick={toggleNotifications}
            />
            {notifications.length > 0 && (
              <span className="notification-count badge bg-danger">
                {notifications.length}
              </span>
            )}

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown">
                <h5>Notifications</h5>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.message}</p>

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
                              handleNotificationClick({ ...notification, action: 'accept' })
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
                              handleNotificationClick({ ...notification, action: 'deny' })
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
  );
};

export default FamilyTreePageHeader;
