import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const MergeHandler = ({ mergeId, onClose }) => {
  const [mergeDetails, setMergeDetails] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMergeDetails = async () => {
      try {
        setIsLoading(true);

        const mergeResponse = await axios.get('/demo/getMergeDetails', {
          params: { mergeRequestId: mergeId },
        });

        const { requesterTree, targetTree, initiator } = mergeResponse.data;

        setMergeDetails({
          mergeId,
          requesterTreeId: requesterTree.id,
          requesterTreeName: requesterTree.name, // Add tree name
          targetTreeId: targetTree.id,
          targetTreeName: targetTree.name, // Add tree name
          initiatorUserId: initiator.id, // Add initiator ID
        });

        const conflictResponse = await axios.get('/demo/getMatches', {
          params: { treeId1: requesterTree.id, treeId2: targetTree.id },
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

  const modalStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: 'black',
  };

  const contentStyle = {
    textAlign: 'center',
    color: 'black',
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div style={modalStyle}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={contentStyle}>Merge Request Details</h5>
              <button onClick={onClose} className="btn-close"></button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <p style={contentStyle}>Loading merge details...</p>
              ) : (
                <div className="card text-dark">
                  <div className="card-body" style={contentStyle}>
                    <h5 className="card-title">Merge Request ID: {mergeId}</h5>
                    <p className="card-text">Requester Tree Name: {mergeDetails.requesterTreeName}</p>
                    <p className="card-text">Requester Tree ID: {mergeDetails.requesterTreeId}</p>
                    <p className="card-text">Target Tree Name: {mergeDetails.targetTreeName}</p>
                    <p className="card-text">Target Tree ID: {mergeDetails.targetTreeId}</p>
                    <p className="card-text">Initiated by User ID: {mergeDetails.initiatorUserId}</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-success" onClick={() => console.log("Accept")}>
                        Accept
                      </button>
                      <button className="btn btn-danger" onClick={onClose}>
                        Decline
                      </button>
                    </div>
                    {conflicts.length > 0 && (
                      <div className="mt-3">
                        <h6>Conflicts</h6>
                        <ul className="list-group">
                          {conflicts.map((conflict) => (
                            <li key={conflict.id} className="list-group-item">
                              {conflict.description} - Conflict ID: {conflict.id}
                              <div className="mt-2 d-flex justify-content-center">
                                <button
                                  className="btn btn-primary btn-sm me-2"
                                  onClick={() => console.log("Same Person")}
                                >
                                  Same Person
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => console.log("Different Person")}
                                >
                                  Different Person
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {conflicts.length === 0 && (
                      <button className="btn btn-primary mt-3" onClick={() => console.log("Finalize")}>
                        Finalize Merge
                      </button>
                    )}
                  </div>
                </div>
              )}
              {message && <p className="alert alert-info mt-3">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeHandler;
