import React, { useState } from "react";
import "./AttachmentsPersonModal.css";

const AttachmentsPersonModal = ({ isOpen, attachments, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null); // State to track the selected image

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image); // Set the clicked image as the selected image
  };

  const handlePopupClose = () => {
    setSelectedImage(null); // Clear the selected image to close the popup
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="attachments-modal">
        <button className="modal-close-button" onClick={onClose}>
          ✕
        </button>
        <h2>Attachments</h2>
        <div className="gallery">
          {attachments.length > 0 ? (
            attachments.map((attachment, index) => (
              <div key={index} className="gallery-item">
                {attachment.fileData.startsWith("data:image") ? (
                  <img
                    src={attachment.fileData}
                    alt={`Attachment ${index}`}
                    className="gallery-image"
                    onClick={() => handleImageClick(attachment.fileData)} // Handle image click
                  />
                ) : (
                  <a
                    href={attachment.fileData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gallery-link"
                  >
                    {attachment.typeOfFile === "pdf" ? "View PDF" : "Download"}
                  </a>
                )}
              </div>
            ))
          ) : (
            <p>No attachments found for this member.</p>
          )}
        </div>
      </div>

      {/* Image Popup */}
      {selectedImage && (
        <div className="image-popup-overlay" onClick={handlePopupClose}>
          <div className="image-popup-content">
            <img src={selectedImage} alt="Enlarged Attachment" />
            <button className="image-popup-close" onClick={handlePopupClose}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentsPersonModal;
