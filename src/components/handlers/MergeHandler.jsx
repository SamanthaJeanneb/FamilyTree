import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const MergeHandler = ({ mergeId, onClose }) => {
  const [mergeDetails, setMergeDetails] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    const fetchMergeDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch merge details
        const mergeResponse = await axios.get('/demo/getMergeDetails', {
          params: { mergeRequestId: mergeId },
        });

        setMergeDetails(mergeResponse.data);

        // Fetch conflicts
        const conflictResponse = await axios.get('/demo/getMatches', {
          params: {
            treeId1: mergeResponse.data.requesterTreeId,
            treeId2: mergeResponse.data.targetTreeId,
          },
        });

        setConflicts(conflictResponse.data || []);
      } catch (error) {
        console.error("Error fetching merge details:", error);
        setMessage("Failed to load merge details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMergeDetails();
  }, [mergeId]);

  const handleAcceptMerge = async () => {
    try {
      setShowConflictModal(true); // Open conflict modal regardless of conflicts
    } catch (error) {
      console.error("Error accepting merge request:", error);
      setMessage("Failed to accept merge request.");
    }
  };

  const handleDeclineMerge = async () => {
    try {
      const response = await axios.post('/demo/declineMergeRequest', null, {
        params: { mergeRequestId: mergeId },
      });
      setMessage(response.data || "Merge request declined successfully.");
      onClose();
    } catch (error) {
      console.error("Error declining merge request:", error);
      setMessage("Failed to decline merge request.");
    }
  };

  const handleFinalizeMerge = async () => {
    try {
      const { requesterTreeId, targetTreeId } = mergeDetails;
      const response = await axios.post('/demo/finalizeMerge', null, {
        params: { treeId1: requesterTreeId, treeId2: targetTreeId },
      });
      setMessage("Merge finalized successfully!");
      onClose();
    } catch (error) {
      console.error("Error finalizing merge:", error);
      setMessage("Failed to finalize merge.");
    }
  };

  const handleResolveConflict = async (conflictId, isSamePerson) => {
    try {
      const response = await axios.post('/demo/confirmMatch', null, {
        params: { conflictId, isSamePerson },
      });
      setMessage("Conflict resolved successfully!");

      // Refetch conflicts
      const { requesterTreeId, targetTreeId } = mergeDetails;
      const conflictResponse = await axios.get('/demo/getMatches', {
        params: { treeId1: requesterTreeId, treeId2: targetTreeId },
      });
      setConflicts(conflictResponse.data || []);
    } catch (error) {
      console.error("Error resolving conflict:", error);
      setMessage("Failed to resolve conflict.");
    }
  };

  const closeConflictModal = () => {
    setShowConflictModal(false);
  };

  return (
    <>
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Merge Request Details</h5>
              <button onClick={onClose} className="btn-close"></button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <p>Loading merge details...</p>
              ) : (
                <div className="card text-dark">
                  <div className="card-body">
                    <h5 className="card-title">Merge Request ID: {mergeId}</h5>
                    <p><strong>Requester Tree:</strong> {mergeDetails?.requesterTreeName}</p>
                    <p><strong>Requester Tree Owner:</strong> {mergeDetails?.requesterTreeOwnerUsername}</p>
                    <p><strong>Target Tree:</strong> {mergeDetails?.targetTreeName}</p>
                    <p><strong>Target Tree Owner:</strong> {mergeDetails?.targetTreeOwnerUsername}</p>
                    <p><strong>Initiator:</strong> {mergeDetails?.initiatorUsername}</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success" onClick={handleAcceptMerge}>
                        Accept
                      </button>
                      <button className="btn btn-danger" onClick={handleDeclineMerge}>
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {message && <p className="alert alert-info mt-3">{message}</p>}
            </div>
          </div>
        </div>
      </div>

      {showConflictModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Resolve Conflicts</h5>
                <button onClick={closeConflictModal} className="btn-close"></button>
              </div>
              <div className="modal-body">
                {conflicts.length > 0 ? (
                  <>
                    <p>Please resolve all conflicts before finalizing the merge.</p>
                    <ul className="list-group">
                      {conflicts.map((conflict) => (
                        <li key={conflict.conflictId} className="list-group-item">
                          <p><strong>Conflict ID:</strong> {conflict.conflictId}</p>
                          <p><strong>Status:</strong> {conflict.status}</p>
                          <div>
                            <p><strong>Member 1:</strong></p>
                            <p>Name: {conflict.member1.name}</p>
                            <p>Birthdate: {conflict.member1.birthdate}</p>
                            <p>Additional Info: {conflict.member1.additionalInfo}</p>
                          </div>
                          <div>
                            <p><strong>Member 2:</strong></p>
                            <p>Name: {conflict.member2.name}</p>
                            <p>Birthdate: {conflict.member2.birthdate}</p>
                            <p>Additional Info: {conflict.member2.additionalInfo}</p>
                          </div>
                          <div className="mt-2">
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => handleResolveConflict(conflict.conflictId, true)}
                            >
                              Same Person
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleResolveConflict(conflict.conflictId, false)}
                            >
                              Different Person
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <button className="btn btn-primary mt-3" onClick={handleFinalizeMerge}>
                    Finalize Merge
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MergeHandler;
