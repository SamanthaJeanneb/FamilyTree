import React, { useState, useEffect } from 'react';
import { FaBell, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom'; 
import './FamilyTreePage.css';
import axios from "axios";

const FamilyTreePage = ({ numberOfPeople, setIsAuthenticated, setUser }) => {
  const { treeName } = useParams(); 
  const navigate = useNavigate(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [individuals, setIndividuals] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: '',
    sex: '',
    birthdate: ''
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
    if (!accessToken) {
      console.error("User not authenticated");
      setUser(null);
      navigate('/');
    } else {
      fetchUser();
      const storedIndividuals = JSON.parse(localStorage.getItem('individuals')) || [];
      setIndividuals(storedIndividuals);
    }

  }, []);

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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevPerson) => ({
      ...prevPerson,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updatedIndividuals = [...individuals, newPerson];
    setIndividuals(updatedIndividuals);
    localStorage.setItem('individuals', JSON.stringify(updatedIndividuals));
    setNewPerson({ name: '', sex: '', birthdate: '' });
    closeModal();
  };

  const handleDelete = (index) => {
    const updatedIndividuals = individuals.filter((_, i) => i !== index);
    setIndividuals(updatedIndividuals);
    localStorage.setItem('individuals', JSON.stringify(updatedIndividuals));
  };

  return (
    <div className="tree-page-container">
      <div className="tree-page-header">
        <h1>
          <img src="/familytreelogo.png" alt="Tree" /> | {treeName}
        </h1>
        <div className="d-flex align-items-center">
          <button className="icon-button">
            <FaBell />
          </button>
          <button className="icon-button">
            <FaQuestionCircle />
          </button>
          <button
            className="icon-button person-name"
            onClick={() => navigate('/account')}
          >
            Person Name
          </button>
        </div>
      </div>

      <div className="tree-action-header">
        <div className="tree-info">
          <span>{individuals.length} of {numberOfPeople} people</span>
        </div>
        <div className="tree-search">
          <input type="text" placeholder="Find person" className="search-input" />
        </div>
      </div>

      <div className="tree-view-section">
        <h2>Welcome to your family tree! Start here:</h2>
        <div className="add-individual">
          <button className="add-individual-button" onClick={openModal}>
            <span className="add-individual-icon">+</span>
            <span className="add-individual-text">Add Individual</span>
          </button>
        </div>
        
        {/* Render added individuals */}
        <div className="individual-list">
          {individuals.map((person, index) => (
            <div key={index} className="individual-card">
              <h3>{person.name}</h3>
              <p>Gender: {person.sex}</p>
              <p>Birthdate: {person.birthdate}</p>
              <button
               style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
          <div className="modal-content p-4" style={{ width: '400px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-center">Add New Individual</h2>
            <form className="add-person-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={newPerson.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sex</label>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="male"
                    name="sex"
                    value="male"
                    checked={newPerson.sex === 'male'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="male">Male</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="female"
                    name="sex"
                    value="female"
                    checked={newPerson.sex === 'female'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="female">Female</label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="birthdate">Birthdate</label>
                <input
                  type="date"
                  className="form-control"
                  id="birthdate"
                  name="birthdate"
                  value={newPerson.birthdate}
                  onChange={handleInputChange}
                  required
                />
              </div>

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
