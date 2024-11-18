import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaQuestionCircle, FaTrash } from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './FamilyTreePage.css';
import axios from 'axios';
import FamilyTree from '@balkangraph/familytree.js';

const FamilyTreePage = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { treeId } = location.state || {};
  const { treeName } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [individuals, setIndividuals] = useState([]);
  const [username, setUsername] = useState('');
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

  const [newRelationship, setNewRelationship] = useState({
    fid: '',
    mid: '',
    pid: '',
  });
  useEffect(() => {
    FamilyTree.templates.john.field_0 =
      '<text ' + FamilyTree.attr.width + ' ="230" style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="135" text-anchor="middle">{val}</text>';

    FamilyTree.templates.john.field_1 =
      '<text ' + FamilyTree.attr.width + ' ="150" style="font-size: 13px;" fill="#aeaeae" x="60" y="150" text-anchor="middle">{val}</text>';

    FamilyTree.templates.john.img_0 =
      '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: url(#rounded_square);"></image>';

    FamilyTree.templates.john_male = Object.assign({}, FamilyTree.templates.john);
    FamilyTree.templates.john_male.node = '';
    FamilyTree.templates.john_male.img_0 =
      '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: url(#rounded_square);"></image>';

    FamilyTree.templates.john_female = Object.assign({}, FamilyTree.templates.john);
    FamilyTree.templates.john_female.node = '';
    FamilyTree.templates.john_female.img_0 =
      '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: circle(50% at 50% 50%);"></image>';

    FamilyTree.templates.john.defs = `
      <clipPath id="rounded_square">
        <rect x="6" y="6" width="108" height="108" rx="15" ry="15"></rect>
      </clipPath>
    `;
  }, []);
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      navigate('/');
    } else {
      fetchUser();
      if (treeId && userId) {
        fetchFamilyMembers();
      }
    }
  }, [treeId, userId]);

  useEffect(() => {
    if (individuals.length > 0) {
      renderFamilyTree();
    }
  }, [individuals]);

  const fetchUser = () => {
    axios
      .get('http://localhost:8080/api/login', { withCredentials: true })
      .then((response) => {
        if (response.data && response.data.name) {
          setUsername(response.data.name);
          setIsAuthenticated(true);
          setUser(response.data);
        }
      })
      .catch((error) => {
        console.error('User not authenticated:', error);
        setIsAuthenticated(false);
      });
  };

  const fetchFamilyMembers = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!treeId) return;
  
    axios
      .get('/demo/getFamilyMembersInTree', {
        params: { treeId },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        const data = response.data.map((individual) => ({
          ...individual,
          gender: individual.gender ? individual.gender.toLowerCase() : 'other', // Ensure gender is lowercase
          pid: individual.pid ? [individual.pid] : [], // Ensure pid is an array
        }));
  
        // Ensure bidirectional relationships
        data.forEach((person) => {
          person.pid.forEach((partnerId) => {
            const partner = data.find((ind) => ind.memberId === partnerId);
            if (partner && !partner.pid.includes(person.memberId)) {
              partner.pid.push(person.memberId);
            }
          });
        });
  
        setIndividuals(data);
      })
      .catch((error) => {
        console.error('Error fetching family members:', error);
      });
  };
  const renderFamilyTree = () => {
    if (!treeContainerRef.current) {
      console.error('Tree container is not mounted yet.');
      return;
    }
  
    const nodes = individuals.map((person) => ({
      id: person.memberId,
      name: person.name,
      pids: person.pid,
      mid: person.mid || null,
      fid: person.fid || null,
      gender: person.gender, // Use the processed gender
      img: person.img || '/profile-placeholder.png',
      template: person.gender === 'male' ? 'john_male' : person.gender === 'female' ? 'john_female' : 'john', // Apply correct template
    }));
  
    console.log('Nodes passed to FamilyTree:', nodes);
  
    if (familyTreeInstance.current) {
      familyTreeInstance.current.destroy();
    }
  
    try {
      familyTreeInstance.current = new FamilyTree(treeContainerRef.current, {
        template: 'john',
        layout: FamilyTree.ROUNDED,
        nodes: nodes,
        nodeBinding: {
          field_0: 'name',
          img_0: 'img',
        },
        connectors: {
          type: 'step',
        },
        menu: {
          pdfPreview: {
            text: 'PDF Preview',
            icon: FamilyTree.icon.pdf(24, 24, '#7A7A7A'),
            onClick: previewPDF,
          },
          exportPDF: {
            text: 'Export PDF',
            icon: FamilyTree.icon.pdf(24, 24, '#7A7A7A'),
            onClick: exportPDF,
          },
        },
        mode: 'light',
      });
    } catch (error) {
      console.error('Error rendering FamilyTree:', error);
    }
  };
  

  const previewPDF = () => {
    if (familyTreeInstance.current) {
      FamilyTree.pdfPrevUI.show(familyTreeInstance.current, {
        format: 'A4',
        padding: 150,
        landscape: true,
      });
    }
  };

  const exportPDF = () => {
    if (familyTreeInstance.current) {
      familyTreeInstance.current.exportPDF({
        format: 'A4',
        padding: 50,
      });
    }
  };

  const deleteFamilyMember = (memberId) => {
    const accessToken = localStorage.getItem('accessToken');
    axios
      .post('/demo/deleteFamilyMember', new URLSearchParams({ memberId: memberId.toString() }), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(() => {
        fetchFamilyMembers();
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
    if (newRelationship.fid) formData.append('fid', newRelationship.fid);
    if (newRelationship.mid) formData.append('mid', newRelationship.mid);
    if (newRelationship.pid) formData.append('pid', newRelationship.pid);

    axios
      .post('/demo/addFamilyMember', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(() => {
        fetchFamilyMembers();
        setNewPerson({ name: '', sex: 'Male', birthdate: '', deathdate: '', additionalInfo: '', isPrivate: false });
        setNewRelationship({ fid: '', mid: '', pid: '' });
        closeModal();
      })
      .catch((error) => console.error('Error adding family member:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevPerson) => ({ ...prevPerson, [name]: value }));
  };

  const handleRelationshipChange = (e) => {
    const { name, value } = e.target;
    setNewRelationship((prevRel) => ({ ...prevRel, [name]: value }));
  };

  return (
    <div className="tree-page-container">
      <div className="tree-page-header">
        <h1><img src="/familytreelogo.png" alt="Tree" /> | {treeName}</h1>
        <div className="d-flex align-items-center">
          <button className="icon-button"><FaBell /></button>
          <button className="icon-button"><FaQuestionCircle /></button>
          <button className="btn btn-link person-name" onClick={() => navigate('/account')}>
            {username || "User"}
          </button>
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

        {individuals.length > 0 && (
          <div ref={treeContainerRef} className="tree-view-section" style={{ width: '100%', height: '600px' }}></div>
        )}
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
              <FaTrash /> {person.name}
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

              {/* Relationship fields */}
              <div className="form-group">
                <label htmlFor="fatherId">Father</label>
                <select
                  className="form-control"
                  id="fatherId"
                  name="fid"
                  value={newRelationship.fid}
                  onChange={handleRelationshipChange}
                >
                  <option value="">Select Father</option>
                  {individuals.filter(individual => individual.gender === 'male').map((individual) => (
                    <option key={individual.memberId} value={individual.memberId}>
                      {individual.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="motherId">Mother</label>
                <select
                  className="form-control"
                  id="motherId"
                  name="mid"
                  value={newRelationship.mid}
                  onChange={handleRelationshipChange}
                >
                  <option value="">Select Mother</option>
                  {individuals.filter(individual => individual.gender === 'female').map((individual) => (
                    <option key={individual.memberId} value={individual.memberId}>
                      {individual.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="partnerId">Partner</label>
                <select
                  className="form-control"
                  id="partnerId"
                  name="pid"
                  value={newRelationship.pid}
                  onChange={handleRelationshipChange}
                >
                  <option value="">Select Partner</option>
                  {individuals.map((individual) => (
                    <option key={individual.memberId} value={individual.memberId}>
                      {individual.name}
                    </option>
                  ))}
                </select>
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
