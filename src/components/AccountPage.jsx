import React from 'react'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './AccountPage.css';

const AccountPage = () => {
  // Placeholder data, you can replace these with props or context if data is fetched
  const userData = {
    name: 'Person Name',
    email: 'person.name@gmail.com',
    profilePicture: '/profile-placeholder.png',
  };

  return (
    <div className="account-container">
      <div className="account-card card">
        <h2>Account Details</h2>
        <div className="text-center">
          <img
            src={userData.profilePicture}
            alt="Profile"
            className="rounded-circle img-thumbnail mb-3"
          />
        </div>
        <h4 className="text-center">{userData.name}</h4>
        <p className="text-center">{userData.email}</p>
        <button className="btn btn-primary w-100">Edit Details</button>
      </div>
    </div>
  );
};

export default AccountPage;
