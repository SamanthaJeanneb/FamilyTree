import React, { useState, useEffect, useRef } from 'react';
import {FaBell, FaQuestionCircle, FaTrash, FaUserPlus} from 'react-icons/fa';
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
    const { treeId, userId } = location.state || {};    
    const { treeName } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [individuals, setIndividuals] = useState([]);
    const [username, setUsername] = useState('');
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
    const openAttachmentModal = (memberId) => {
        setSelectedMemberId(memberId);
        setIsAttachmentModalOpen(true);
      };
    
      const closeAttachmentModal = () => {
        setSelectedMemberId(null);
        setIsAttachmentModalOpen(false);
      };
    
      const uploadAttachment = (memberId, typeOfFile, file) => {
        const reader = new FileReader();
    
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
    
            img.onload = () => {
                const canvas = document.createElement('canvas');
    
                const targetWidth = 100;
                const targetHeight = 100;
    
                canvas.width = targetWidth;
                canvas.height = targetHeight;
    
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
    
                try {
                    // Save the compressed image in localStorage
                    localStorage.setItem(`member_${memberId}_image`, compressedBase64);
    
                    // Update the individuals array without bidirectional relationships
                    setIndividuals((prevIndividuals) =>
                        prevIndividuals.map((ind) =>
                            ind.memberId === memberId ? { ...ind, img: compressedBase64 } : ind
                        )
                    );
    
                    setIsAttachmentModalOpen(false);
                    alert('Attachment uploaded successfully!');
    
                    // Set a timer before navigating
                    setTimeout(() => {
                        navigate(`/tree/${encodeURIComponent(treeName)}`, { replace: true });
                    }, 2000); // Delay navigation by 2 seconds
                } catch (error) {
                    console.error('Error storing image in localStorage:', error);
                    alert('Failed to store image.');
                }
            };
    
            img.onerror = () => {
                alert('Error processing the image.');
            };
        };
    
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('Failed to process the file.');
        };
    
        reader.readAsDataURL(file);
    };
    
    
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
        console.log("Rendering tree:", { individuals, isAttachmentModalOpen });
        if (individuals.length > 0 && !isAttachmentModalOpen) {
            renderFamilyTree();
        }
    }, [individuals, isAttachmentModalOpen]);
    

    useEffect(() => {
        if (treeId && userId) {
          fetchFamilyMembers();
        }
      }, [treeId, userId]); // Re-fetch when `treeId` or `userId` changes
      

      const fetchFamilyMembers = async () => {
        if (!treeId) return;
    
        try {
            const membersResponse = await axios.get('/demo/getFamilyMembersInTree', {
                params: { treeId },
                headers: { Authorization: `Bearer ${user.token}` },
            });
    
            const members = membersResponse.data;
    
            const updatedMembers = members.map((member) => {
                const storedImage = localStorage.getItem(`member_${member.memberId}_image`);
                return {
                    ...member,
                    gender: member.gender ? member.gender.toLowerCase() : 'other',
                    pid: member.pid ? [member.pid] : [],
                    img: storedImage || '/profile-placeholder.png', // Use stored image or fallback
                };
            });
    
            // Maintain bidirectional relationships
            updatedMembers.forEach((person) => {
                person.pid.forEach((partnerId) => {
                    const partner = updatedMembers.find((ind) => ind.memberId === partnerId);
                    if (partner && !partner.pid.includes(person.memberId)) {
                        partner.pid.push(person.memberId);
                    }
                });
            });
    
            setIndividuals(updatedMembers);
        } catch (error) {
            console.error('Error fetching family members:', error);
        }
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
        gender: person.gender,
        img: person.img || '/profile-placeholder.png', // Use updated image
        template: person.gender === 'male' ? 'john_male' : person.gender === 'female' ? 'john_female' : 'john',
    }));

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

        console.log('FamilyTree rendered successfully.');
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
                // Remove the specific family member's image from localStorage
                localStorage.removeItem(`member_${memberId}_image`);
                
                // Refresh the family members list
                fetchFamilyMembers();
    
                alert('Family member and their associated image have been deleted.');
            })
            .catch((error) => {
                console.error('Error deleting family member:', error);
                alert('Failed to delete family member.');
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
    
        const formattedBirthdate = newPerson.birthdate
            ? new Date(newPerson.birthdate).toISOString().split('T')[0]
            : '';
        const formattedDeathdate = newPerson.deathdate
            ? new Date(newPerson.deathdate).toISOString().split('T')[0]
            : '';
    
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
        console.log('Submitting form with data:', {
        name: newPerson.name,
        birthdate: formattedBirthdate,
        gender: newPerson.sex,
        userId,
        treeId,
        addedById: userId,
        deathdate: formattedDeathdate,
        additionalInfo: newPerson.additionalInfo,
        isPrivate: newPerson.isPrivate,
        fid: newRelationship.fid,
        mid: newRelationship.mid,
        pid: newRelationship.pid,
    });
        axios
            .post('/demo/addFamilyMember', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then((response) => {
                const memberId = response.data.memberId; // Assume backend returns the `memberId` of the newly added member
                if (!memberId) {
                    throw new Error('Member ID not returned by backend');
                }
    
                // Fetch family members to update the tree
                fetchFamilyMembers();
    
                // Reset form fields
                setNewPerson({
                    name: '',
                    sex: 'Male',
                    birthdate: '',
                    deathdate: '',
                    additionalInfo: '',
                    isPrivate: false,
                });
                setNewRelationship({ fid: '', mid: '', pid: '' });
    
                // Close the add person modal
                closeModal();
    
                // Open the attachment modal for the newly added member
                setSelectedMemberId(memberId);
                setIsAttachmentModalOpen(true);
            })
            .catch((error) => {
                console.error('Error adding family member:', error);
            });
    };
    useEffect(() => {
        if (!treeId) {
            console.error('Tree ID is missing. Redirecting to dashboard.');
            navigate('/dashboard');
        }
    }, [treeId]);

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
                    <FamilyTreePageHeader username={username} />

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
          {isInviteModalOpen && (

                <InviteCollaboratorModal

                    sendInvite={sendInvite} // Pass the sendInvite method as a prop

                    onClose={closeInviteModal}

                    inviteMessage={inviteMessage} // Pass message as a prop

                    inviteEmail={inviteEmail}

                    setInviteEmail={setInviteEmail}

                />

            )}
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
      <h2>Welcome to your family tree!<br></br>Start here:</h2>
      <button className="add-individual-button" onClick={openModal}>
        <span className="add-individual-icon">+</span>
        <h1 className="add-individual-text">Add Individual</h1>
      </button>
    </div>
  )}
</div>
</div>
      
        {/* Floating Add Button */}
{/* Floating Add Button */}
{individuals.length > 0 && !isModalOpen && ( // Hide when isModalOpen is true
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
       {/* Attachment Modal */}
       {isAttachmentModalOpen && (
    <AttachmentModal
        memberId={selectedMemberId} // Dynamically set based on the newly added member
        userId={user.userId} // Pass the user ID of the uploader
        onClose={closeAttachmentModal}
        onUpload={uploadAttachment}
    />
)}

            {isModalOpen && (
  <AddPersonModal
    isOpen={isModalOpen}
    onClose={closeModal}
    onSubmit={handleFormSubmit}
    newPerson={newPerson}
    setNewPerson={setNewPerson}
    newRelationship={newRelationship}
    setNewRelationship={setNewRelationship}
    individuals={individuals}
    openAttachmentModal={openAttachmentModal}
  />
)}
        </div>
    );
};

export default FamilyTreePage;
