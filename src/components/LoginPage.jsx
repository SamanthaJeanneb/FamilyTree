// components/LoginPage.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';

const LoginPage = ({ setIsAuthenticated, setIsGuest }) => {
  const handleGoogleLoginSuccess = (response) => {
    console.log('Google Login Success:', response);
    setIsAuthenticated(true);
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failure:', error);
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
  };

  return (
    <div className="login-page-container">
      <div className="left-section">
        <div className="branding">
          <div><img src="familytreelogo.png" alt="Tree" className="login-logo" /></div>
          <h2>Connect with family</h2>
          <p>
            Create, manage, and share your family history with ease.
            Collaborate with loved ones to build a visual family tree and
            preserve your legacy for future generations.
          </p>
        </div>
      </div>
      <div className="right-section">
        <div className="login-box">
          <h2>Sign in</h2>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            text="signin_with"
            width="300"
          />
          <button className="guest-mode-button" onClick={handleGuestLogin}> Guest Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
