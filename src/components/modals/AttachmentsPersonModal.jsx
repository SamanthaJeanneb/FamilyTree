import React from "react";
import "./AttachmentsPersonModal.css";

const AttachmentsPersonModal = ({ isOpen, attachments, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Close the modal if clicking on the overlay (not the content itself)
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
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
    </div>
  );
};

export default AttachmentsPersonModal;
