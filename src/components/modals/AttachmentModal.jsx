import React, { useState } from 'react';

const AttachmentModal = ({ memberId, onClose, onUpload }) => {
  const [typeOfFile, setTypeOfFile] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!typeOfFile) {
      alert('Type of file is required.');
      return;
    }
    if (!file) {
      alert('File is required.');
      return;
    }

    // Convert the file to Base64 and store it in localStorage
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      // Store the image in localStorage with a unique key for the member
      localStorage.setItem(`member_${memberId}_image`, base64Data);
      onClose();
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Failed to process file.');
    };

    reader.readAsDataURL(file); // Convert file to Base64
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
              accept="image/*" // Ensure only images are selectable
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
