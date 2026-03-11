import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Constants
const ADMIN = "Jpro95";
const PORT = process.env.PORT || 5000;

// In-memory databases
let videos = [
  {
    id: "s1",
    title: "Big Buck Bunny",
    desc: "Classic open-source animated film.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    author: ADMIN,
    ts: Date.now() - 3600000 * 72,
    likes: 57,
    views: 389
  },
  {
    id: "s2",
    title: "Elephants Dream",
    desc: "First Blender open movie project.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    author: ADMIN,
    ts: Date.now() - 3600000 * 24,
    likes: 31,
    views: 204
  }
];

let users = [];
let likes = new Map(); // userId -> Set of video IDs
let saves = new Map(); // userId -> Set of video IDs

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

// Get all videos
app.get('/api/videos', (req, res) => {
  res.json({ videos, timestamp: Date.now() });
});

// Add new video
app.post('/api/videos', (req, res) => {
  const { url, title, desc, author } = req.body;

  if (!url || !title || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newVideo = {
    id: `v${Date.now()}`,
    url: url.trim(),
    title: title.trim(),
    desc: desc?.trim() || '',
    author: author.trim(),
    ts: Date.now(),
    likes: 0,
    views: 0
  };

  videos.unshift(newVideo);

  // Broadcast to all connected clients
  io.emit('video:new', newVideo);

  res.status(201).json({ success: true, video: newVideo });
});

// Get user's likes
app.get('/api/users/:userId/likes', (req, res) => {
  const { userId } = req.params;
  const userLikes = likes.get(userId) || new Set();
  res.json({ userId, likes: Array.from(userLikes) });
});

// Toggle like
app.post('/api/videos/:videoId/like', (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  if (!likes.has(userId)) {
    likes.set(userId, new Set());
  }

  const userLikes = likes.get(userId);
  const isLiked = userLikes.has(videoId);

  if (isLiked) {
    userLikes.delete(videoId);
  } else {
    userLikes.add(videoId);
  }

  // Update video like count
  const video = videos.find(v => v.id === videoId);
  if (video) {
    video.likes = Array.from(userLikes).filter(id => id === videoId).length;
  }

  io.emit('video:like-updated', { videoId, userId, liked: !isLiked });

  res.json({ success: true, liked: !isLiked });
});

// Get user's saved videos
app.get('/api/users/:userId/saves', (req, res) => {
  const { userId } = req.params;
  const userSaves = saves.get(userId) || new Set();
  res.json({ userId, saves: Array.from(userSaves) });
});

// Toggle save
app.post('/api/videos/:videoId/save', (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  if (!saves.has(userId)) {
    saves.set(userId, new Set());
  }

  const userSaves = saves.get(userId);
  const isSaved = userSaves.has(videoId);

  if (isSaved) {
    userSaves.delete(videoId);
  } else {
    userSaves.add(videoId);
  }

  io.emit('video:save-updated', { videoId, userId, saved: !isSaved });

  res.json({ success: true, saved: !isSaved });
});

// Delete video (admin only)
app.delete('/api/videos/:videoId', (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  const video = videos.find(v => v.id === videoId);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  if (userId !== ADMIN && video.author !== userId) {
    return res.status(403).json({ error: 'Only admin or author can delete' });
  }

  videos = videos.filter(v => v.id !== videoId);
  io.emit('video:deleted', { videoId });

  res.json({ success: true });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json({ users, count: users.length });
});

// Register/login user
app.post('/api/users/register', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  const existingUser = users.find(u => u.name === name);
  if (existingUser) {
    return res.json({ success: true, user: existingUser, isNew: false });
  }

  const newUser = {
    name: name.trim(),
    joinedAt: Date.now(),
    videoCount: 0,
    isAdmin: name.trim() === ADMIN
  };

  users.push(newUser);
  io.emit('user:registered', newUser);

  res.status(201).json({ success: true, user: newUser, isNew: true });
});

// Delete user (admin only)
app.delete('/api/users/:userName', (req, res) => {
  const { userName } = req.params;
  const { adminId } = req.body;

  if (adminId !== ADMIN) {
    return res.status(403).json({ error: 'Only admin can delete users' });
  }

  users = users.filter(u => u.name !== userName);
  videos = videos.filter(v => v.author !== userName);

  io.emit('user:deleted', { userName });

  res.json({ success: true });
});

// View count increment
app.post('/api/videos/:videoId/view', (req, res) => {
  const { videoId } = req.params;
  const video = videos.find(v => v.id === videoId);

  if (video) {
    video.views++;
    io.emit('video:view-incremented', { videoId, views: video.views });
  }

  res.json({ success: true });
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.emit('videos:all', videos);
  socket.emit('users:all', users);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// 404 fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`\n🎥 VideoHub Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time updates\n`);
});
