import React, { useState } from 'react';
import { FaBell, FaInfoCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom'; // Import useParams
import './FamilyTreePage.css';

const FamilyTreePage = ({ numberOfPeople }) => {
  const { treeName } = useParams(); // Retrieve treeName from URL
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="tree-page-container">
      {/* First header */}
      <div className="tree-page-header">
        <h1>
          <img src="/familytreelogo.png" alt="Tree" /> | {treeName}
        </h1>
        <div className="user-info">
          <span>Person Name</span>
          <button className="icon-button">
            <FaBell />
          </button>
          <button className="icon-button">
            <FaInfoCircle />
          </button>
        </div>
      </div>

      {/* Action header */}
      <div className="tree-action-header">
        <div className="tree-info">
          <span>{numberOfPeople} of {numberOfPeople} people</span>
        </div>
        <div className="tree-search">
          <input type="text" placeholder="Find person" className="search-input" />
        </div>
      </div>

      {/* Main content */}
      <div className="tree-view-section">
        <h2>Welcome to your family tree! Start here:</h2>
        <div className="add-individual">
          <button className="add-individual-button" onClick={openModal}>
            <span className="add-individual-icon">+</span>
            <span className="add-individual-text">Add Individual</span>
          </button>
        </div>
      </div>

      {/* Modal for Add Individual Form */}
      {isModalOpen && (
        <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
          <div className="modal-content p-4" style={{ width: '400px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-center">Add New Individual</h2>
            <form className="add-person-form">
              {/* Name input */}
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" className="form-control" id="name" name="name" placeholder="Name" required />
              </div>

              {/* Sex selection */}
              <div className="form-group">
                <label>Sex</label>
                <div className="form-check">
                  <input type="radio" className="form-check-input" id="male" name="sex" value="male" />
                  <label className="form-check-label" htmlFor="male">Male</label>
                </div>
                <div className="form-check">
                  <input type="radio" className="form-check-input" id="female" name="sex" value="female" />
                  <label className="form-check-label" htmlFor="female">Female</label>
                </div>
              </div>

              {/* Birthdate picker */}
              <div className="form-group">
                <label htmlFor="birthdate">Birthdate</label>
                <input type="date" className="form-control" id="birthdate" name="birthdate" required />
              </div>

              {/* Form buttons */}
              <div className="form-buttons d-flex justify-content-between">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreePage;
