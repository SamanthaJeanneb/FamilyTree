import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const EditModal = ({ isOpen, member, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        name: member?.name || "",
        gender: member?.gender || "",
    });

    useEffect(() => {
        if (member) {
            setFormData({ name: member.name, gender: member.gender });
        }
    }, [member]);

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
            <div
                className="modal-content p-4"
                style={{
                    width: "400px",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                <h2 className="text-center">Edit Member</h2>
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
                <div className="form-buttons d-flex justify-content-between mt-3">
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(member.memberId)}
                    >
                        <FaTrash /> Delete
                    </button>
                    <div>
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
