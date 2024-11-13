import React, { useState, useEffect } from 'react';
import { FaBell, FaQuestionCircle } from 'react-icons/fa';
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
    sex: 'Male', // default value, aligns with ENUM values
    birthdate: '',
    deathdate: '',
    additionalInfo: '',
    isPrivate: false
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error("User not authenticated");
      setUser(null);
      navigate('/');
    } else {
      fetchUser();
      fetchFamilyMembers();
    }
  }, []);

  const fetchUser = () => {
    axios.get('http://localhost:8080/api/login', { withCredentials: true })
      .then(response => {
        if (response.data && response.data.token) {
          localStorage.setItem('accessToken', response.data.token);
          setIsAuthenticated(true);
          setUser(response.data);
        }
      })
      .catch(error => {
        console.log("User not authenticated:", error);
        setIsAuthenticated(false);
      });
  };

  const fetchFamilyMembers = () => {
    const accessToken = localStorage.getItem('accessToken');
    axios.get('/demo/getFamilyMembersInTree', {
      params: { treeId: 2 },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    .then(response => {
      console.log("Fetched family members:", response.data); // Log the response
      setIndividuals(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 401) {
        window.location.href = 'https://accounts.google.com/o/oauth2/auth?prompt=select_account&response_type=code&client_id=YOUR_CLIENT_ID&scope=email%20profile&redirect_uri=http://localhost:8080/login/oauth2/code/google';
      } else {
        console.error("Error fetching family members:", error);
      }
    });
  };
  

  const deleteFamilyMember = async (memberId) => {
    if (memberId === undefined || memberId === null) {
      console.error("Error: memberId is undefined or null.");
      return;
    }
  
    try {
      const response = await fetch('/demo/deleteFamilyMember', {  // Absolute URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ memberId: memberId.toString() }), // Ensure memberId is sent as a string
      });
  
      if (response.ok) {
        const message = await response.text();
        console.log(`Success: ${message}`);
        // Update the individuals state to remove the deleted member using correct field
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');

    const formattedBirthdate = newPerson.birthdate ? new Date(newPerson.birthdate).toISOString().split('T')[0] : '';
    const formattedDeathdate = newPerson.deathdate ? new Date(newPerson.deathdate).toISOString().split('T')[0] : '';

    const formData = new URLSearchParams();
    formData.append('name', newPerson.name);
    formData.append('birthdate', formattedBirthdate);
    formData.append('gender', newPerson.sex);
    formData.append('userId', 1);             // Replace with actual user ID
    formData.append('treeId', 2);             // Replace with actual tree ID
    formData.append('addedById', 1);          // Replace with actual added by ID
    if (newPerson.deathdate) formData.append('deathdate', formattedDeathdate);
    if (newPerson.additionalInfo) formData.append('additionalInfo', newPerson.additionalInfo);
    formData.append('isPrivate', newPerson.isPrivate);

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
      if (error.response) {
        console.error("Error adding family member:", error.response.data);
      } else {
        console.error("Unknown error:", error);
      }
    });
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
        <button onClick={() => {
          console.log("Clicked delete for memberId:", person.memberId); // Log for debugging
          deleteFamilyMember(person.memberId);
        }} className="btn btn-danger">
          Delete
        </button>
      )}
    </li>
  ))}
</ul>



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
