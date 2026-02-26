const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const url = 'mongodb://localhost:27017';
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Store connected users - username to socketId mapping
const connectedUsers = new Map();
// Reverse mapping - socketId to username
const socketToUsername = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their username
  socket.on('join', (username) => {
    connectedUsers.set(username, socket.id);
    socketToUsername.set(socket.id, username);
    socket.broadcast.emit('userJoined', username);
    console.log(`${username} joined the chat`);
    
    // Send list of online users to the newly joined user
    const onlineUsers = Array.from(connectedUsers.keys());
    io.to(socket.id).emit('onlineUsers', onlineUsers);
  });

  // Handle sending messages
  socket.on('sendMessage', (data) => {
    const { to, message } = data;
    const from = socketToUsername.get(socket.id);
    const timestamp = new Date();
    
    // Save message to MongoDB
    saveMessage(from, to, message);
    
    // Send to the recipient if online
    const recipientSocketId = connectedUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', {
        from,
        to,
        message,
        timestamp
      });
    }
    
    // Also send back to sender so they can see their own messages
    io.to(socket.id).emit('newMessage', {
      from,
      to,
      message,
      timestamp,
      self: true
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { to } = data;
    const from = socketToUsername.get(socket.id);
    const recipientSocketId = connectedUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('userTyping', {
        from,
        to
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = socketToUsername.get(socket.id);
    if (username) {
      connectedUsers.delete(username);
      socketToUsername.delete(socket.id);
      socket.broadcast.emit('userLeft', username);
      console.log(`${username} left the chat`);
    }
  });
});

// Helper function to save messages
async function saveMessage(from, to, message) {
  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    const msg = {
      from,
      to,
      message,
      timestamp: new Date()
    };
    
    await db.collection('messages').insertOne(msg);
    await client.close();
  } catch (err) {
    console.error('Error saving message:', err.message);
  }
}

// API to get message history between two users
app.get('/api/messages', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    const messages = await db.collection('messages')
      .find({
        $or: [
          { from: from, to: to },
          { from: to, to: from }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    await client.close();
    res.status(200).json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// API to delete a single message by ID
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    const result = await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
    
    await client.close();
    
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Message deleted successfully' });
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  } catch (err) {
    console.error('Error deleting message:', err.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// API to delete all messages for a user (from or to the user)
app.delete('/api/messages/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    const result = await db.collection('messages').deleteMany({
      $or: [
        { from: username },
        { to: username }
      ]
    });
    
    await client.close();
    
    res.status(200).json({ message: `Deleted ${result.deletedCount} messages` });
  } catch (err) {
    console.error('Error deleting messages:', err.message);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      await client.close();
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const user = { username, password: hashedPassword };
    const result = await db.collection('users').insertOne(user);
    
    await client.close();
    
    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    // Find user
    const user = await db.collection('users').findOne({ username });
    
    await client.close();
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search endpoint - get users with optional sorting
app.get('/api/search', async (req, res) => {
  try {
    const { query, sort = 'username' } = req.query;
    
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('sign');
    
    // Build search filter
    let filter = {};
    if (query) {
      filter = { username: { $regex: query, $options: 'i' } };
    }
    
    // Determine sort order (1 = ascending, -1 = descending)
    const sortOrder = sort === 'username_desc' ? -1 : 1;
    
    // Get users with projection to only return username
    const users = await db.collection('users')
      .find(filter)
      .project({ username: 1, _id: 0 })
      .sort({ username: sortOrder })
      .toArray();
    
    await client.close();
    
    // Filter out null/undefined usernames
    const filteredUsers = users.map(u => u.username).filter(username => username != null);
    res.status(200).json({ users: filteredUsers });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server with socket.io - listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
