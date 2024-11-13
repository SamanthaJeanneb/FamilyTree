import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AccountPage.css';
import {useNavigate} from "react-router-dom";
import axios from "axios";

const AccountPage = ({setIsAuthenticated, setIsGuest, isAuthenticated, user, setUser}) => {
  const navigate = useNavigate();

  useEffect(() => {
      const accessToken = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
      if (!accessToken) {
          console.error("User not authenticated");
          setUser(null);
          navigate('/');
      } else {
          fetchUser();
      }
  }, []);

  const handleLogout = () => {
    axios.get('http://localhost:8080/api/logout', { withCredentials: true })
        .then(() => {
          setUser(null);
          setIsAuthenticated(false);  // Update authentication state
          setIsGuest(false);
            localStorage.removeItem('accessToken');
          navigate('/'); // Ensure guest state is false
        })
        .catch(error => {
          console.error("Error during logout:", error);
        });
  };

    const fetchUser = () => {
        axios.get('http://localhost:8080/api/login', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    if (response.data.token) {
                        localStorage.setItem('accessToken', response.data.token);
                        setIsAuthenticated(true);
                        setUser(response.data);
                    }
                }
            })
            .catch(error => {
                console.log("User not authenticated:", error);
                setIsAuthenticated(false);
            });
    }

  if (!user) return <p>Loading...</p>;

  return (
      <div className="account-container">
        <div className="account-card card">
          <h2>Account Details</h2>
          <div className="text-center">
            <img
                src='profile-placeholder.png'
                alt="Profile"
                className="rounded-circle img-thumbnail mb-3"
            />
          </div>
          <h4 className="text-center">{user.name}</h4>
          <p className="text-center">{user.email}</p>
          <button className="btn btn-primary w-20" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
  );
};

export default AccountPage;
