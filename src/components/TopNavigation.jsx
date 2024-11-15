// TopNavigation.js
import React, { useState } from 'react';
import { FaBell, FaQuestionCircle } from 'react-icons/fa';
import axios from 'axios';

const TopNavigation = ({ username, notifications, toggleNotifications, handleNotificationClick, onNavigateToAccount }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
      <div className="container-fluid">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(73, 73, 73)' }}>Your Trees</h1>
        <div className="d-flex align-items-center">
          <button className="btn btn-link" onClick={toggleNotifications}>
            <FaBell />
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">
              <h5>Notifications</h5>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="notification-item"
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
          <button className="btn btn-link person-name" onClick={onNavigateToAccount}>
            {username || 'User'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
