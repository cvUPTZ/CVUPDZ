//server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User model
const User = mongoose.model('User', {
  name: String,
  email: String,
  experience: String,
  cvModel: String,
  paymentStatus: { type: String, default: 'pending' },
  paymentReceipt: String
});

// Message model
const Message = mongoose.model('Message', {
  user: String,
  bot: String,
  timestamp: { type: Date, default: Date.now }
});

// Question model
const Question = mongoose.model('Question', {
  userId: String,
  question: String,
  answer: String,
  answered: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
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

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const admin_user_ids = [1719899525, 987654321]; // Replace with actual admin user IDs

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Helper function to check if user is admin
function isAdmin(userId) {
  return admin_user_ids.includes(userId);
}
app.post('/api/bot/sendMessage', async (req, res) => {
  const { chatId, messageText, message } = req.body;
  const textToSend = messageText || message;
  
  if (!chatId || !textToSend) {
    return res.status(400).json({ error: 'Chat ID and message text are required.' });
  }

  try {
    const response = await bot.sendMessage(chatId, textToSend);
    res.json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
// CV file paths
const CV_FILES = {
  'junior': 'cv_models/Junior_cv_model.docx',
  'senior': 'cv_models/Senior_cv_model.docx'
};

// Implement bot message processing
async function processBotMessage(message, chatId, userId) {
  if (message.startsWith('/start')) {
    return bot.sendMessage(chatId, '👋 Bonjour ! Utilisez /question pour poser une question, /liste_questions pour voir et répondre aux questions (réservé aux administrateurs), ou /sendcv pour recevoir un CV. 📄');
  } else if (message.startsWith('/question')) {
    const questionText = message.slice(10).trim();
    await new Question({ userId: userId, question: questionText }).save();
    return bot.sendMessage(chatId, '✅ Votre question a été soumise et sera répondue par un administrateur. 🙏');
  } else if (message.startsWith('/liste_questions') && isAdmin(userId)) {
    const unansweredQuestions = await Question.find({ answered: false }).sort('-timestamp').limit(10);
    const questionList = unansweredQuestions.map(q => `❓ ID: ${q._id}, Question: ${q.question}`).join('\n');
    return bot.sendMessage(chatId, questionList || '🟢 Aucune question non répondue.');
  } else if (message.startsWith('/sendcv')) {
    const args = message.split(',').map(arg => arg.trim());
    if (args.length !== 2 || !args[0].startsWith('/sendcv')) {
      return bot.sendMessage(chatId, '❌ Format de commande incorrect. Utilisez :\n/sendcv [email], [junior|senior]\n\nExemple : /sendcv email@gmail.com, junior');
    }
    const [_, email, cv_type] = args;
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

    if (!email_regex.test(email)) {
      return bot.sendMessage(chatId, '❌ Format d\'email invalide. Veuillez fournir un email valide.');
    }

    if (!['junior', 'senior'].includes(cv_type.toLowerCase())) {
      return bot.sendMessage(chatId, '❌ Type de CV incorrect. Veuillez utiliser "junior" ou "senior".');
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return bot.sendMessage(chatId, '📩 Vous êtes limités à un seul type de CV. 🚫');
    }

    if (!fs.existsSync(CV_FILES[cv_type])) {
      return bot.sendMessage(chatId, '❌ Le fichier CV n\'existe pas. Veuillez vérifier le type de CV.');
    }

    const newUser = new User({
      email: email,
      cvModel: cv_type,
      paymentStatus: 'pending'
    });
    await newUser.save();

    return bot.sendMessage(chatId, 
      `✅ Le CV de type ${cv_type.charAt(0).toUpperCase() + cv_type.slice(1)} a été réservé pour ${email}. ✉️\n\n` +
      'سعداء جدا باهتمامكم بمبادرة CV_UP ! 🌟\n\n' +
      'لقد تم حفظ طلبكم للحصول على نموذج CV_UP الذي سيساعدكم في تفادي أغلب الأخطاء التي قد تحرمكم من فرص العمل. 📝\n\n' +
      'للحصول على النسخة النهائية، يرجى إتمام عملية الدفع إما بالتبرع بالدم في إحدى المستشفيات 🩸 أو التبرع بمبلغ من المال إلى جمعية البركة الجزائرية 💵، الذين بدورهم يوصلون التبرعات إلى غزة. 🙏\n\n' +
      'بعد إتمام عملية الدفع، يرجى إرسال صورة لوصل التبرع إلى هذا البوت للتحقق وإرسال النسخة النهائية من السيرة الذاتية. ✅\n\n' +
      'حساب جمعية البركة: CCP. 210 243 29 Clé 40 🏥✊'
    );
  } else if (message.startsWith('/verify') && isAdmin(userId)) {
    const args = message.split(' ');
    if (args.length !== 2) {
      return bot.sendMessage(chatId, '❌ Format incorrect. Utilisez : /verify [email]');
    }
    const email = args[1];
    const user = await User.findOne({ email: email });
    if (!user) {
      return bot.sendMessage(chatId, '❌ Utilisateur non trouvé.');
    }
    user.paymentStatus = 'completed';
    await user.save();
    return bot.sendMessage(chatId, `✅ Paiement vérifié pour ${email}. Le CV sera envoyé sous peu.`);
  } else {
    return bot.sendMessage(chatId, 'Commande non reconnue. Utilisez /start pour voir les options disponibles.');
  }
}

// Bot command handlers
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;

  try {
    await processBotMessage(messageText, chatId, userId);
  } catch (error) {
    console.error('Error processing message:', error);
    bot.sendMessage(chatId, 'Une erreur s\'est produite. Veuillez réessayer plus tard.');
  }
});

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
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentReceipt = req.file.path;
    user.paymentStatus = 'pending_verification';
    await user.save();

    res.json({ success: true, message: 'Receipt uploaded successfully', receiptPath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// Server listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
