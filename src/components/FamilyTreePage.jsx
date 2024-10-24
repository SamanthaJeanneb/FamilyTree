import React, { useState } from 'react';
import { FaBell, FaInfoCircle } from 'react-icons/fa'; //import notification and info icons
import './FamilyTreePage.css'; //updated the CSS file reference

const FamilyTreePage = ({ treeName, numberOfPeople }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); //state to control modal visibility

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="tree-page-container">
      {/* First header */}
      <div className="tree-page-header">
        <h1>Family Tree | {treeName}</h1>
        <div className="user-info">
          <span>Person Name</span>
          <button className="icon-button">
            <FaBell /> {/* Notification Icon */}
          </button>
          <button className="icon-button">
            <FaInfoCircle /> {/* Info Icon */}
          </button>
        </div>
      </div>

      {}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Individual</h2>
            <form className="add-person-form">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Name" required />

              <label>Sex</label>
              <div className="radio-group">
                <input type="radio" id="male" name="sex" value="male" />
                <label htmlFor="male">Male</label>
                <input type="radio" id="female" name="sex" value="female" />
                <label htmlFor="female">Female</label>
              </div>

              <label htmlFor="birthdate">Birthdate</label>
              <input type="date" id="birthdate" name="birthdate" required />

              <div className="form-buttons">
                <button type="button" onClick={closeModal} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="create-button">
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
