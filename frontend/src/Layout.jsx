import { useState } from 'react';
import Logo from './assets/title.svg';
import End from './assets/end.svg';

function Header({ onLoginClick }){
    return(
       <header className="app-header" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', boxSizing: 'border-box' }}>
        <img src={Logo} alt="Logo" style={{ height: '40px' }} />
        <button className="header-login-btn" onClick={onLoginClick}>Logout</button>
       </header>
    );
}

function Footer(){
    return(
     <footer className="app-footer" style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', boxSizing: 'border-box' }}>
        <img src={End} alt="footer" style={{ height: '30px' }} />
     </footer>
    );
}

function Bar({ onSearchActive, onContentChange, onLogout }){
    const [activeView, setActiveView] = useState('menu');
    const [searchQuery, setSearchQuery] = useState('');
    // Sorting option kept in code but not visible to user
    const sortBy = 'username'; 
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMore, setShowMore] = useState(false);

    const handleSearch = async (query = '') => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://${window.location.hostname}:3001/api/search?query=${encodeURIComponent(query)}&sort=${encodeURIComponent(sortBy)}`);
            const data = await response.json();
            
            if (response.ok) {
                setUsers(data.users);
            } else {
                setError(data.error || 'Search failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    // Handle search on each character input
    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        // Trigger search on each character input
        handleSearch(query);
    };

    const handleMenuClick = (menuItem) => {
        if (menuItem === 'Search') {
            setActiveView('search');
            if (onSearchActive) onSearchActive(true);
            handleSearch();
} else if (menuItem === 'Message') {
            if (onContentChange) onContentChange('chat');
            setActiveView('menu');
            setSearchQuery('');
            setUsers([]);
            if (onSearchActive) onSearchActive(false);
} else if (menuItem === 'More') {
            setShowMore(!showMore);
        } else if (menuItem === 'Settings') {
            if (onContentChange) onContentChange('settings');
            setActiveView('menu');
            setShowMore(false);
            setSearchQuery('');
            setUsers([]);
            if (onSearchActive) onSearchActive(false);
        } else if (menuItem === 'Logout') {
            setActiveView('menu');
            setShowMore(false);
            setSearchQuery('');
            setUsers([]);
            if (onSearchActive) onSearchActive(false);
            if (onLogout) onLogout();
        } else if (menuItem === 'pic') {
            if (onContentChange) onContentChange('profile');
            setActiveView('menu');
            setSearchQuery('');
            setUsers([]);
            if (onSearchActive) onSearchActive(false);
        } else {
            setActiveView('menu');
            setSearchQuery('');
            setUsers([]);
            if (onSearchActive) onSearchActive(false);
        }
    };

    const handleCloseSearch = () => {
        setActiveView('menu');
        setSearchQuery('');
        setUsers([]);
        if (onSearchActive) onSearchActive(false);
    };

    // Render search view - replaces the bar content
    if (activeView === 'search') {
        return (
            <nav className="search-sidebar">
                <div className="search-header">
                    <input 
                        type="text" 
                        placeholder="Search username..." 
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="search-input"
                    />
                    <button 
                        className="close-search-btn"
                        onClick={handleCloseSearch}
                        title="Close search"
                    >
                        ✕
                    </button>
                </div>
                
                {loading && <p style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>Searching...</p>}
                {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
                
                <div className="search-results">
                    {users.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                            {users.map((username, index) => (
                                <li key={index} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                                    {username}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !loading && <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>No users found</p>
                    )}
                </div>
            </nav>
        );
    }

// Default menu view
    return(
        <nav className="sidebar" style={{ width: '200px' }}>
            <ul>
                <li><a href="#" onClick={() => handleMenuClick('Home')}>Home</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('Search'); }}>Search</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('Message'); }}>Message</a></li>
                <li><a href="#" onClick={() => handleMenuClick('Notification')}>Notification</a></li>
                <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('More'); }}>
                        More {showMore }
                    </a>
                    {showMore && (
                        <ul className="nested-links">
                            <li><a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('Settings'); }}>⚙️ Settings</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('Logout'); }}>↪ Logout</a></li>
                        </ul>
                    )}
                </li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('pic'); }}>pic</a></li>
            </ul>
        </nav>
    );
}

export { Header, Footer, Bar };
