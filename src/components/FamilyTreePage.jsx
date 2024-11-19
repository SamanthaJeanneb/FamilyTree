import React, { useState, useEffect, useRef } from 'react';
import { FaTrash, FaUserPlus } from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './FamilyTreePage.css';
import axios from 'axios';
import FamilyTree from '@balkangraph/familytree.js';
import InviteCollaboratorModal from "./InviteCollaborator.jsx";
import FamilyTreePageHeader from '../navigation/FamilyTreePageHeader.jsx';
import AttachmentModal from './modals/AttachmentModal.jsx';
import AddPersonModal from './modals/AddPersonModal';

const FamilyTreePage = ({ setIsAuthenticated, setUser, user }) => {
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { treeId } = location.state || {};
    const { treeName } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [individuals, setIndividuals] = useState([]);
    const [username, setUsername] = useState('');
    const treeContainerRef = useRef(null);
    const familyTreeInstance = useRef(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        // FamilyTree template setup
        FamilyTree.templates.john.field_0 =
            '<text ' + FamilyTree.attr.width + ' ="230" style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="135" text-anchor="middle">{val}</text>';
        FamilyTree.templates.john.img_0 =
            '<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="6" y="6" width="108" height="108" style="border: none; clip-path: url(#rounded_square);"></image>';
        FamilyTree.templates.john.defs = `
      <clipPath id="rounded_square">
        <rect x="6" y="6" width="108" height="108" rx="15" ry="15"></rect>
      </clipPath>`;
    }, []);

    useEffect(() => {
        // Authentication check and data fetching
        axios.get('http://localhost:8080/api/login', { withCredentials: true })
            .then(response => {
                if (response.data?.token) {
                    setIsAuthenticated(true);
                    setUser(response.data);
                    setUsername(response.data.name);
                }
            }).then(() => {
                if (treeId) fetchFamilyMembers();
            })
            .catch(error => {
                console.log("User not authenticated:", error);
                setIsAuthenticated(false);
                setUser(null);
                navigate('/');
            });
    }, [treeId]);

    useEffect(() => {
        // Render tree when individuals data changes
        if (individuals.length > 0) renderFamilyTree();
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
                    gender: individual.gender?.toLowerCase() || 'other',
                    pid: individual.pid ? [individual.pid] : [],
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
        if (!treeContainerRef.current) return;

        const nodes = individuals.map((person) => ({
            id: person.memberId,
            name: person.name,
            pids: person.pid,
            mid: person.mid || null,
            fid: person.fid || null,
            gender: person.gender,
            img: person.img || '/profile-placeholder.png',
            template: person.gender === 'male' ? 'john_male' : person.gender === 'female' ? 'john_female' : 'john',
        }));

        if (familyTreeInstance.current) familyTreeInstance.current.destroy();

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
                }
            )
            .then((response) => {
                setInviteMessage(response.data);
                setTimeout(() => setIsInviteModalOpen(false), 2000);
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
            .then(fetchFamilyMembers)
            .catch((error) => {
                console.error('Error deleting family member:', error);
            });
    };

    return (
        <div className="tree-page-container">
            <FamilyTreePageHeader username={username} />

            <div style={{ paddingTop: '70px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div className="tree-action-header">
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                        Family Tree <span style={{ fontSize: '18px', fontWeight: 'normal' }}>| {treeName}</span>
                    </h2>
                    <button className="btn btn-primary invite-button" onClick={() => setIsInviteModalOpen(true)} style={{ marginLeft: 'auto' }}>
                        <FaUserPlus /> Invite Collaborator
                    </button>
                </div>
                {isInviteModalOpen && (
                    <InviteCollaboratorModal
                        sendInvite={sendInvite}
                        onClose={() => setIsInviteModalOpen(false)}
                        inviteMessage={inviteMessage}
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                    />
                )}
                <div className="tree-view-section" style={{ position: 'relative', width: '100%', height: '600px' }}>
                    {individuals.length > 0 && (
                        <div
                            className="individual-count"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                color: '#333',
                                padding: '5px 10px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                zIndex: '10',
                            }}
                        >
                            <span>{individuals.length} people</span>
                        </div>
                    )}
                    <div ref={treeContainerRef} className="tree-container" style={{ width: '100%', height: '100%' }}></div>
                </div>
                {individuals.length > 0 && (
                    <button className="floating-add-button" onClick={() => setIsModalOpen(true)} title="Add Individual">
                        +
                    </button>
                )}
                {individuals.length > 0 && (
    <div className="delete-buttons-container">
        {individuals.map((person) => (
            <button
                key={person.memberId}
                onClick={() => deleteFamilyMember(person.memberId)}
                className="btn btn-danger"
            >
                <FaTrash /> {person.name}
            </button>
        ))}
    </div>
)}

                {isAttachmentModalOpen && (
                    <AttachmentModal
                        memberId={selectedMemberId}
                        onClose={() => setIsAttachmentModalOpen(false)}
                        onUpload={(memberId, typeOfFile, file) => uploadAttachment(memberId, typeOfFile, file)}
                    />
                )}
                {isModalOpen && (
                    <AddPersonModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onPersonAdded={fetchFamilyMembers}
                        treeId={treeId}
                        userId={user.userId}
                        individuals={individuals}
                        openAttachmentModal={(memberId) => setSelectedMemberId(memberId)}
                        userToken={user.token}
                    />
                )}
            </div>
        </div>
    );
};

export default FamilyTreePage;
