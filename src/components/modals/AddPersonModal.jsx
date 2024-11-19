import React, { useState } from 'react';
import axios from 'axios';

const AddPersonModal = ({
    isOpen,
    onClose,
    onPersonAdded, // Callback to notify parent to refetch family members
    treeId,
    userId,
    individuals,
    openAttachmentModal,
    userToken,
}) => {
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPerson((prev) => ({ ...prev, [name]: value }));
    };

    const handleRelationshipChange = (e) => {
        const { name, value } = e.target;
        setNewRelationship((prev) => ({ ...prev, [name]: value }));
    };

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

        axios
            .post('/demo/addFamilyMember', formData, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(() => {
                onPersonAdded(); // Notify parent to refresh family tree
                onClose(); // Close modal
            })
            .catch((error) => console.error('Error adding family member:', error));
    };

    if (!isOpen) return null;

    return (
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
                        <select className="form-control" id="fatherId" name="fid" value={newRelationship.fid} onChange={handleRelationshipChange}>
                            <option value="">Select Father</option>
                            {individuals.filter((ind) => ind.gender === 'male').map((ind) => (
                                <option key={ind.memberId} value={ind.memberId}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="motherId">Mother</label>
                        <select className="form-control" id="motherId" name="mid" value={newRelationship.mid} onChange={handleRelationshipChange}>
                            <option value="">Select Mother</option>
                            {individuals.filter((ind) => ind.gender === 'female').map((ind) => (
                                <option key={ind.memberId} value={ind.memberId}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="partnerId">Partner</label>
                        <select className="form-control" id="partnerId" name="pid" value={newRelationship.pid} onChange={handleRelationshipChange}>
                            <option value="">Select Partner</option>
                            {individuals.map((ind) => (
                                <option key={ind.memberId} value={ind.memberId}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => openAttachmentModal(newPerson.id)}>Add Attachment</button>
                    <div className="form-buttons d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPersonModal;
