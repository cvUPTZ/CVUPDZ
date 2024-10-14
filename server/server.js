// Backend (Node.js with Express)
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User model
const User = mongoose.model('User', {
  name: String,
  email: String,
  experience: String,
  cvModel: String,
  paymentStatus: { type: String, default: 'pending' },
  paymentReceipt: String // Path to the receipt image
});

app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// API routes

// Create a new user
app.post('/api/user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Upload payment receipt
app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save receipt file path to user's record
    user.paymentReceipt = req.file.path;
    user.paymentStatus = 'pending_verification'; // Set status to pending verification
    await user.save();

    res.json({ success: true, message: 'Receipt uploaded successfully', receiptPath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin route to verify payment and update status
app.post('/api/verify-payment', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentStatus = 'completed'; // Mark payment as verified
    await user.save();

    res.json({ success: true, message: 'Payment verified and status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying payment' });
  }
});

// Download CV
app.get('/api/download/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.paymentStatus === 'completed') {
      const cvFilePath = path.join(__dirname, 'cv_templates', `${user.cvModel}.docx`);
      
      // Check if the file exists
      if (fs.existsSync(cvFilePath)) {
        res.download(cvFilePath, `${user.name}_CV.docx`);
      } else {
        res.status(404).json({ error: 'CV template not found' });
      }
    } else {
      res.status(403).json({ error: 'Payment required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// Download CV
app.get('/',  (req, res) => {
  res.json("Hello");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
