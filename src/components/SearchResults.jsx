import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Trash, Star, Network, PanelsTopLeft } from 'lucide-react';
// import { GoogleLogin } from '@react-oauth/google';
import './SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('query') || '');
    const [trees, setTrees] = useState([]);
    const [message, setMessage] = useState('');

    const handleGoogleLoginSuccess = (response) => {
        console.log('Google Login Success:', response);
        setIsAuthenticated(true);
    };

    const handleGoogleLoginFailure = (error) => {
        console.error('Google Login Failure:', error);
    };

    useEffect(() => {
        getPublicTrees();
    }, []);

    /* {"data":[{"treeId":3,"treeName":"kjh","ownerUsername":"NewUser"}],"message":"Public family trees retrieved successfully.","status":"success"} */

    const getPublicTrees = async () => {
        try {
            const response = await fetch(`/demo/getPublicTrees`, { mode: 'no-cors' });
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const resp = await response.json();
            setTrees(resp.data);
        } catch (error) {
            console.error("Error fetching trees:", error);
            setMessage(`Error fetching trees: ${error.message}`);
        }
    }

    const openTree = (treeName) => navigate(`/tree/${encodeURIComponent(treeName)}`);


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
                        <div className="search-bar2">
                            <input
                                type="text"
                                placeholder="Search for family trees"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        getPublicTrees();
                                    }
                                }}
                            />
                            <button className="search-icon" onClick={getPublicTrees}>
                                <FaSearch />
                            </button>
                        </div>
                        <div className="search-results">
                            <h1>Displaying Results for "{searchTerm}"</h1>
                            <div className="container">
                                <div className="row">
                                    {/* Existing Tree Cards */}
                                    {trees.filter(tree => tree.treeName.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((tree) => (
                                            <div
                                                className="col-md-3 mb-4"
                                                key={tree.id}
                                            >
                                                <div className="card tree-card" onClick={() => openTree(tree.treeName)}>
                                                    <img src="placeholder.png" className="card-img-top tree-image" alt={tree.treeName} />
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title tree-title">{tree.treeName}</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                        {message && <p style={{ padding: '20px', color: message.includes('Success') ? 'green' : 'red' }}>{message}</p>}
                    </div>
                </div>
            </div>
        );
    };


    export default SearchResults;