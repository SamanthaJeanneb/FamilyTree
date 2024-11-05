import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Trash, Star, Network, PanelsTopLeft } from 'lucide-react';
// import { GoogleLogin } from '@react-oauth/google';
import './SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('query') || '');

    const handleSearch = () => {
        navigate(`/search-results?query=${searchTerm}`);
    };

      const handleGoogleLoginSuccess = (response) => {
        console.log('Google Login Success:', response);
        setIsAuthenticated(true);
      };

      const handleGoogleLoginFailure = (error) => {
        console.error('Google Login Failure:', error);
      };

    const mockResults = [
        { id: 1, title: "Mock Tree 1" },
        { id: 2, title: "Mock Tree 2" },
        { id: 3, title: "Mock Tree 3" },
    ];

    return (
        <div className="guest-dashboard-container">
            <div className="sidebar">
                <img src="/familytreelogo.png" alt="Tree" className="dashboard-logo" />
                <nav className="nav-links">
                    <a href="#" className="active">Search Public Trees</a>
                    <a className="tree-icon">
                        <Network />
                        <a href="#">Your Trees</a> </a>
                    <a className="star-icon">
                        <Star />
                        <a href="#">Saved Trees</a> </a>
                    <a className="collabPage-icon">
                        <PanelsTopLeft />
                        <a href="#">Collaborator Trees</a> </a>
                    <div className="recent-trees">
                        <h4>Recent</h4>
                        <a href="#">Tree 1</a>
                        <a href="#">Tree 2</a>
                        <a href="#">Tree 3</a>
                    </div>
                    <hr></hr>
                    <a className="trash-icon">
                        <Trash />
                        <a href="#">Trash</a> </a>
                </nav>
            </div>
            <div className="guest-main-content">
                <div className="top-bar">
                    <div className="google-login-button">
                        <button className="google-login-button">
                            <img
                                src="/google.png"
                                alt="Google logo"
                                className="google-logo"
                            />
                            Sign in with Google
                        </button>
                    </div>
                </div>
                <div className="search-section-res">
                    <h1>Search Public Trees</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for family trees"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <button className="search-icon" onClick={handleSearch}>
                            <FaSearch />
                        </button>
                    </div>
                    <div className="search-results">
                        <h1>Displaying Results for "{searchTerm}"</h1>
                        <ul>
                            {mockResults.map(result => (
                                <li key={result.id}>
                                    <a href={`/tree/${result.id}`}>{result.title}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


//         <div className="main-page">
//             <div className="container">
//                 <div className="row">
//                     <div className="top-bar">
//                         {/* <GoogleLogin
//                             onSuccess={handleGoogleLoginSuccess}
//                             onError={handleGoogleLoginFailure}
//                             text="signin_with"
//                             width="200"
//                             className="google-signin-button"
//                         /> */}
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col-sm-3">
//                         <div className="sidebar">
//                             <img src="familytreelogo.png" alt="Tree" className="dashboard-logo" />
//                             <nav className="nav-links">
//                                 <a href="#" className="active">Search Public Trees</a>
//                                 <div className="tree-icon">
//                                     <Network />
//                                     <a href="#">Your Trees</a>
//                                 </div>
//                                 <div className="star-icon">
//                                     <Star />
//                                     <a href="#">Saved Trees</a>
//                                 </div>
//                                 <div className="collabPage-icon">
//                                     <PanelsTopLeft />
//                                     <a href="#">Collaborator Trees</a>
//                                 </div>
//                                 <div className="recent-trees">
//                                     <h4>Recent</h4>
//                                     <a href="#">Tree 1</a>
//                                     <a href="#">Tree 2</a>
//                                     <a href="#">Tree 3</a>
//                                 </div>
//                                 <hr />
//                                 <div className="trash-icon">
//                                     <Trash />
//                                     <a href="#">Trash</a>
//                                 </div>
//                             </nav>
//                         </div>
//                     </div>
//                     <div className="col-sm-9">
//                         <div className="search-section">
//                             <h1>Search Public Trees</h1>
//                             <div className="search-bar">
//                                 <input
//                                     type="text"
//                                     placeholder="Search for family trees"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     onKeyDown={(e) => {
//                                         if (e.key === 'Enter') {
//                                             handleSearch();
//                                         }
//                                     }}
//                                 />
//                                 <button className="search-icon" onClick={handleSearch}>
//                                     <FaSearch />
//                                 </button>
//                             </div>
//                             <div className="search-results">
//                                 <h1>Displaying Results for "{searchTerm}"</h1>
//                                 <ul>
//                                     {mockResults.map(result => (
//                                         <li key={result.id}>
//                                             <a href={`/tree/${result.id}`}>{result.title}</a>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

export default SearchResults;