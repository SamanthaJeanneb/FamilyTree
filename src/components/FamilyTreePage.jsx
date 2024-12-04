import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaShare, FaQuestionCircle, FaTrash, FaUserPlus } from 'react-icons/fa';
import { Share2 } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './FamilyTreePage.css';
import axios from 'axios';
import FamilyTree from '@balkangraph/familytree.js';
import InviteCollaboratorModal from "./InviteCollaborator.jsx";
import FamilyTreePageHeader from '../navigation/FamilyTreePageHeader.jsx';
import AttachmentModal from './modals/AttachmentModal.jsx';
import AddPersonModal from './modals/AddPersonModal';
import TreeActionBar from '../navigation/TreeActionBar.jsx';
import EditModal from './modals/EditModal.jsx';
import AttachmentsPersonModal from "./modals/AttachmentsPersonModal.jsx";


const FamilyTreePage = ({ setIsAuthenticated, setUser, user }) => {
    const [suggestedEdits, setSuggestedEdits] = useState([]);
    const [message, setMessage] = useState(''); // State to hold the message
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
    const [collaborationRole, setCollaborationRole] = useState(null); // 'Owner', 'Editor', 'Viewer'
    const [viewOnly, setViewOnly] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isAttachmentsPersonModalOpen, setIsAttachmentsPersonModalOpen] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const currentURL = `${window.location.protocol}//${window.location.host}${location.pathname}${location.search}${location.hash}`;


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
    const openAttachmentsPersonModal = async (memberId) => {
        try {
            const response = await axios.get("/demo/getAttachmentsForMember", {
                params: { memberId },
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setAttachments(response.data);
            setIsAttachmentsPersonModalOpen(true);
        } catch (error) {
            console.error("Error fetching attachments:", error);
        }
    };

    const closeAttachmentsPersonModal = () => {
        setAttachments([]);
        setIsAttachmentsPersonModalOpen(false);
    };

    const openAttachmentModal = (memberId) => {
        setSelectedMemberId(memberId);
        setIsAttachmentModalOpen(true);
    };

    const closeAttachmentModal = () => {
        setSelectedMemberId(null);
        setIsAttachmentModalOpen(false);
    };
    const fetchCollaborationRole = async () => {
        try {
            const response = await axios.get('/demo/getCollaborationByUser', {
                params: { userId: userId },
                headers: { Authorization: `Bearer ${user.token}` },
            });

            console.log('Response from backend:', response.data);
            const collaborations = Array.isArray(response.data) ? response.data : response.data.collaborations || [];

            const treeCollaboration = collaborations.find(c => c.familyTree?.id === treeId);
            if (treeCollaboration) {
                setCollaborationRole(treeCollaboration.role);
                setViewOnly(treeCollaboration.role === 'Viewer');
            } else {
                console.warn('No collaboration found for this tree. Defaulting to Viewer role.');
                setCollaborationRole('Viewer');
                setViewOnly(true); // Set view-only permissions for default Viewer role
            }
        } catch (error) {
            console.error('Error fetching collaboration role:', error);
            // If there's an error fetching roles, default to Viewer
            setCollaborationRole('Viewer');
            setViewOnly(true);
        }
    };

    useEffect(() => {
        fetchCollaborationRole();
    }, [treeId]);

    const uploadAttachment = async (memberId, typeOfFile, file) => {
        if (!memberId || !typeOfFile || !file) {
            setMessage('Error: Missing required parameters.');
            return;
        }

        const formData = new FormData();
        formData.append('memberId', memberId);
        formData.append('typeOfFile', typeOfFile);
        formData.append('fileData', file);
        formData.append('uploadedById', user.id);

        try {
            const response = await axios.post('http://localhost:8080/demo/addAttachment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
                withCredentials: true,
            });

            if (response.data === 'Attachment Saved Successfully') {
                setMessage('Success: Attachment uploaded');
                fetchFamilyMembers();
            } else {
                setMessage(`Error: ${response.data}`);
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
            setMessage('Error uploading attachment.');
        }
    };

    useEffect(() => {
        axios.get('http://localhost:8080/api/login', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    if (response.data.token) {
                        setIsAuthenticated(true);
                        setUser(response.data);
                        setUsername(response.data.name);

                        // When determining the viewOnly attribute, there are 3 things to consider:
                        // 1. Does the user own this true?  viewOnly = false
                        // 2. If the user does not own the tree, Is the true public?
                        // 3. If the tree is private and not the current owner, then viewOnly = true

                        // Need to check to see if the current user is the owner
                        // If the current user is not the owner, then check if the tree is public
                        setViewOnly(false);
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

// Add this useEffect
    useEffect(() => {
        fetchFamilyMembers();
        if (collaborationRole === 'Owner') {
            fetchSuggestedEdits();
        }
    }, [treeId, collaborationRole]);
    useEffect(() => {
        if (treeId && userId) {
            fetchFamilyMembers();
        }
    }, [treeId, userId]); // Re-fetch when `treeId` or `userId` changes
    const approveEdit = async (editId) => {
        if (!editId) {
            console.error("approveEdit called with undefined editId");
            setMessage("Error: Missing suggestion ID.");
            return;
        }

        try {
            const payload = new URLSearchParams();
            payload.append("suggestionId", editId);

            console.log("Payload for approveEdit:", payload.toString());

            const response = await axios.post('/demo/suggestedEdits/accept', payload, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log("Response from approveEdit:", response.data);

            if (response.data === "Suggested edit accepted, applied, and deleted.") {
                setMessage('Success: Edit approved.');

                // Remove the approved edit from the state
                setSuggestedEdits((prevEdits) =>
                    prevEdits.filter((edit) => edit.suggestionId !== editId)
                );

                // Refresh the tree
                fetchFamilyMembers();
            } else {
                console.error('Unexpected response:', response.data);
                setMessage('Error: Unable to approve edit.');
            }
        } catch (error) {
            console.error('Error approving edit:', error);
            setMessage('Error: Failed to approve edit.');
        }
    };

    const rejectEdit = async (editId) => {
        if (!editId) {
            setMessage("Error: Missing suggestion ID.");
            return;
        }

        try {
            const payload = new URLSearchParams();
            payload.append("suggestionId", editId);

            const response = await axios.post('/demo/suggestedEdits/decline', payload, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data === "Suggested edit declined and removed successfully.") {
                setMessage('Success: Edit rejected.');
                setSuggestedEdits((prev) =>
                    prev.filter((edit) => edit.suggestionId !== editId)
                ); // Remove the rejected edit
            } else {
                setMessage('Error: Unable to reject edit.');
            }
        } catch (error) {
            setMessage('Error: Failed to reject edit.');
        }
    };

    const fetchSuggestedEdits = async () => {
        try {
            const response = await axios.get('/demo/suggestedEdits/review', {
                params: { treeId },
                headers: { Authorization: `Bearer ${user.token}` },
            });

            console.log("Fetched Suggested Edits:", response.data);

            setSuggestedEdits(response.data);
        } catch (error) {
            console.error('Error fetching suggested edits:', error);
        }
    };


    const fetchFamilyMembers = async () => {
        if (!treeId) return;

        try {
            // Fetch main tree members
            const membersResponse = await axios.get('/demo/getFamilyMembersInTree', {
                params: { treeId },
                headers: { Authorization: `Bearer ${user.token}` },
            });

            const members = membersResponse.data;

            // Fetch attachments for each member and set the first image as `img`
            const updatedMembers = await Promise.all(
                members.map(async (member) => {
                    try {
                        const attachmentsResponse = await axios.get('/demo/getAttachmentsForMember', {
                            params: { memberId: member.memberId },
                            headers: { Authorization: `Bearer ${user.token}` },
                        });
                        const attachments = attachmentsResponse.data;

                        // Find the first attachment with an image MIME type
                        const firstImage = attachments.find((attachment) =>
                            attachment.fileData.startsWith('data:image')
                        );

                        return {
                            ...member,
                            gender: member.gender ? member.gender.toLowerCase() : 'other',
                            pid: member.pid ? [member.pid] : [],
                            img: firstImage ? firstImage.fileData : '/profile-placeholder.png', // Use first image or fallback
                        };
                    } catch (error) {
                        console.error(`Error fetching attachments for member ${member.memberId}:`, error);
                        return {
                            ...member,
                            gender: member.gender ? member.gender.toLowerCase() : 'other',
                            pid: member.pid ? [member.pid] : [],
                            img: '/profile-placeholder.png', // Fallback image
                        };
                    }
                })
            );

            // Maintain bidirectional relationships
            updatedMembers.forEach((person) => {
                person.pid.forEach((partnerId) => {
                    const partner = updatedMembers.find((ind) => ind.memberId === partnerId);
                    if (partner && !partner.pid.includes(person.memberId)) {
                        partner.pid.push(person.memberId);
                    }
                });
            });

            // Set the main tree members
            setIndividuals(updatedMembers);

            // If the user is an Owner, fetch suggested edits
            if (collaborationRole === 'Owner') {
                try {
                    const editsResponse = await axios.get('/demo/suggestedEdits/review', {
                        params: { treeId },
                        headers: { Authorization: `Bearer ${user.token}` },
                    });

                    const suggestedEdits = editsResponse.data;
                    setSuggestedEdits(suggestedEdits); // Store suggested edits in state
                } catch (error) {
                    console.error('Error fetching suggested edits:', error);
                }
            }
        } catch (error) {
            console.error('Error fetching family members:', error);
        }
    };

    const renderFamilyTree = () => {
        if (!treeContainerRef.current) {
            console.error("Tree container is not mounted yet.");
            return;
        }

        // Dynamically generate nodes with yellow tag for all individuals
        const nodes = individuals.map((person) => ({
            id: person.memberId,
            name: person.name,
            birthdate: person.birthdate || "Unknown",
            deathdate: person.deathdate || "N/A",
            additionalInfo: person.additionalInfo || "No additional info",
            pids: person.pid,
            mid: person.mid || null,
            fid: person.fid || null,
            gender: person.gender,
            img: person.img || "/profile-placeholder.png", // Use updated image
            tags: ["yellow"], // Apply yellow tag to every node
            template:
                person.gender === "male"
                    ? "john_male"
                    : person.gender === "female"
                        ? "john_female"
                        : "john",
        }));

        try {
            familyTreeInstance.current = new FamilyTree(treeContainerRef.current, {
                template: "john",
                padding: 50,
                nodes: nodes,
                editForm: {
                    buttons: {
                        ...(collaborationRole !== "Viewer" && {
                            viewAttachments: {
                                text: "Attachments", // Button label
                                icon: FamilyTree.icon.details(24, 24, "#ffffff"), // Optional icon
                            },
                            customEdit: {
                                text: "Edit", // Label for the button
                                icon: FamilyTree.icon.edit(24, 24, "#ffffff"), // Optional icon
                            },
                        }),
                        share: null,
                        pdf: null,
                        edit: null,
                        remove: null,
                    },
                    generateElementsFromFields: false,
                    elements: [
                        { type: "textbox", label: "Name", binding: "name" },
                        { type: "date", label: "Birthdate", binding: "birthdate" },
                        { type: "date", label: "Deathdate", binding: "deathdate" },
                        {
                            type: "textbox",
                            label: "Additional Information",
                            binding: "additionalInfo",
                        },
                    ],
                },
                nodeBinding: {
                    field_0: "name",
                    field_1: "birthdate",
                    field_2: "deathdate",
                    field_3: "additionalInfo",
                    img_0: "img",
                },
                toolbar: {
                    zoom: true,
                    fit: true,
                },
                connectors: {
                    type: "step",
                },
                menu: {
                    pdfPreview: {
                        text: "PDF Preview",
                        icon: FamilyTree.icon.pdf(24, 24, "#7A7A7A"),
                        onClick: previewPDF,
                    },
                    exportPDF: {
                        text: "Export PDF",
                        icon: FamilyTree.icon.pdf(24, 24, "#7A7A7A"),
                        onClick: exportPDF,
                    },
                },
                mode: "light",
            });

            // Event handler for custom button clicks
            if (collaborationRole !== "Viewer") {
                familyTreeInstance.current.editUI.on("button-click", (sender, args) => {
                    if (args.name === "viewAttachments") {
                        openAttachmentsPersonModal(args.nodeId); // Open attachment modal for the clicked node
                    } else if (args.name === "customEdit") {
                        handleEditNode(args.nodeId); // Call your custom modal handler
                    }
                });
            }

            console.log("FamilyTree rendered successfully.");
        } catch (error) {
            console.error("Error rendering FamilyTree:", error);
        }
    };

    const sendInvite = () => {
        const data = {
            treeId: treeId,
            userEmail: inviteEmail, // Replace with logic to fetch userId by email if required
            role: 'Editor', // Fixed role
        }
        axios
            .post(
                '/demo/inviteCollaborator',
                {
                    treeId: treeId,
                    userEmail: inviteEmail,
                    role: 'Editor',
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


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const closeInviteModal = () => {
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteMessage('');
    }
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formattedBirthdate = newPerson.birthdate
            ? new Date(newPerson.birthdate).toISOString().split('T')[0]
            : '';
        const formattedDeathdate = newPerson.deathdate
            ? new Date(newPerson.deathdate).toISOString().split('T')[0]
            : '';

        console.log('Form Submission Initiated');
        console.log('Collaboration Role:', collaborationRole);
        console.log('New Person:', newPerson);
        console.log('Formatted Birthdate:', formattedBirthdate);
        console.log('Formatted Deathdate:', formattedDeathdate);

        try {
            if (collaborationRole === 'Owner') {
                console.log('Owner Role: Adding member directly to the main tree.');

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

                console.log('Form Data for Main Tree:', formData.toString());

                await axios.post('/demo/addFamilyMember', formData, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                setMessage('Success: Member added to the main tree.');
                fetchFamilyMembers(); // Refresh the tree
            } else if (collaborationRole === 'Editor') {
                console.log('Editor Role: Submitting suggested edit.');

                // Generate the suggested edits payload
                const payload = new URLSearchParams({
                    memberId: '', // Omit if creating a new member
                    suggestedById: user.id,
                    fieldName: 'name',
                    oldValue: '', // Leave empty for new entries
                    newValue: newPerson.name, // Example of name edit
                });

                console.log('Payload for Suggested Edit:', payload.toString());

                const response = await axios.post('/demo/suggestedEdits/create', payload, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                console.log('Suggested Edit Response:', response.data);

                setMessage('Your edit has been submitted for approval.');
            } else {
                console.warn('Unauthorized Role: User does not have permission to add members.');
                setMessage('You do not have permission to add members.');
            }

            // Reset form and close modal
            setNewPerson({
                name: '',
                sex: 'Male',
                birthdate: '',
                deathdate: '',
                additionalInfo: '',
                isPrivate: false,
            });
            setNewRelationship({ fid: '', mid: '', pid: '' });
            closeModal();
        } catch (error) {
            console.error('Error submitting form:', error);
            setMessage('Error: Unable to submit your changes.');
        }
    };



    const onClose = () => {
        setIsInviteModalOpen(false);
    }


    const closeEditModal = () => {
        setSelectedMember(null); // Clear the selected member
        setIsEditModalOpen(false); // Close the modal
    };
    const saveMemberChanges = async (updatedMember) => {
        try {
            if (collaborationRole === "Editor") {
                // Submit as a suggested edit
                const payload = new URLSearchParams({
                    memberId: updatedMember.memberId,
                    suggestedById: user.id,
                    fieldName: "edit", // Custom field for multiple edits
                    oldValue: JSON.stringify({
                        name: selectedMember.name,
                        birthdate: selectedMember.birthdate,
                        deathdate: selectedMember.deathdate,
                        gender: selectedMember.gender,
                        additionalInfo: selectedMember.additionalInfo,
                        fid: selectedMember.fid,
                        mid: selectedMember.mid,
                        pid: selectedMember.pid,
                    }),
                    newValue: JSON.stringify({
                        name: updatedMember.name,
                        birthdate: updatedMember.birthdate,
                        deathdate: updatedMember.deathdate,
                        gender: updatedMember.gender,
                        additionalInfo: updatedMember.additionalInfo,
                        fid: updatedMember.fid,
                        mid: updatedMember.mid,
                        pid: updatedMember.pid,
                    }),
                });

                console.log("Submitting suggested edit:", payload.toString());
                closeEditModal(); // Close the modal

                const response = await axios.post(
                    "/demo/suggestedEdits/create",
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );

                if (response.data === "Suggested Edit Created Successfully") {
                    console.log("Suggested edit created successfully:", response.data);
                    setMessage("Success: Your suggested edit has been submitted for approval.");
                } else {
                    console.error("Unexpected response:", response.data);
                    alert("Failed to save suggested edit. Please try again.");
                }
            } else if (collaborationRole === "Owner") {
                // Owner: Directly update the member
                const payload = new URLSearchParams();
                payload.append("memberId", updatedMember.memberId); // Required parameter

                if (updatedMember.name) payload.append("name", updatedMember.name);

                if (updatedMember.birthdate) {
                    const formattedBirthdate = new Date(updatedMember.birthdate)
                        .toISOString()
                        .split("T")[0]; // Format to yyyy-MM-dd
                    payload.append("birthdate", formattedBirthdate);
                }

                if (updatedMember.gender) {
                    // Capitalize the first letter of gender
                    const gender =
                        updatedMember.gender.charAt(0).toUpperCase() +
                        updatedMember.gender.slice(1).toLowerCase();
                    payload.append("gender", gender);
                }

                if (updatedMember.deathdate) {
                    const formattedDeathdate = new Date(updatedMember.deathdate)
                        .toISOString()
                        .split("T")[0];
                    payload.append("deathdate", formattedDeathdate);
                }

                if (updatedMember.additionalInfo) payload.append("additionalInfo", updatedMember.additionalInfo);

                if (updatedMember.fid) payload.append("fid", updatedMember.fid);
                if (updatedMember.mid) payload.append("mid", updatedMember.mid);
                if (updatedMember.pid) payload.append("pid", updatedMember.pid.join(",")); // Join multiple partner IDs into a string

                console.log("Submitting direct edit:", payload.toString());

                const response = await axios.post(
                    "/demo/editFamilyMember",
                    payload,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );

                if (response.data === "Family Member Updated Successfully") {
                    console.log("Direct edit successful:", response.data);
                    setMessage("Success: Individual and relationships updated.");
                    fetchFamilyMembers(); // Refresh the tree
                    closeEditModal(); // Close the modal
                } else {
                    console.error("Unexpected response:", response.data);
                    alert("Failed to save changes. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error saving member changes:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    const deleteMember = async (memberId) => {
        try {
            await axios.post(
                "/demo/deleteFamilyMember",
                new URLSearchParams({ memberId: memberId.toString() }),
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );
            setMessage('Success : member deleted');
            fetchFamilyMembers(); // Refresh the tree after deletion
            closeEditModal(); // Close the modal
        } catch (error) {
            console.error("Error deleting member:", error);
            setMessage('Error deleting the member. Please try again.');
        }
    };
    const handleEditNode = (nodeId) => {
        const selectedNode = individuals.find((person) => person.memberId === nodeId);

        if (selectedNode) {
            setSelectedMember(selectedNode); // Set the selected member for editing
            setIsEditModalOpen(true); // Open the custom modal
        }
    };


    return (
        <div className="tree-page-container">
            {/* Top Navigation Bar */}
            <div>
                {/* Message Display */}
                {message && (
                    <div
                        className="custom-alert"
                        style={{
                            "--bg-color": message.includes("Success") ? "#eafaf1" : "#ffecec",
                            "--border-color": message.includes("Success") ? "#8bc34a" : "#f44336",
                            "--text-color": message.includes("Success") ? "#4caf50" : "#f44336",
                            "--icon-bg": message.includes("Success") ? "#d9f2e6" : "#ffe6e6",
                            "--icon-color": message.includes("Success") ? "#4caf50" : "#f44336",
                        }}
                    >
                        <div className="icon">
                            {message.includes("Success") ? "✓" : "✕"}
                        </div>
                        <span>{message}</span>
                        <button className="close-btn" onClick={() => setMessage("")}>
                            ✕
                        </button>
                    </div>
                )}
            </div>
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
                <div>
                    <TreeActionBar
                        treeName={treeName}
                        isPublic={isPublic}
                        setPrivacy={setIsPublic} // Pass the state updater directly
                        currentURL={currentURL}
                        viewOnly={viewOnly}
                        treeId={treeId}
                        userToken={user.token} // Pass user token for authorization
                        userId={userId} // Replace `currentUser.id` with your app's user ID logic
                        setInviteModalOpen={setIsInviteModalOpen} // Pass modal state updater
                        setInviteMessage={setInviteMessage} // Pass message state updater
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                    />
                    <div  >
                        <FamilyTreePageHeader
                            username={username}
                            userId={userId}
                            currentTreePath={`/tree/${treeName}`}
                        />
                    </div>
                    {isInviteModalOpen && (
                        <InviteCollaboratorModal
                            sendInvite={sendInvite}
                            onClose={closeInviteModal}
                            inviteMessage={inviteMessage}
                            inviteEmail={inviteEmail}
                            setInviteEmail={setInviteEmail}
                        />
                    )}
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
                                zIndex: "10",
                            }}
                        >
                            <span>{individuals.length} of {individuals.length} people</span>
                        </div>
                    )}

                    <div
                        ref={treeContainerRef}
                        className="tree-container"
                        style={{ width: "100%", height: "100%" }}
                    ></div>
                    {collaborationRole === 'Owner' && suggestedEdits.length > 0 && (
                        <div className="suggested-edits">
                            <h3>Suggested Edits</h3>
                            <table className="edits-table">
                                <thead>
                                <tr>
                                    <th>Suggested By</th>
                                    <th>Field</th>
                                    <th>Old Value</th>
                                    <th>New Value</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {suggestedEdits.map((edit) => (
                                    <tr key={edit.suggestionId}>
                                        <td>{edit.suggestedBy.username}</td>
                                        <td>{edit.fieldName}</td>
                                        <td>{edit.oldValue || 'N/A'}</td>
                                        <td>{edit.newValue}</td>
                                        <td>
                                            <button
                                                className="approve-btn"
                                                onClick={() => approveEdit(edit.suggestionId)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => rejectEdit(edit.suggestionId)}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}




                    <EditModal
                        isOpen={isEditModalOpen}
                        member={selectedMember}
                        onClose={closeEditModal}
                        onSave={saveMemberChanges}
                        onDelete={deleteMember}
                        onAddAttachment={(memberId) => {
                            setSelectedMemberId(memberId);
                            setIsAttachmentModalOpen(true);
                        }}
                        individuals={individuals} // Pass the list of individuals for relationship options
                    />


                    {/* Welcome Message */}
                    {collaborationRole !== 'Viewer' && individuals.length === 0 && (
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
            {individuals.length > 0 && !isModalOpen && !isAttachmentsPersonModalOpen &&!isEditModalOpen && !isAttachmentModalOpen && collaborationRole  === 'Owner' && (
                <button
                    className="floating-add-button"
                    onClick={openModal}
                    title="Add Individual"
                >
                    +
                </button>
            )}


            {/* Attachment Modal */}
            {isAttachmentModalOpen && (
                <AttachmentModal
                    memberId={selectedMemberId} // Dynamically set based on the newly added member
                    userId={userId} // Pass the user ID of the uploader
                    userToken={user.token} // Pass the user ID of the uploader
                    onClose={closeAttachmentModal}
                    onUpload={(memberId, typeOfFile, file) => uploadAttachment(memberId, typeOfFile, file)}
                />
            )}
            {isAttachmentsPersonModalOpen && (
                <AttachmentsPersonModal
                    isOpen={isAttachmentsPersonModalOpen}
                    attachments={attachments}
                    onClose={closeAttachmentsPersonModal}
                />
            )}


            {/* Add Person Modal */}
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
}
export default FamilyTreePage;
