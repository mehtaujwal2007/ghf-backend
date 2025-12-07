// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Routes
import contactRoutes from './routes/contact.js'; // make sure file is exactly contact.js (lowercase)

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// --------------------
// User Schema
// --------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

const User = mongoose.model('User', userSchema);

// --------------------
// Signup Route
// --------------------
app.post('/api/user/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: role || "user" });
    await newUser.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------
// Login Route
// --------------------
app.post('/api/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------
// JWT Middleware
// --------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// --------------------
// Protected Route Example
// --------------------
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: "Protected data accessed", userId: req.user.id, role: req.user.role });
});

// --------------------
// Contact Routes
// --------------------
app.use('/api', contactRoutes); // handles /api/contact POST

// --------------------
// 404 Route
// --------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
