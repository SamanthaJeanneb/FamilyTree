import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaQuestionCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './FamilyTreePage.css';
import axios from 'axios';
import FamilyTree from '@balkangraph/familytree.js';

const FamilyTreePage = ({ numberOfPeople, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { treeId } = location.state || {}; 
  const { treeName } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [individuals, setIndividuals] = useState([]);
  const userId = 1; 
  const treeContainerRef = useRef(null);
  const familyTreeInstance = useRef(null);

  const [newPerson, setNewPerson] = useState({
    name: '',
    sex: 'Male',
    birthdate: '',
    deathdate: '',
    additionalInfo: '',
    isPrivate: false,
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      navigate('/');
    } else if (treeId && userId) {
      fetchFamilyMembers();
    }
  }, [treeId, userId]);

  useEffect(() => {
    if (individuals.length > 0) {
      renderFamilyTree();
    }
  }, [individuals]);

  const fetchFamilyMembers = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!treeId) return;

    axios.get('/demo/getFamilyMembersInTree', {
      params: { treeId },
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      setIndividuals(response.data);
    })
    .catch((error) => {
      console.error('Error fetching family members:', error);
    });
  };

  const renderFamilyTree = () => {
    const nodes = individuals.map((person) => ({
      id: person.memberId,
      name: person.name,
      birthdate: person.birthdate,
      gender: person.gender,
      additionalInfo: person.additionalInfo,
      img: person.gender === 'Male' ? 'https://balkangraph.com/js/img/john-m.png' : 'https://balkangraph.com/js/img/john-f.png',
    }));

    if (familyTreeInstance.current) {
      familyTreeInstance.current.clear(); // Clear the old tree before re-rendering
    }

    familyTreeInstance.current = new FamilyTree(treeContainerRef.current, {
      template: 'john',
      nodes: nodes,
      nodeBinding: {
        field_0: 'name',
        field_1: 'birthdate',
        img_0: 'img',
      },
    });
  };

  const deleteFamilyMember = (memberId) => {
    const accessToken = localStorage.getItem('accessToken');
    axios.post('/demo/deleteFamilyMember', new URLSearchParams({ memberId: memberId.toString() }), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(() => {
      setIndividuals((prev) => prev.filter((member) => member.memberId !== memberId)); // Remove from state
      familyTreeInstance.current.removeNode(memberId); // Update the family tree visualization
      renderFamilyTree(); // Re-render the family tree to reflect changes
    })
    .catch((error) => {
      console.error('Error deleting family member:', error);
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    const formattedBirthdate = newPerson.birthdate ? new Date(newPerson.birthdate).toISOString().split('T')[0] : '';
    const formattedDeathdate = newPerson.deathdate ? new Date(newPerson.deathdate).toISOString().split('T')[0] : '';

    const formData = new URLSearchParams();
    formData.append('name', newPerson.name);
    formData.append('birthdate', formattedBirthdate);
    formData.append('gender', newPerson.sex);
    formData.append('userId', userId);
    formData.append('treeId', treeId);
    formData.append('addedById', userId);
    if (formattedDeathdate) formData.append('deathdate', formattedDeathdate);
    if (newPerson.additionalInfo) formData.append('additionalInfo', newPerson.additionalInfo);
    formData.append('isPrivate', newPerson.isPrivate.toString());

    axios.post('/demo/addFamilyMember', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(() => {
      fetchFamilyMembers();
      setNewPerson({ name: '', sex: 'Male', birthdate: '', deathdate: '', additionalInfo: '', isPrivate: false });
      closeModal();
    })
    .catch((error) => console.error('Error adding family member:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevPerson) => ({ ...prevPerson, [name]: value }));
  };

  return (
    <div className="tree-page-container">
      <div className="tree-page-header">
        <h1><img src="/familytreelogo.png" alt="Tree" /> | {treeName}</h1>
        <div className="d-flex align-items-center">
          <button className="icon-button"><FaBell /></button>
          <button className="icon-button"><FaQuestionCircle /></button>
          <button className="icon-button person-name" onClick={() => navigate('/account')}>Person Name</button>
        </div>
      </div>

      <div className="tree-action-header">
        <div className="tree-info">
          <span>{individuals.length} of {individuals.length} people</span>
        </div>
      </div>

      <div className="tree-view-section">
        
        {individuals.length === 0 && (
          <div className="add-individual">
            <h2>Welcome to your family tree! Start here:</h2>
            <button className="add-individual-button" onClick={openModal}>
              <span className="add-individual-icon">+</span>
              <span className="add-individual-text">Add Individual</span>
            </button>
          </div>
        )}

        <div ref={treeContainerRef} className="tree-view-section" style={{ width: '100%', height: '600px' }}></div>
      </div>

      {individuals.length > 0 && (
        <button className="floating-add-button" onClick={openModal} title="Add Individual">
          +
        </button>
      )}

      {individuals.length > 0 && (
        <div className="delete-buttons-container">
          {individuals.map((person) => (
            <button key={person.memberId} onClick={() => deleteFamilyMember(person.memberId)} className="btn btn-danger">
              <FaTrash /> Delete
            </button>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
          <div className="modal-content p-4" style={{ width: '400px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-center">Add New Individual</h2>
            <form className="add-person-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" className="form-control" id="name" name="name" placeholder="Name" value={newPerson.name} onChange={handleInputChange} required />
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
                <input type="date" className="form-control" id="birthdate" name="birthdate" value={newPerson.birthdate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="deathdate">Deathdate</label>
                <input type="date" className="form-control" id="deathdate" name="deathdate" value={newPerson.deathdate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="additionalInfo">Additional Info</label>
                <textarea className="form-control" id="additionalInfo" name="additionalInfo" placeholder="Additional information" value={newPerson.additionalInfo} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="isPrivate">Private</label>
                <input type="checkbox" id="isPrivate" name="isPrivate" checked={newPerson.isPrivate} onChange={(e) => setNewPerson(prev => ({ ...prev, isPrivate: e.target.checked }))} />
              </div>
              <div className="form-buttons d-flex justify-content-between">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreePage;
