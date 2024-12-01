import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttachmentModal = ({ memberId, onClose, onUpload, userId, userToken }) => {
    const [message, setMessage] = useState('');
    const [typeOfFile, setTypeOfFile] = useState('');
    const [file, setFile] = useState(null);
    const [attachments, setAttachments] = useState([]);

    // Fetch attachments when the modal opens
    useEffect(() => {
        const fetchAttachments = async () => {
            try {
                const response = await axios.get('/demo/getAttachmentsForMember', {
                    params: { memberId },
                    headers: {
                      'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${userToken}`,
                    },
                });
                setAttachments(response.data);
            } catch (error) {
                console.error('Error fetching attachments:', error);
                setMessage('Error fetching attachments. Please try again later.');
            }
        };

        if (memberId) {
            fetchAttachments();
        }
    }, [memberId, userToken]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage(''); // Clear any previous error message
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

    const handleUpload = async (e) => {
      e.preventDefault();
  
      if (!typeOfFile || !file) {
          setMessage('Error: Both type of file and file are required.');
          return;
      }
  
      try {
          setMessage('Uploading file...');
          const compressedFile = await compressImage(file);
  
          const formData = new FormData();
          formData.append('memberId', memberId);
          formData.append('typeOfFile', typeOfFile);
          formData.append('fileData', compressedFile);
          formData.append('uploadedById', userId);
  
          const response = await axios.post('/demo/addAttachment', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${userToken}`,
              },
          });
  
          if (response.data.status === 'Success') {
              setMessage('Success: Attachment uploaded');
              // Reset the form fields
              setFile(null);
              setTypeOfFile('');
              // Close the modal after successful upload
              onClose();
          } else {
              setMessage(`Error: ${response.data.message}`);
          }
      } catch (error) {
          console.error('Error uploading attachment:', error);
          setMessage('Error: Failed to upload the file.');
      }
  };
  
  
  const handleDelete = async (mediaId) => {
    console.log('Deleting attachment with mediaId:', mediaId);

    try {
        const response = await axios.post('/demo/deleteAttachment', { mediaId }, {
            headers: {
              'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${userToken}`,
            },
        });

        if (response.data === 'Attachment Deleted Successfully') {
            setAttachments((prev) => prev.filter((attachment) => attachment.mediaId !== mediaId));
            setMessage('Attachment deleted successfully.');
        } else {
            setMessage(`Error: ${response.data}`);
        }
    } catch (error) {
        console.error('Error deleting attachment:', error);
        setMessage('Error: Failed to delete attachment.');
    }
};


    return (
        <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
            <div className="modal-content p-4" style={{ width: '600px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <h2 className="text-center">Attachments</h2>
                {message && <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
                <div className="gallery" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    {attachments.map((attachment) => (
                        <div key={attachment.mediaId} className="attachment-item" style={{ textAlign: 'center' }}>
                            <img src={attachment.fileData} alt={attachment.typeOfFile} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            <p>{attachment.typeOfFile}</p>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(attachment.mediaId)}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleUpload}>
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
                            Close
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
