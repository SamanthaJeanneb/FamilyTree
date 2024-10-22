// components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to the Family Tree App</h1>
      <Link to="/create-account" className="home-link">Create Account</Link>
      <Link to="/family-tree" className="home-link">View Family Tree</Link>
    </div>
  );
};

export default HomePage;
