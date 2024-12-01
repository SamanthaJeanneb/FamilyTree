import React, { useState } from 'react';
import axios from 'axios';

const AttachmentModal = ({ memberId, onClose, onUpload, userId, userToken }) => {
    const [typeOfFile, setTypeOfFile] = useState('');
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
          setFile(selectedFile);
          console.log('Selected file:', selectedFile);
      } else {
          alert('No file selected.');
      }
  };
  

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Validate inputs
      if (!typeOfFile) {
          alert('Type of file is required.');
          return;
      }
      if (!file) {
          alert('File is required.');
          return;
      }
      if (!memberId) {
          alert('Member ID is missing.');
          return;
      }
  
      // Prepare form data
      const formData = new FormData();
      formData.append('memberId', memberId);
      formData.append('typeOfFile', typeOfFile);
      formData.append('fileData', file);
      formData.append('uploadedById', userId);
  
      // Debug form data
      for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
      }
  
      try {
          const response = await axios.post('http://localhost:8080/demo/addAttachment', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${userToken}`, // Ensure token is passed correctly
              },
              withCredentials: true, // Ensure cookies are sent if needed
          });
  
          if (response.data === 'Attachment Saved Successfully') {
              alert('Attachment uploaded successfully!');
              onUpload(memberId, typeOfFile, file); // Refresh attachments
              onClose(); // Close the modal
          } else {
              alert('Error: ' + response.data);
          }
      } catch (error) {
          console.error('Error uploading attachment:', error);
  
          if (error.response) {
              console.error('Response data:', error.response.data);
              console.error('Response status:', error.response.status);
              console.error('Response headers:', error.response.headers);
          }
  
          alert('Failed to upload the file. Please check the input and try again.');
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
