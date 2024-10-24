import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import GuestDashboardPage from "./components/GuestDashboardPage";
import FamilyTreePage from "./components/FamilyTreePage";
import LoginPage from "./components/LoginPage";
import './App.css';
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //google auth
  const [isGuest, setIsGuest] = useState(false); // Handle Guest Mode

  return (
    <GoogleOAuthProvider clientId="941315814936-lr9t64jraj3nn88t3soir0b2p9pe1rlr.apps.googleusercontent.com">
      <Router>
        <div className="app-container">
          <Routes>
            {}
            <Route
              path="/"
              element={!isAuthenticated && !isGuest ? (
                <LoginPage setIsAuthenticated={setIsAuthenticated} setIsGuest={setIsGuest} />
              ) : isGuest ? (
                <Navigate to="/guest-dashboard" />
              ) : (
                <Navigate to="/dashboard" />
              )}
            />
            
            {}
            <Route path="/dashboard" element={<DashboardPage />} />

            {}
            <Route path="/guest-dashboard" element={<GuestDashboardPage />} />

            {}
            <Route path="/tree/:treeName" element={<FamilyTreePage />} /> {}

            {}
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
