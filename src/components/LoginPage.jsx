import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './LoginPage.css';

const LoginPage = ({ setIsAuthenticated, setIsGuest }) => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleGoogleLogin = () => {
    // Redirect to the backend Google OAuth2 authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
  };

  const handleRedirectToTestPage = () => {
    // Redirect to the test page
    navigate('/test');
  };

  return (
    <div className="login-page-container">
      <div className="left-section">
        <div className="branding">
          <div><img src="/familytreelogo.png" alt="Tree" className="login-logo" /></div>
          <h2>Connect with family</h2>
          <p>
            Create, manage, and share your family history with ease.
            Collaborate with loved ones to build a visual family tree and
            preserve your legacy for future generations.
          </p>
        </div>
      </div>
      <div className="right-section">
        <div><img src="/treebackground.png" alt="Tree Background" className="tree-background" /></div>
        <div className="login-box">
          <h2>Sign in</h2>
          <div className="google-login-button">
            <button onClick={handleGoogleLogin} className="google-login-button">
              <img
                src="/google.png"
                alt="Google logo"
                className="google-logo"
              />
              Sign in with Google
            </button>
          </div>
          <button className="guest-mode-button" onClick={handleGuestLogin}>
            Guest Mode
          </button>
        </div>
      </div>

      {/* Button to redirect to the test page */}
      <button 
        className="redirect-button"
        onClick={handleRedirectToTestPage}
        style={{
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Test Page
      </button>
    </div>
  );
};

export default LoginPage;
