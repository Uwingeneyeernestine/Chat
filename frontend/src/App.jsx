import { useState, useEffect } from "react";
import Page from './page.jsx';
import { Header, Footer, Bar } from './Layout.jsx';
import UserIcon from './assets/user.svg';
import Chat from './chat.jsx';

// Logout Modal Component - declared outside to avoid recreation during render
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="logout-confirm-btn" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [activeContent, setActiveContent] = useState("welcome");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Settings state
  const [settingsUsername, setSettingsUsername] = useState("");
  const [settingsDisplayName, setSettingsDisplayName] = useState("");
  const [settingsBio, setSettingsBio] = useState("");
  const [settingsProfilePic, setSettingsProfilePic] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  
  const API_URL = `http://${window.location.hostname}:3001`;

  // Restore session from localStorage on initial load
  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username');
    const savedDisplayName = localStorage.getItem('chat_displayName');
    const savedBio = localStorage.getItem('chat_bio');
    const savedProfilePic = localStorage.getItem('chat_profilePic');
    const savedActiveContent = localStorage.getItem('chat_activeContent');

    if (savedUsername) {
      setUsername(savedUsername);
      setDisplayName(savedDisplayName || savedUsername);
      setBio(savedBio || "");
      setProfilePic(savedProfilePic);
      setSettingsUsername(savedUsername);
      setSettingsDisplayName(savedDisplayName || savedUsername);
      setSettingsBio(savedBio || "");
      setSettingsProfilePic(savedProfilePic);
      setActiveContent(savedActiveContent || "welcome");
      setIsLoggedIn(true);
      
      // Restore chat state if that's what was open
      if (savedActiveContent === 'chat') {
        setShowChat(true);
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch user profile from database on login
  const fetchUserProfile = async (user) => {
    try {
      const response = await fetch(`${API_URL}/api/user/${user}`);
      if (response.ok) {
        const data = await response.json();
        if (data.displayName) {
          setDisplayName(data.displayName);
          setSettingsDisplayName(data.displayName);
        }
        if (data.bio) {
          setBio(data.bio);
          setSettingsBio(data.bio);
        }
        if (data.profilePic) {
          setProfilePic(data.profilePic);
          setSettingsProfilePic(data.profilePic);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('chat_username', username);
      localStorage.setItem('chat_displayName', displayName);
      localStorage.setItem('chat_bio', bio || "");
      localStorage.setItem('chat_profilePic', profilePic || "");
      localStorage.setItem('chat_activeContent', activeContent);
    }
  }, [isLoggedIn, username, displayName, bio, profilePic, activeContent]);

  // Prevent browser back button from leaving the app when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleBrowserBack = () => {
      window.history.pushState({ page: 'app' }, '', window.location.href);
    };

    window.history.pushState({ page: 'app' }, '', window.location.href);
    
    window.addEventListener('popstate', handleBrowserBack);
    
    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
    };
  }, [isLoggedIn]);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    setDisplayName(user);
    setSettingsUsername(user);
    setSettingsDisplayName(user);
    localStorage.setItem('chat_username', user);
    localStorage.setItem('chat_displayName', user);
    // Fetch profile from database
    fetchUserProfile(user);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setDisplayName("");
    setBio("");
    setProfilePic(null);
    setActiveContent("welcome");
    setShowLogoutModal(false);
    // Clear settings state
    setSettingsUsername("");
    setSettingsDisplayName("");
    setSettingsBio("");
    setSettingsProfilePic(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    // Clear localStorage
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_displayName');
    localStorage.removeItem('chat_bio');
    localStorage.removeItem('chat_profilePic');
    localStorage.removeItem('chat_activeContent');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleContentChange = (content) => {
    if (content === 'chat') {
      setShowChat(true);
      setActiveContent('chat');
    } else {
      setShowChat(false);
      setActiveContent(content);
      if (content !== 'search') {
        setIsSearchActive(false);
      }
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setSettingsProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    alert("Profile updated successfully!");
  };

  // Save settings to database
  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/${username}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: settingsDisplayName,
          bio: settingsBio,
          profilePic: settingsProfilePic
        })
      });
      
      if (response.ok) {
        // Update local state
        setDisplayName(settingsDisplayName);
        setBio(settingsBio);
        setProfilePic(settingsProfilePic);
        alert("Settings saved successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save settings");
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert("Failed to save settings");
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/user/${username}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordSuccess(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError("Failed to change password");
    }
  };

  // Change username
  const handleChangeUsername = async () => {
    setUsernameError("");
    setUsernameSuccess("");
    
    if (!settingsUsername) {
      setUsernameError("Username is required");
      return;
    }
    
    if (settingsUsername === username) {
      setUsernameError("New username must be different from current");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/user/${username}/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: settingsUsername
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUsernameSuccess(data.message);
        setUsername(data.newUsername);
        setDisplayName(data.newUsername);
        localStorage.setItem('chat_username', data.newUsername);
        localStorage.setItem('chat_displayName', data.newUsername);
        // Update socket connection with new username
        window.location.reload();
      } else {
        setUsernameError(data.error);
      }
    } catch (err) {
      console.error('Error changing username:', err);
      setUsernameError("Failed to change username");
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'profile':
        return (
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="profile-img" />
                  ) : (
                    <img src={UserIcon} alt="Profile" className="profile-img" />
                  )}
                </div>
                <label className="change-pic-btn" style={{ color: 'black' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePicChange} 
                    style={{ display: 'none' }}
                  />
                  Change Photo
                </label>
              </div>
              
              {isEditingProfile ? (
                <div className="profile-edit-name">
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="edit-name-input"
                  />
                  <button onClick={handleSaveProfile} className="save-name-btn">Save</button>
                  <button onClick={() => setIsEditingProfile(false)} className="cancel-name-btn">Cancel</button>
                </div>
              ) : (
                <div className="profile-name-row">
                  <h2 className="profile-username">{displayName || username}</h2>
                  <button onClick={() => setIsEditingProfile(true)} className="edit-name-btn">✏️ Edit Name</button>
                </div>
              )}
              
              <p className="profile-status">Online</p>
            </div>
            
            <div className="profile-info">
              <div className="info-item">
                <label>Username:</label>
                <span>{username}</span>
              </div>
              <div className="info-item">
                <label>Display Name:</label>
                <span>{displayName || "Not set"}</span>
              </div>
              <div className="info-item bio-item">
                <label>Bio:</label>
                {isEditingProfile ? (
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="edit-bio-input"
                  />
                ) : (
                  <div className="bio-display">
                    <span>{bio || "No bio yet"}</span>
                    <button onClick={() => setIsEditingProfile(true)} className="edit-bio-btn">✏️ Edit</button>
                  </div>
                )}
              </div>
              <div className="info-item">
                <label>Member since:</label>
                <span>Recently joined</span>
              </div>
            </div>
            
            {isEditingProfile && (
              <div className="profile-edit-actions">
                <button onClick={handleSaveProfile} className="save-btn">Save All Changes</button>
                <button onClick={() => setIsEditingProfile(false)} className="cancel-btn">Cancel</button>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="settings-container">
            <h2>Settings</h2>
            
            <div className="settings-section">
              <h3>Change Username</h3>
              <div className="setting-item">
                <label>Current Username</label>
                <input type="text" value={username} disabled />
              </div>
              <div className="setting-item">
                <label>New Username</label>
                <input 
                  type="text" 
                  value={settingsUsername}
                  onChange={(e) => setSettingsUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </div>
              {usernameError && <p className="error-message">{usernameError}</p>}
              {usernameSuccess && <p className="success-message">{usernameSuccess}</p>}
              <button className="save-btn" onClick={handleChangeUsername}>Change Username</button>
            </div>
            
            <div className="settings-section">
              <h3>Change Password</h3>
              <div className="setting-item">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="setting-item">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="setting-item">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && <p className="error-message">{passwordError}</p>}
              {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
              <button className="save-btn" onClick={handleChangePassword}>Change Password</button>
            </div>
            
            <div className="settings-section">
              <h3>Profile Settings</h3>
              <div className="setting-item">
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={settingsDisplayName}
                  onChange={(e) => setSettingsDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              <div className="setting-item">
                <label>Bio</label>
                <textarea 
                  placeholder="Tell us about yourself..."
                  value={settingsBio}
                  onChange={(e) => setSettingsBio(e.target.value)}
                ></textarea>
              </div>
              <div className="setting-item">
                <div className="profile-pic-preview">
                  {settingsProfilePic ? (
                    <img src={settingsProfilePic} alt="Profile" className="preview-img" />
                  ) : profilePic ? (
                    <img src={profilePic} alt="Profile" className="preview-img" />
                  ) : (
                    <img src={UserIcon} alt="Profile" className="preview-img" />
                  )}
                </div>
                <label className="upload-pic-btn">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                  />
                  Choose Photo
                </label>
              </div>
              <button className="save-btn" onClick={handleSaveSettings}>Save All Changes</button>
            </div>
          </div>
        );
      case 'chat':
        return showChat ? (
          <Chat username={username} onClose={() => setShowChat(false)} />
        ) : (
          <div className="welcome-content">
            <h2>Welcome to MAI Chat, {displayName || username}!</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
      default:
        return (
          <div className="welcome-content">
            <h2>Welcome to MAI Chat, {displayName || username}!</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <div className="app-container">
        <Header username={username} onLoginClick={handleLogoutClick} />
        <div className="main-content">
          <Bar 
            onSearchActive={setIsSearchActive} 
            onContentChange={handleContentChange}
            onLogout={handleLogoutClick}
            username={username}
          />
          <div className={`content-area ${isSearchActive ? 'search-active' : ''}`}>
            {renderContent()}
          </div>
        </div>
        <Footer />
        {showLogoutModal && <LogoutModal onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />}
      </div>
    );
  }

  return (
    <Page onLoginSuccess={handleLoginSuccess} />
  );
 
}
export default App
