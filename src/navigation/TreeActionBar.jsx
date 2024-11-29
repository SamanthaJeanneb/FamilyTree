import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import axios from 'axios';

const TreeActionBar = ({
  treeName,
  isPublic,
  setPrivacy,
  currentURL,
  viewOnly,
  treeId,
  userToken,
  setInviteModalOpen,
  setInviteMessage,
  inviteEmail,
  setInviteEmail,
}) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const togglePrivacy = () => {
    setPrivacy(!isPublic);
  };

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentURL)
      .then(() => togglePanel())
      .catch(err => console.error('Failed to copy text:', err));
  };

  const sendInvite = () => {
    axios
      .post(
        '/demo/inviteCollaborator',
        { treeId, userEmail: inviteEmail, role: 'Viewer' },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then((response) => {
        if (response.data === 'Collaboration invitation sent successfully.') {
          setInviteMessage(response.data);
        } else {
          setInviteMessage(`Error: ${response.data}`);
        }
      })
      .catch((error) => {
        setInviteMessage(`Error: ${error.response?.data || error.message}`);
      });
  };

  return (
    <div className="tree-action-header">
      <div className="container-fluid m-0 p-0">
        <div className="flex-container">
          {/* Family Tree Title */}
          <div className="flex-item">
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Family Tree <span style={{ fontSize: '18px', fontWeight: 'normal' }}>| {treeName}</span>
            </h2>
          </div>

          {/* Privacy Toggle */}
          {!viewOnly && (
            <div className="flex-item">
              <button className="btn" style={{ marginLeft: 'auto' }}>
                <div className="form-check form-switch custom-toggle">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="switchPublicPrivate"
                    checked={isPublic}
                    onChange={togglePrivacy}
                  />
                  <label className="form-check-label" htmlFor="switchPublicPrivate">
                    {isPublic ? 'Public' : 'Private'}
                  </label>
                </div>
              </button>
            </div>
          )}

          {/* Share Link */}
          {!viewOnly && (
            <div className="flex-item" style={{ position: 'relative' }}>
              <button className="btn" onClick={togglePanel} aria-description="Share a link to your tree">
                <Share2 />
              </button>
              {isPanelVisible && (
                <div
                  className="card mt-3"
                  style={{
                    width: '450px',
                    left: '-350px',
                    position: 'absolute',
                    top: '25px',
                  }}
                >
                  <div className="card-body">
                    <h6 className="card-title">Link to Share your tree</h6>
                    <span className="share-link">{currentURL}</span>{' '}
                    <button className="btn btn-secondary btn-sm" onClick={copyLink}>
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invite Collaborator */}
          {!viewOnly && (
            <div className="flex-item">
              <button
                className="btn btn-primary invite-button"
                onClick={() => {
                  sendInvite();
                  setInviteModalOpen(true);
                }}
                style={{ marginLeft: 'auto' }}
              >
                Invite Collaborator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeActionBar;
