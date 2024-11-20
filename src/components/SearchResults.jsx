import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaCaretDown } from 'react-icons/fa';
import { Star, Network, PanelsTopLeft } from 'lucide-react';
import './SearchResults.css';
import axios from "axios";
import { FaBell, FaQuestionCircle, FaPlus } from 'react-icons/fa';

const SearchResults = ({ setIsAuthenticated, setUser, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('query') || '');
    const [trees, setTrees] = useState([]);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState(''); // State to store username
    const userId = 1; // Hardcoded user ID for testing
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleNotifications = () => {
        setShowNotifications(prevShowNotifications => !prevShowNotifications);
    }

    const handleNotificationClick = async (id, action, treeId) => {
        try {
            const url =
                action === 'accept'
                    ? `/demo/acceptCollaboration?collaborationId=${id}`
                    : `/demo/declineCollaboration?collaborationId=${id}`;

            const response = await axios.post(url, {}, { withCredentials: true });

            if (response.data.includes('accepted') || response.data.includes('declined')) {
                // Remove notification from display
                setNotifications((prev) =>
                    prev.filter((notification) => notification.id !== id)
                );
                setMessage(`Collaboration ${action}ed successfully.`);
            }
        } catch (error) {
            console.error('Error handling collaboration:', error);
            setMessage(`Error: ${error.message}`);
        }

        navigate(url);
    };

    useEffect(() => {
        getPublicTrees();

        const accessToken = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
        if (!accessToken) {
            console.error("User not authenticated");
            setUser(null);
        } else {
            fetchUser();
            fetchNotifications();
        }

    }, []);

    {/*Fetch Notifications*/ }
    const fetchNotifications = async () => {
        if (username) {
            try {
                const response = await fetch(`/demo/notifications/${userId}`);
                if (!response.ok) throw new Error(`Error: ${response.status}`);

                const data = await response.json();
                console.log("Fetched Notifications:", data);
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setMessage(`Error fetching notifications: ${error.message}`);
            }
        }
    };


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


    const fetchUser = () => {
        axios.get('http://localhost:8080/api/login', { withCredentials: true })
            .then(response => {
                if (response.data) {
                    if (response.data.token) {
                        localStorage.setItem('accessToken', response.data.token);
                        setIsAuthenticated(true);
                        setUser(response.data);
                        // Set the username from the name field in the response
                        setUsername(response.data.name || ''); // Use an empty string if name is undefined
                    }
                }
            })
            .catch(error => {
                console.error("User not authenticated:", error);
                setIsAuthenticated(false);
                setUsername(''); // Clear username if authentication fails
            });
    };
    

    const handleGoogleLogin = () => {
        // Redirect to the backend Google OAuth2 authorization endpoint
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };


    return (
        <div className="sr-container">
            <div className="sr-sidebar">
                <img src="/familytreelogo.png" alt="Tree" className="dashboard-logo" />
                <nav className="nav-links">
                    <a href="search-results" className="active">Search Public Trees</a>
                    <a className="tree-icon">
                        <Network />
                        <a href="dashboard">Your Trees</a> </a>
                    <a className="star-icon">
                        <Star />
                        <a href="#">Saved Trees</a> </a>
                    <a className="collabPage-icon">
                        <PanelsTopLeft />
                        <a href="#">Collaborator Trees</a> </a>
                </nav>
            </div>
            <div className="container-fluid m-0 p-0 sr-bg" style={{ background: 'linear-gradient(#a5d6a7, #34c759)' }}>
                <div className="row align-items-center sr-top-bar p-2 m-0">
                    <div className="col-sm d-flex justify-content-start">
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(73, 73, 73)' }}>Search Public Trees</h1>
                    </div>
                    <div className="col-sm">
                        <div className="search-bar2 d-flex">
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
                    </div>
                    {!user && ( // Check if user is null
                        <div className="col-sm d-flex justify-content-end google-login-button">
                            <button onClick={handleGoogleLogin}>
                                <img
                                    src="/google.png"
                                    alt="Google logo"
                                    className="google-logo"
                                />
                                Sign in with Google
                            </button>
                        </div>
                    )}
                    {user && ( // If user exists, show the profile section
                        <div className="col-sm d-flex justify-content-end align-items-center">
                            <FaBell
                                style={{
                                    fontSize: '20px',
                                    color: '#333',
                                    marginRight: '15px',
                                    cursor: 'pointer',
                                }}
                            />
                            <div className="d-flex align-items-center"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/account')}>
                                <img
                                    src="/profile-placeholder.png"
                                    alt="Profile"
                                    style={{
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        marginRight: '8px',
                                    }}
                                />
                                <span style={{ fontSize: '16px', color: 'black' }}>
                                    {user.name || 'User'}
                                </span>
                                <FaCaretDown
                                    style={{ fontSize: '14px', marginLeft: '5px', color: '#333' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="">
                    <h1>Displaying Results for "{searchTerm}"</h1>
                    <div className="container">
                        <div className="row">
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
                    {message && <p style={{ padding: '20px', color: message.includes('Success') ? 'green' : 'red' }}>{message}</p>}
                </div>
            </div>
        </div>
    );
}
export default SearchResults;