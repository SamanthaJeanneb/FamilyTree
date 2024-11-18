import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import GuestDashboardPage from "./components/GuestDashboardPage";
import FamilyTreePage from "./components/FamilyTreePage";
import LoginPage from "./components/LoginPage";
import AccountPage from "./components/AccountPage";
import SearchResults from "./components/SearchResults";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBullseye } from "react-icons/fa6";
import FamilyTreePageTest from "./tests/FamilyTreePageTest";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Set to true for authenticated access
  const [isGuest, setIsGuest] = useState(false); // Set to true for guest access if needed
  const [user, setUser] = useState({ name: "Test User" }); // Add mock user data

  // Comment out this useEffect block
  
  useEffect(() => {
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
          setIsGuest(false);
        });
  }, []);


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
              <Route path="/dashboard" element={<DashboardPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser}  />} />
              <Route path="/guest-dashboard" element={<GuestDashboardPage />} />
              <Route path="/test" element={<FamilyTreePageTest />} />
              <Route path="/tree/:treeName" element={<FamilyTreePage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
              <Route path="/search-results" element={<SearchResults setIsAuthenticated={setIsAuthenticated} user={user} setUser={setUser} />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/account" element={<AccountPage setIsAuthenticated={setIsAuthenticated} setIsGuest={setIsGuest} user={user} setUser={setUser} />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;
