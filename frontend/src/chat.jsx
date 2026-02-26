import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function Chat({ username, onClose }) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const [showDeleteForIndex, setShowDeleteForIndex] = useState(null);

  const API_URL = `http://${window.location.hostname}:3001`;

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    
    const handleBrowserBack = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('popstate', handleBrowserBack);
    
    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/search?`)
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          const otherUsers = data.users.filter(u => u !== username);
          setAllUsers(otherUsers);
        }
      })
      .catch(err => console.error('Error fetching users:', err));
  }, [username]);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const newSocket = io(API_URL);
    socketRef.current = newSocket;
    newSocket.emit('join', username);

    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users.filter(u => u !== username));
    });

    newSocket.on('newMessage', (data) => {
      const currentSelectedUser = selectedUserRef.current;
      
      if (currentSelectedUser && (data.from === currentSelectedUser || data.to === currentSelectedUser)) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            msg => msg.timestamp === data.timestamp && msg.from === data.from && msg.message === data.message
          );
          if (isDuplicate) return prev;
          return [...prev, data];
        });
      }
      
      if (data.from && data.from !== username && data.from !== currentSelectedUser) {
        console.log(`New message from ${data.from}: ${data.message}`);
      }
      
      if (data.from && data.from !== username) {
        setAllUsers(prev => prev.includes(data.from) ? prev : [...prev, data.from]);
      }
    });

    newSocket.on('userJoined', (user) => {
      setOnlineUsers(prev => prev.includes(user) ? prev : [...prev, user]);
      setAllUsers(prev => prev.includes(user) ? prev : [...prev, user]);
    });

    newSocket.on('userLeft', (user) => {
      setOnlineUsers(prev => prev.filter(u => u !== user));
    });

    newSocket.on('userTyping', (data) => {
      if (data.from === selectedUser) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    if (selectedUser && username) {
      fetch(`${API_URL}/api/messages?from=${username}&to=${selectedUser}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            const msgs = data.messages.map((msg, index) => ({
              ...msg,
              _id: msg._id || `temp-${index}-${new Date(msg.timestamp).getTime()}`
            }));
            setMessages(msgs);
          }
        })
        .catch(err => console.error('Error fetching messages:', err));
    }
  }, [selectedUser, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && selectedUser) {
      socketRef.current.emit('sendMessage', {
        to: selectedUser,
        message: newMessage
      });
      
      setMessages((prev) => [...prev, {
        from: username,
        to: selectedUser,
        message: newMessage,
        timestamp: new Date().toISOString()
      }]);
      
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (socketRef.current && selectedUser) {
      socketRef.current.emit('typing', { to: selectedUser });
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setSearchQuery('');
    setShowDeleteForIndex(null);
  };

  const deleteMessage = async (messageId) => {
    if (messageId && !messageId.startsWith('temp-')) {
      try {
        await fetch(`${API_URL}/api/messages/${messageId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    setShowDeleteForIndex(null);
  };

  const filteredUsers = allUsers.filter(user => 
    user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const otherUsers = filteredUsers;

  return (
    <div className="chat-container">
      <div className="chat-body">
        <div className="chat-users">
          <div className="chat-user-search">
            <input
              type="text"
              placeholder={`Search ${username}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chat-search-input"
            />
          </div>
          
          <ul>
            {otherUsers.length > 0 ? (
              otherUsers.map((user, index) => (
                <li 
                  key={index} 
                  onClick={() => handleUserSelect(user)}
                  className={selectedUser === user ? 'active' : ''}
                >
                  <span className="user-status">
                    <span className={`status-dot ${onlineUsers.includes(user) ? 'online' : ''}`}></span>
                    {user}
                  </span>
                </li>
              ))
            ) : (
              <li className="no-users">No users found</li>
            )}
          </ul>
        </div>

        <div className="chat-messages">
          {selectedUser ? (
            <>
              <div className="chat-receiver">
                <span className="receiver-name">{selectedUser}</span>
                <button className="close-chat-btn" onClick={onClose}>✕</button>
              </div>
              
              <div className="messages-list">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.from === username ? 'sent' : 'received'}`}
                    style={{ display: 'flex', alignItems: 'flex-start' }}
                  >
                    {msg._id && !msg._id.startsWith('temp-') && (
                      <span 
                        onClick={() => setShowDeleteForIndex(showDeleteForIndex === index ? null : index)}
                        style={{ 
                          cursor: 'pointer', 
                          marginRight: '5px',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: '#666'
                        }}
                      >
                        :
                      </span>
                    )}
                    {showDeleteForIndex === index && (
                      <span 
                        onClick={() => deleteMessage(msg._id)}
                        style={{ 
                          cursor: 'pointer', 
                          color: 'red',
                          fontSize: '12px',
                          marginRight: '5px'
                        }}
                      >
                        delete
                      </span>
                    )}
                    <div className="message-content">
                      <p style={{ margin: 0 }}>{msg.message}</p>
                      <div style={{ marginTop: '5px' }}>
                        <span className="message-time">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {typing && <div className="typing-indicator">{selectedUser} is typing...</div>}

              <form className="message-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder={`Message ${selectedUser}...`}
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
