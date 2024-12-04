import React, { useState, useEffect } from "react";
import { FaTrash, FaPaperclip } from "react-icons/fa";

const EditModal = ({
    isOpen,
    member,
    onClose,
    onSave,
    onDelete,
    onAddAttachment,
    individuals = [],
}) => {
    const [step, setStep] = useState(1); // Track which modal step is active
    const [formData, setFormData] = useState({
        name: member?.name || "",
        birthdate: member?.birthdate || "",
        deathdate: member?.deathdate || "",
        additionalInfo: member?.additionalInfo || "",
        gender: member?.gender || "",
        mid: member?.mid || "",
        fid: member?.fid || "",
        pid: member?.pid || [],
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name,
                birthdate: member.birthdate,
                deathdate: member.deathdate,
                additionalInfo: member.additionalInfo,
                gender: member.gender,
                mid: member.mid || "",
                fid: member.fid || "",
                pid: member.pid || [],
            });
        }
    }, [member]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "pid" ? Array.from(e.target.selectedOptions, (opt) => opt.value) : value,
        }));
    };

    const handleNext = () => {
        setStep(2); // Move to the relationships modal
    };

    const handleBack = () => {
        setStep(1); // Go back to the general info modal
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
                {step === 1 && (
                    <>
                        <h2 className="text-center">Edit General Information</h2>
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

                        {/* Action Buttons */}
                        <div className="form-buttons d-flex justify-content-between mt-4">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-center">Edit Relationships</h2>
                        <div className="form-group">
                            <label>First Parent:</label>
                            <select
                                className="form-control"
                                name="mid"
                                value={formData.mid}
                                onChange={handleChange}
                            >
                                <option value="">None</option>
                                {individuals.map((ind) => (
                                    <option key={ind.memberId} value={ind.memberId}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Second Parent:</label>
                            <select
                                className="form-control"
                                name="fid"
                                value={formData.fid}
                                onChange={handleChange}
                            >
                                <option value="">None</option>
                                {individuals.map((ind) => (
                                    <option key={ind.memberId} value={ind.memberId}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Partners:</label>
                            <select
                                className="form-control"
                                name="pid"
                                multiple
                                value={formData.pid}
                                onChange={handleChange}
                            >
                                {individuals.map((ind) => (
                                    <option key={ind.memberId} value={ind.memberId}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="form-buttons d-flex justify-content-between mt-4">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleBack}
                            >
                                Back
                            </button>
                            <div className="d-flex">
                                <button
                                    type="button"
                                    className="btn btn-danger mr-2"
                                    onClick={() => onDelete(member.memberId)}
                                >
                                    <FaTrash /> Delete
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditModal;
