import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import GuestDashboardPage from "./components/GuestDashboardPage";
import FamilyTreePage from "./components/FamilyTreePage";
import SearchResults from "./components/SearchResults";
import LoginPage from "./components/LoginPage";
import AccountPage from "./components/AccountPage";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for authenticated access
  const [isGuest, setIsGuest] = useState(false); // Set to true for guest access if needed
  const [user, setUser] = useState({ name: "Test User" }); // Add mock user data

  // Comment out this useEffect block
  
  /*useEffect(() => {
    axios.get('http://localhost:8080/api/login', { withCredentials: true })
        .then(response => {
          if (response.data) {
            setIsAuthenticated(true);
            setUser(response.data);
          }
        })
        .catch(error => {
          console.log("User not authenticated:", error);
          setIsAuthenticated(false);
          setIsGuest(false);
        });
  }, []);
  */
  

  return (
      <Router>
        <div className="app-container">
          <Routes>
            <Route
                path="/"
                element={
                  !isAuthenticated && !isGuest ? (
                      <LoginPage setIsAuthenticated={setIsAuthenticated} setIsGuest={setIsGuest} />
                  ) : (isGuest ? (
                      <Navigate to="/guest-dashboard" />
                  ) : (
                      <Navigate to="/dashboard" />
                  ))
                }
            />
            <Route path="/dashboard" element={<DashboardPage isAuthenticated={isAuthenticated} user={user}  />} />
            <Route path="/guest-dashboard" element={<GuestDashboardPage />} />
            <Route path="/tree/:treeName" element={<FamilyTreePage />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/account" element={<AccountPage setIsAuthenticated={setIsAuthenticated} setIsGuest={setIsGuest}  isAuthenticated={isAuthenticated} user={user} setUser={setUser} />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;
