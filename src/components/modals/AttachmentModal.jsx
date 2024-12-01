import React, { useState } from 'react';
import axios from 'axios';

const AttachmentModal = ({ memberId, onClose, onUpload, userId, userToken }) => {
    const [message, setMessage] = useState('');
    const [typeOfFile, setTypeOfFile] = useState('');
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage(''); // Clear any previous error message
            console.log('Selected file:', selectedFile);
        } else {
            setMessage('Error: No file selected.');
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 800;
                    const maxHeight = 800;

                    let width = img.width;
                    let height = img.height;

                    // Maintain aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas to a Blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Image compression failed.'));
                            }
                        },
                        'image/jpeg',
                        0.7 // Compression quality
                    );
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!typeOfFile) {
            setMessage('Error: Type of file is required.');
            return;
        }
        if (!file) {
            setMessage('Error: File is required.');
            return;
        }
        if (!memberId) {
            setMessage('Error: Member ID is missing.');
            return;
        }

        try {
            setMessage('Compressing image...');
            const compressedFile = await compressImage(file);

            const formData = new FormData();
            formData.append('memberId', memberId);
            formData.append('typeOfFile', typeOfFile);
            formData.append('fileData', compressedFile);
            formData.append('uploadedById', userId);

            const response = await axios.post('http://localhost:8080/demo/addAttachment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userToken}`,
                },
                withCredentials: true,
            });

            if (response.data === 'Attachment Saved Successfully') {
                setMessage('Success: Attachment uploaded successfully!');
                onUpload(memberId, typeOfFile, file);
                setTimeout(onClose, 2000); // Close modal after success
            } else {
                setMessage(`Error: ${response.data}`);
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
            setMessage('Error: Failed to upload the file. Please check the input and try again.');
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1050,
            }}
        >
            {message && (
                <div
                    className="custom-alert"
                    style={{
                        backgroundColor: message.includes('Error') ? '#ffecec' : '#eafaf1',
                        border: `1px solid ${message.includes('Error') ? '#f44336' : '#8bc34a'}`,
                        color: message.includes('Error') ? '#f44336' : '#4caf50',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '5px',
                    }}
                >
                    {message}
                </div>
            )}
            <div
                className="modal-content p-4"
                style={{
                    width: '400px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}
            >
                <h2 className="text-center">Upload Attachment</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="typeOfFile">Type of File</label>
                        <input
                            type="text"
                            className="form-control"
                            id="typeOfFile"
                            value={typeOfFile}
                            onChange={(e) => setTypeOfFile(e.target.value)}
                            placeholder="E.g., Image, Document"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="file">Select File</label>
                        <input
                            type="file"
                            className="form-control"
                            id="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    <div className="form-buttons d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttachmentModal;
