import React, { useState, useEffect } from 'react';
import { Share2, Settings, User } from 'lucide-react';
import axios from 'axios';

const TreeActionBar = ({
  treeName,
  isPublic,
  setPrivacy,
  currentURL,
  viewOnly,
  treeId,
  userToken,
  userId,
  setInviteModalOpen,
}) => {
  const [isSettingsDropdownVisible, setIsSettingsDropdownVisible] = useState(false);
  const [isCollaboratorsDropdownVisible, setIsCollaboratorsDropdownVisible] = useState(false);
  const [owner, setOwner] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [ownedTrees, setOwnedTrees] = useState([]);
  const [selectedMergeTree, setSelectedMergeTree] = useState(null);
  const [activeIcons, setActiveIcons] = useState({
    settings: false,
    collaborators: false,
    share: false,
  });

  const toggleSettingsDropdown = () => {
    setIsSettingsDropdownVisible(!isSettingsDropdownVisible);
    setActiveIcons((prev) => ({
      ...prev,
      settings: !prev.settings,
    }));
  };

  const toggleCollaboratorsDropdown = () => {
    setIsCollaboratorsDropdownVisible(!isCollaboratorsDropdownVisible);
    setActiveIcons((prev) => ({
      ...prev,
      collaborators: !prev.collaborators,
    }));
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(currentURL)
      .then(() =>
        setActiveIcons((prev) => ({
          ...prev,
          share: true,
        }))
      )
      .catch((err) => console.error('Failed to copy text:', err));
  };

  const fetchCollaborations = async () => {
    try {
      const response = await axios.get(`/demo/getCollaborationsByTree`, {
        params: { treeId },
        headers: { Authorization: `Bearer ${userToken}` },
        withCredentials: true,
      });

      const collaborationData = response.data;
      setOwner(collaborationData.find((collab) => collab.role === 'Owner'));
      setCollaborators(
        collaborationData.filter((collab) => collab.role === 'Editor').map((collab) => collab.username)
      );
      setViewers(
        collaborationData.filter((collab) => collab.role === 'Viewer').map((collab) => collab.username)
      );
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    }
  };
  const fetchUserTrees = async () => {
    try {
      const response = await axios.get('/demo/getUserFamilyTrees', {
        params: { userId },
        headers: { Authorization: `Bearer ${userToken}` },
      });
  
      console.log('API Response:', response.data);
  
      // Directly set the response data
      setOwnedTrees(response.data); // Avoid unnecessary transformations
    } catch (error) {
      console.error('Error fetching user trees:', error);
    }
  };
  useEffect(() => {
    if (treeId) {
      fetchCollaborations();
    }
    if (userId) {
      fetchUserTrees();
    }
  }, [treeId, userId]);

  const togglePrivacy = () => {
    setPrivacy(!isPublic);
  };

  const handleMerge = async () => {
    if (!selectedMergeTree) {
      alert('Please select a tree to merge with.');
      return;
    }
  
    try {
      console.log('Selected Merge Tree ID:', selectedMergeTree); // Log the numeric ID
  
      const response = await axios.post(
        '/demo/requestMerge',
        null, // No request body
        {
          params: {
            requesterTreeId: treeId, // Current tree ID
            targetTreeId: selectedMergeTree, // Numeric ID of the selected tree
            initiatorUserId: userId, // User initiating the merge
          },
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
  
      console.log('Merge Request Response:', response.data);
      alert(`Merge request sent: ${response.data}`);
    } catch (error) {
      console.error('Error requesting merge:', error.response || error.message);
      alert('An error occurred while requesting the merge.');
    }
  };
  
  
  return (
    <div className="tree-action-header">
      <div className="container-fluid m-0 p-0">
        <div className="flex-container">
          {/* Family Tree Title */}
          <div className="flex-item">
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Family Tree{' '}
              <span style={{ fontSize: '18px', fontWeight: 'normal' }}>
                | {treeName}
              </span>
            </h2>
          </div>

          {/* Settings Dropdown */}
          {!viewOnly && (
            <div className="flex-item" style={{ position: 'relative' }}>
              <button
                className="btn"
                onClick={toggleSettingsDropdown}
                aria-description="Settings"
              >
                <Settings
                  style={{
                    color: activeIcons.settings ? 'green' : 'black',
                  }}
                />
              </button>
              {isSettingsDropdownVisible && (
                <div
                  className="card mt-2"
                  style={{
                    position: 'absolute',
                    right: 0,
                    zIndex: 1000,
                    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                    width: '200px',
                    borderRadius: '8px',
                  }}
                >
                  <div className="card-body">
                    <h6 className="card-title">Settings</h6>
                    {/* Privacy Toggle */}
                    <div className="form-check form-switch custom-toggle my-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="switchPublicPrivate"
                        checked={isPublic}
                        onChange={togglePrivacy}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="switchPublicPrivate"
                      >
                        {isPublic ? 'Public' : 'Private'}
                      </label>
                    </div>
                    {/* Share Link */}
                    <button
                      className="btn btn-secondary btn-sm w-100"
                      onClick={copyLink}
                    >
                      Copy Share Link
                    </button>
                    {/* Merge Trees */}
                    <div className="form-group my-2">
                      <label htmlFor="mergeTreesDropdown">Merge with Tree</label>
                      <select
                        id="mergeTreesDropdown"
                        className="form-select"
                        value={selectedMergeTree || ''}
                        onChange={(e) => setSelectedMergeTree(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a tree
                        </option>
                      {ownedTrees
    .filter((tree) => tree.treeId !== treeId)
    .map((tree) => (
      <option key={tree.treeId} value={tree.treeId}>
        {tree.treeName}
      </option>
    ))}

                      </select>
                      <button
                        className="btn btn-primary btn-sm w-100 mt-2"
                        onClick={handleMerge}
                        disabled={!selectedMergeTree}
                      >
                        Merge Trees
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collaborators Dropdown */}
          <div className="flex-item" style={{ position: 'relative' }}>
            <button
              className="btn"
              onClick={toggleCollaboratorsDropdown}
              aria-description="Collaborators"
            >
              <User
                style={{
                  color: activeIcons.collaborators ? 'green' : 'black',
                }}
              />
            </button>
            {isCollaboratorsDropdownVisible && (
              <div
                className="card mt-2"
                style={{
                  position: 'absolute',
                  right: 0,
                  zIndex: 1000,
                  boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                  width: '300px',
                  borderRadius: '8px',
                }}
              >
                <div className="card-body">
                  {/* Owner Section */}
                  <div>
                    <h6 className="card-title">Owner</h6>
                    {owner && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#d9d9d9',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginRight: '18px',
                          }}
                        >
                          {owner.username[0]}
                        </div>
                        <div>
                          <strong>{owner.username}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Collaborators Section */}
                  <div>
                    <h6 className="card-title">Collaborators</h6>
                    {collaborators.map((username, index) => (
                      <div
                        key={`collaborator-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#d9d9d9',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginRight: '18px',
                          }}
                        >
                          {username[0]}
                        </div>
                        <div>
                          <strong>{username}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr />

                  {/* Viewers Section */}
                  <div>
                    <h6 className="card-title">Viewers</h6>
                    {viewers.map((username, index) => (
                      <div
                        key={`viewer-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#d9d9d9',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginRight: '18px',
                          }}
                        >
                          {username[0]}
                        </div>
                        <div>
                          <strong>{username}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Invite Button */}
                  {!viewOnly && (
                    <button
                      className="btn btn-success btn-block mt-2"
                      onClick={() => setInviteModalOpen(true)}
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        fontWeight: 'bold',
                        width: '60%',
                        padding: '10px 0',
                      }}
                    >
                      Invite
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeActionBar;
