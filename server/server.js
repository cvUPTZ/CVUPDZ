const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Define CORS options
const corsOptions = {
  origin: 'https://cvupdz.vercel.app/', // Replace with your frontend URL
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const User = mongoose.model('User', {
  name: String,
  email: String,
  experience: String,
  cvModel: String,
  paymentStatus: { type: String, default: 'pending' },
  paymentReceipt: String
});

// Question model
const Question = mongoose.model('Question', {
  userId: String,
  question: String,
  answer: String,
  answered: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

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

// Telegram Bot Configuration
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const adminUserIds = [1719899525, 987654321]; // Replace with actual admin user IDs

// Middleware to check admin status
function isAdmin(userId) {
  return adminUserIds.includes(userId);
}

// Middleware to handle errors
function errorHandler(res, error) {
  console.error(error);
  res.status(500).json({ error: 'An unexpected error occurred.' });
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
  return emailRegex.test(email);
}

// Function to handle bot messages
async function processBotMessage(message, chatId, userId) {
  try {
    if (message.startsWith('/start')) {
      return bot.sendMessage(chatId, '👋 Bonjour ! Utilisez /question pour poser une question, /liste_questions pour voir et répondre aux questions (réservé aux administrateurs), ou /sendcv pour recevoir un CV. 📄');
    } 
    else if (message.startsWith('/question')) {
      const questionText = message.slice(10).trim();
      await new Question({ userId, question: questionText }).save();
      return bot.sendMessage(chatId, '✅ Votre question a été soumise et sera répondue par un administrateur. 🙏');
    } 
    else if (message.startsWith('/liste_questions') && isAdmin(userId)) {
      const unansweredQuestions = await Question.find({ answered: false }).sort('-timestamp').limit(10);
      const questionList = unansweredQuestions.map(q => `❓ ID: ${q._id}, Question: ${q.question}`).join('\n');
      return bot.sendMessage(chatId, questionList || '🟢 Aucune question non répondue.');
    } 
    else if (message.startsWith('/sendcv')) {
      const args = message.split(',').map(arg => arg.trim());
      if (args.length !== 2 || !args[0].startsWith('/sendcv')) {
        return bot.sendMessage(chatId, '❌ Format de commande incorrect. Utilisez :\n/sendcv [email], [junior|senior]\n\nExemple : /sendcv email@gmail.com, junior');
      }

      const [_, email, cvType] = args;
      if (!isValidEmail(email)) {
        return bot.sendMessage(chatId, '❌ Format d\'email invalide. Veuillez fournir un email valide.');
      }
      
      if (!['junior', 'senior'].includes(cvType.toLowerCase())) {
        return bot.sendMessage(chatId, '❌ Type de CV incorrect. Veuillez utiliser "junior" ou "senior".');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return bot.sendMessage(chatId, '📩 Vous êtes limités à un seul type de CV. 🚫');
      }

      const newUser = new User({ email, cvModel: cvType, paymentStatus: 'pending' });
      await newUser.save();
      return bot.sendMessage(chatId, `✅ Le CV de type ${cvType.charAt(0).toUpperCase() + cvType.slice(1)} a été réservé pour ${email}. ✉️`);
    } 
    else if (message.startsWith('/verify') && isAdmin(userId)) {
      const args = message.split(' ');
      if (args.length !== 2) {
        return bot.sendMessage(chatId, '❌ Format incorrect. Utilisez : /verify [email]');
      }

      const email = args[1];
      const user = await User.findOne({ email });
      if (!user) {
        return bot.sendMessage(chatId, '❌ Utilisateur non trouvé.');
      }

      user.paymentStatus = 'completed';
      await user.save();
      return bot.sendMessage(chatId, `✅ Paiement vérifié pour ${email}. Le CV sera envoyé sous peu.`);
    } 
    else {
      return bot.sendMessage(chatId, 'Commande non reconnue. Utilisez /start pour voir les options disponibles.');
    }
  } catch (error) {
    errorHandler(chatId, error);
  }
}

// Bot command handlers
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;
  await processBotMessage(messageText, chatId, userId);
});

// API routes

// Create a new user
app.post('/api/user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    errorHandler(res, error);
  }
});

// Upload payment receipt
app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentReceipt = req.file.path;
    user.paymentStatus = 'pending_verification';
    await user.save();

    res.json({ success: true, message: 'Receipt uploaded successfully', receiptPath: req.file.path });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Admin route to verify payment and update status
app.post('/api/verify-payment', async (req, res) => {
  const { email, adminId } = req.body;
  if (!isAdmin(adminId)) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentStatus = 'completed';
    await user.save();
    res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    errorHandler(res, error);
  }
});

// Server listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
