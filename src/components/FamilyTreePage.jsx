import React, { useState, useEffect, useRef } from 'react';
import FamilyTree from '@balkangraph/familytree.js';
import { FaBell, FaQuestionCircle } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import './FamilyTreePage.css';

const FamilyTreePage = ({ numberOfPeople }) => {
  const { treeName } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [individuals, setIndividuals] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: '',
    sex: '',
    birthdate: ''
  });
  const treeRef = useRef(null);
  const familyTreeInstance = useRef(null);

  useEffect(() => {
    const storedIndividuals = JSON.parse(localStorage.getItem('individuals')) || [];
    setIndividuals(storedIndividuals);

    if (treeRef.current && !familyTreeInstance.current) {
      familyTreeInstance.current = new FamilyTree(treeRef.current, {
        nodes: storedIndividuals,
        template: "hugo",
        nodeBinding: {
          field_0: "name",
          field_1: "birthdate",
        },
        nodeTreeMenu: true,
        search: true, // Enable the built-in search in the FamilyTree display
      });
    }
  }, []);

  useEffect(() => {
    if (familyTreeInstance.current) {
      familyTreeInstance.current.load(individuals);
    }
  }, [individuals]);

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
    const newId = (individuals.length + 1).toString();
    const updatedPerson = { ...newPerson, id: newId };

    const updatedIndividuals = [...individuals, updatedPerson];
    setIndividuals(updatedIndividuals);
    localStorage.setItem('individuals', JSON.stringify(updatedIndividuals));
    setNewPerson({ name: '', sex: '', birthdate: '' });
    closeModal();
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
          <span>{individuals.length} of {individuals.length} people</span>
        </div>
        {/* Remove custom search input */}
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

        <div ref={treeRef} style={{ width: '100%', height: '600px', display: individuals.length > 0 ? 'block' : 'none' }}></div>
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
