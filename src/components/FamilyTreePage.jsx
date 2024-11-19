import React, { useState, useEffect, useRef } from 'react';
import {FaBell, FaQuestionCircle, FaTrash, FaUserPlus} from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './FamilyTreePage.css';
import axios from 'axios';
import FamilyTree from '@balkangraph/familytree.js';
import InviteCollaboratorModal from "./InviteCollaborator.jsx";
import FamilyTreePageHeader from '../navigation/FamilyTreePageHeader.jsx';

const FamilyTreePage = ({ setIsAuthenticated, setUser, user }) => {
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
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');

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
        axios.get('http://localhost:8080/api/login', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    if (response.data.token) {
                        setIsAuthenticated(true);
                        setUser(response.data);
                        setUsername(response.data.name)
                    }
                }
            }).then(() => {
            if (treeId && userId) {
                fetchFamilyMembers();
            }
        })
            .catch(error => {
                console.log("User not authenticated:", error);
                setIsAuthenticated(false);
                setUser(null);
                navigate('/');
            });
    }, [treeId, userId]);



    useEffect(() => {
        if (individuals.length > 0) {
            renderFamilyTree();
        }
    }, [individuals]);

    const fetchFamilyMembers = () => {
        if (!treeId) return;

        axios
            .get('/demo/getFamilyMembersInTree', {
                params: { treeId },
                headers: { Authorization: `Bearer ${user.token}` },
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


    const sendInvite = () => {
        const data = {
            treeId: treeId,
            userEmail: inviteEmail, // Replace with logic to fetch userId by email if required
            role: 'Viewer', // Fixed role
        }
        axios
            .post(
                '/demo/inviteCollaborator',
                {
                    treeId: treeId,
                    userEmail: inviteEmail,
                    role: 'Viewer',
                },

                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },

            )
            .then((response) => {
                console.log(response)
                if (response.data === 'Collaboration invitation sent successfully.') {
                    setInviteMessage(response.data);
                    setTimeout(onClose, 2000); // Close modal after success
                } else {
                    setInviteMessage(`Error: ${response.data}`);
                }
            })
            .catch((error) => {
                setInviteMessage(`Error: ${error.response?.data || error.message}`);
            });
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
        axios
            .post('/demo/deleteFamilyMember', new URLSearchParams({ memberId: memberId.toString() }), {
                headers: {
                    Authorization: `Bearer ${user.token}`,
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

    const openInviteModal = () => setIsInviteModalOpen(true);
    const closeInviteModal = () => {
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteMessage('');
    }


    const handleFormSubmit = (e) => {
        e.preventDefault();
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
                    Authorization: `Bearer ${user.token}`,
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

    const onClose = () => {
        setIsInviteModalOpen(false);
    }

    const handleRelationshipChange = (e) => {
        const { name, value } = e.target;
        setNewRelationship((prevRel) => ({ ...prevRel, [name]: value }));
    };

    return (
        <div className="tree-page-container">
        {/* Top Navigation Bar */}
        <FamilyTreePageHeader username={username} />
    
        {/* Main Content */}
        <div
          style={{
            paddingTop: '70px', // Matches the height of the fixed navbar
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* Action Navigation Bar */}
          <div
            className="tree-action-header"

          >
<h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
  Family Tree <span style={{ fontSize: '18px', fontWeight: 'normal' }}>| {treeName}</span>
</h2>

            <button
              className="btn btn-primary invite-button"
              onClick={openInviteModal}
              style={{ marginLeft: 'auto' }}
            >
              <FaUserPlus /> Invite Collaborator
            </button>
          </div>
    
          {/* Tree View Section */}
          <div className="tree-view-section" style={{ position: "relative", width: "100%", height: "600px" }}>
  {/* Number of People in Top-Left */}
  {individuals.length > 0 && (
    <div
      className="individual-count"
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        color: "#333",
        padding: "5px 10px",
        fontSize: "16px",
        fontWeight: "bold",
        zIndex: "10", // Ensures it's above the Balkan tree
      }}
    >
                    <span>{individuals.length} of {individuals.length} people</span>

            </div>          
  )}

  {/* Balkan Tree Container */}
  {individuals.length > 0 && (
    <div
      ref={treeContainerRef}
      className="tree-container"
      style={{ width: "100%", height: "100%" }}
    ></div>
  )}

  {/* Welcome Message */}
  {individuals.length === 0 && (
    <div className="add-individual">
      <h2>Welcome to your family tree! Start here:</h2>
      <button className="add-individual-button" onClick={openModal}>
        <span className="add-individual-icon">+</span>
        <span className="add-individual-text">Add Individual</span>
      </button>
    </div>
  )}
</div>
</div>
      
        {/* Floating Add Button */}
        {individuals.length > 0 && (
          <button
            className="floating-add-button"
            onClick={openModal}
            title="Add Individual"
          >
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
