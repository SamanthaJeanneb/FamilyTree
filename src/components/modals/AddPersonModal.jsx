import React from 'react';

const AddPersonModal = ({
  isOpen,
  onClose,
  onSubmit,
  newPerson,
  setNewPerson,
  newRelationship,
  setNewRelationship,
  individuals,
  openAttachmentModal,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevPerson) => ({ ...prevPerson, [name]: value }));
  };

  const handleRelationshipChange = (e) => {
    const { name, value } = e.target;
    setNewRelationship((prevRel) => ({ ...prevRel, [name]: value }));
  };

  if (!isOpen) return null;

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
        zIndex: 1000,
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
        <h2 className="text-center">Add New Individual</h2>
        <form className="add-person-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              placeholder="Name"
              value={newPerson.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Sex</label>
            <select
              className="form-control"
              name="sex"
              value={newPerson.sex}
              onChange={handleInputChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="birthdate">Birthdate</label>
            <input
              type="date"
              className="form-control"
              id="birthdate"
              name="birthdate"
              value={newPerson.birthdate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deathdate">Deathdate</label>
            <input
              type="date"
              className="form-control"
              id="deathdate"
              name="deathdate"
              value={newPerson.deathdate}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Info</label>
            <textarea
              className="form-control"
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Additional information"
              value={newPerson.additionalInfo}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fatherId">First Parent</label>
            <select
              className="form-control"
              id="fatherId"
              name="fid"
              value={newRelationship.fid}
              onChange={handleRelationshipChange}
            >
              <option value="">Select First Parent</option>
              {individuals
                .map((individual) => (
                  <option key={individual.memberId} value={individual.memberId}>
                    {individual.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="motherId">Second Parent</label>
            <select
              className="form-control"
              id="motherId"
              name="mid"
              value={newRelationship.mid}
              onChange={handleRelationshipChange}
            >
              <option value="">Select Second Parent</option>
              {individuals
                .map((individual) => (
                  <option key={individual.memberId} value={individual.memberId}>
                    {individual.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="partnerId">Partner</label>
            <select
              className="form-control"
              id="partnerId"
              name="pid"
              value={newRelationship.pid}
              onChange={handleRelationshipChange}
            >
              <option value="">Select Partner</option>
              {individuals.map((individual) => (
                <option key={individual.memberId} value={individual.memberId}>
                  {individual.name}
                </option>
              ))}
            </select>
          </div>
        
          <div className="form-buttons d-flex justify-content-between mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal;