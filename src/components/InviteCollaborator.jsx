import React, { useState } from 'react';
import './InviteCollaborator.css'
const InviteCollaboratorModal = ({ sendInvite, onClose, inviteMessage, inviteEmail, setInviteEmail }) => {

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        sendInvite(inviteEmail); // Call the sendInvite method passed as a prop
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Invite Collaborator</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter collaborator's email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                    />
                    <p>Role: Viewer (Default)</p>
                    <button type="submit" className="btn btn-success">
                        Send Invite
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </form>
                {inviteMessage && <p>{inviteMessage}</p>}
            </div>
        </div>
    );
};

export default InviteCollaboratorModal;
