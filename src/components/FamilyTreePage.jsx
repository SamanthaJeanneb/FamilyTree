import React, { useState, useEffect } from 'react';
import { FaBell, FaQuestionCircle, FaPlus } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './FamilyTreePage.css';
import axios from "axios";

const FamilyTreePage = ({ numberOfPeople, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { treeId } = location.state || {}; // Retrieve treeId from state
  const treeName = location.pathname.split('/')[2]; // Retrieve treeName from URL if needed

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [individuals, setIndividuals] = useState([]);
  const userId = 1; // Hardcoded userId as 1
  const [newPerson, setNewPerson] = useState({
    name: '',
    sex: 'Male',
    birthdate: '',
    deathdate: '',
    additionalInfo: '',
    isPrivate: false
  });

  useEffect(() => {
    console.log("treeId from state:", treeId, "userId (hardcoded):", userId);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error("User not authenticated");
      setUser(null);
      navigate('/');
    } else if (treeId && userId) {
      fetchFamilyMembers();
    }
  }, [treeId, userId]);

  const fetchFamilyMembers = () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!treeId) {
      console.error("treeId is undefined or null. Cannot fetch family members.");
      return;
    }

    axios.get('/demo/getFamilyMembersInTree', {
      params: { treeId },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    .then(response => {
      console.log("Fetched family members:", response.data);
      setIndividuals(response.data);
    })
    .catch(error => {
      console.error("Error fetching family members:", error);
      if (error.response && error.response.status === 401) {
        window.location.href = 'https://accounts.google.com/o/oauth2/auth?prompt=select_account&response_type=code&client_id=YOUR_CLIENT_ID&scope=email%20profile&redirect_uri=http://localhost:8080/login/oauth2/code/google';
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');

    const formattedBirthdate = newPerson.birthdate ? new Date(newPerson.birthdate).toISOString().split('T')[0] : '';
    const formattedDeathdate = newPerson.deathdate ? new Date(newPerson.deathdate).toISOString().split('T')[0] : '';

    const formData = new URLSearchParams();
    formData.append('name', newPerson.name);
    formData.append('birthdate', formattedBirthdate);
    formData.append('gender', newPerson.sex);
    formData.append('userId', userId); // Hardcoded userId
    formData.append('treeId', treeId); // Use treeId from state
    formData.append('addedById', userId); // Hardcoded userId for addedById
    if (formattedDeathdate) formData.append('deathdate', formattedDeathdate);
    if (newPerson.additionalInfo) formData.append('additionalInfo', newPerson.additionalInfo);
    formData.append('isPrivate', newPerson.isPrivate.toString());

    console.log("Form data to be sent:", Object.fromEntries(formData.entries()));

    axios.post('/demo/addFamilyMember', formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      console.log("Family member added:", response.data);
      fetchFamilyMembers();
      setNewPerson({ name: '', sex: 'Male', birthdate: '', deathdate: '', additionalInfo: '', isPrivate: false });
      closeModal();
    })
    .catch(error => {
      console.error("Error adding family member:", error);
    });
  };

  const deleteFamilyMember = async (memberId) => {
    if (!memberId) {
      console.error("Error: memberId is undefined or null.");
      return;
    }

    try {
      const response = await fetch('/demo/deleteFamilyMember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ memberId: memberId.toString() }),
      });

      if (response.ok) {
        const message = await response.text();
        console.log(`Success: ${message}`);
        setIndividuals((prevIndividuals) => prevIndividuals.filter((person) => person.memberId !== memberId));
      } else {
        console.error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting family member: ${error.message}`);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevPerson) => ({
      ...prevPerson,
      [name]: value
    }));
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
          <button className="icon-button person-name" onClick={() => navigate('/account')}>
            Person Name
          </button>
        </div>
      </div>

      <div className="tree-action-header">
        <div className="tree-info">
          <span>{individuals.length} of {numberOfPeople} people</span>
        </div>
      </div>

      <div className="tree-view-section">
        {individuals.length === 0 && <h2>Welcome to your family tree! Start here:</h2>}
        {individuals.length === 0 && (
          <div className="add-individual">
            <button className="add-individual-button" onClick={openModal}>
              <span className="add-individual-icon">+</span>
              <span className="add-individual-text">Add Individual</span>
            </button>
          </div>
        )}

        <ul className="individual-list">
          {individuals.map((person) => (
            <li key={person.memberId} className="individual-card">
              <h3>{person.name}</h3>
              <p>Birthdate: {person.birthdate}</p>
              <p>Deathdate: {person.deathdate || 'N/A'}</p>
              <p>Gender: {person.gender}</p>
              <p>Additional Info: {person.additionalInfo || 'N/A'}</p>
              {person.memberId && (
                <button onClick={() => deleteFamilyMember(person.memberId)} className="btn btn-danger">
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {individuals.length > 0 && (
        <button className="floating-add-button" onClick={openModal} title="Add Individual">
  +
</button>

      )}

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
                <select className="form-control" name="sex" value={newPerson.sex} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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
              <div className="form-group">
                <label htmlFor="deathdate">Deathdate</label>
                <input
                  type="date"
                  className="form-control"
                  id="deathdate"
                  name="deathdate"
                  value={newPerson.deathdate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="additionalInfo">Additional Info</label>
                <textarea
                  className="form-control"
                  id="additionalInfo"
                  name="additionalInfo"
                  placeholder="Additional information"
                  value={newPerson.additionalInfo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="isPrivate">Private</label>
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={newPerson.isPrivate}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, isPrivate: e.target.checked }))}
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
