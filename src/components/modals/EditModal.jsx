import React, { useState, useEffect } from "react";
import { FaTrash, FaPaperclip } from "react-icons/fa";
import axios from "axios";

const EditModal = ({ isOpen, member, onClose, onSave, onDelete, onAddAttachment, userToken }) => {
    const [formData, setFormData] = useState({
        name: member?.name || "",
        birthdate: member?.birthdate || "",
        deathdate: member?.deathdate || "",
        additionalInfo: member?.additionalInfo || "",
        gender: member?.gender || "",
    });

    const [attachments, setAttachments] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name,
                birthdate: member.birthdate,
                deathdate: member.deathdate,
                additionalInfo: member.additionalInfo,
                gender: member.gender,
            });
            fetchAttachments(member.memberId);
        }
    }, [member]);

    const fetchAttachments = async (memberId) => {
        try {
            const response = await axios.get(`/demo/getAttachmentsForMember`, {
                params: { memberId },
                headers: { Authorization: `Bearer ${userToken}` },
            });
            setAttachments(response.data);
        } catch (error) {
            console.error("Error fetching attachments:", error);
            setMessage("Error: Failed to fetch attachments.");
        }
    };

    const deleteAttachment = async (attachmentId) => {
        console.log('Attempting to delete attachment with ID:', attachmentId);
        try {
            const response = await axios.post(
                '/demo/deleteAttachment',
                new URLSearchParams({ attachmentId: attachmentId.toString() }), // Ensure proper formatting
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            if (response.data === 'Attachment Deleted Successfully') {
                setMessage('Attachment deleted successfully.');
                setAttachments((prev) =>
                    prev.filter((attachment) => attachment.attachmentId !== attachmentId)
                );
            } else {
                setMessage(`Error: ${response.data}`);
            }
        } catch (error) {
            console.error('Error deleting attachment:', error);
            setMessage('Error: Failed to delete attachment.');
        }
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave({ ...member, ...formData });
    };

    if (!isOpen || !member) return null;

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
            }}
        >
            {message && (
                <div
                    className="custom-alert"
                    style={{
                        backgroundColor: message.includes("Error") ? "#ffecec" : "#eafaf1",
                        border: `1px solid ${message.includes("Error") ? "#f44336" : "#8bc34a"}`,
                        color: message.includes("Error") ? "#f44336" : "#4caf50",
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "5px",
                    }}
                >
                    {message}
                </div>
            )}
            <div
                className="modal-content p-4"
                style={{
                    width: "500px",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                <h2 className="text-center">Edit Individual</h2>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Birthdate:</label>
                    <input
                        type="date"
                        className="form-control"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Deathdate:</label>
                    <input
                        type="date"
                        className="form-control"
                        name="deathdate"
                        value={formData.deathdate}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Additional Info:</label>
                    <textarea
                        className="form-control"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Gender:</label>
                    <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Attachments:</label>
                    <ul className="list-group">
                        {attachments.map((attachment) => (
                            <li key={attachment.attachmentId} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{attachment.fileName}</span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteAttachment(attachment.attachmentId)}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="form-buttons d-flex justify-content-between mt-3">
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(member.memberId)}
                    >
                        <FaTrash /> Delete Member
                    </button>
                    <div className="d-flex">
                        <button
                            type="button"
                            className="btn btn-info mr-2"
                            onClick={() => onAddAttachment(member.memberId)}
                        >
                            <FaPaperclip /> Add Attachment
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary mr-2"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
