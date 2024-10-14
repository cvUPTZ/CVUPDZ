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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = mongoose.model('User', {
  name: String,
  email: String,
  experience: String,
  cvModel: String,
  paymentStatus: { type: String, default: 'pending' },
  paymentReceipt: String
});

const Message = mongoose.model('Message', {
  user: String,
  bot: String,
  timestamp: { type: Date, default: Date.now }
});

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

// Helper functions
function isAdmin(userId) {
  return admin_user_ids.includes(userId);
}

// CV file paths
const CV_FILES = {
  'junior': 'cv_models/Junior_cv_model.docx',
  'senior': 'cv_models/Senior_cv_model.docx'
};

// Implement actual bot logic
async function processBotMessage(message, chatId, userId) {
  if (message.startsWith('/start')) {
    return bot.sendMessage(chatId, '👋 Bonjour ! Utilisez /question pour poser une question, /liste_questions pour voir et répondre aux questions (réservé aux administrateurs), ou /sendcv pour recevoir un CV. 📄');
  } else if (message.startsWith('/question')) {
    const questionText = message.slice(10);
    await new Question({ userId: userId, question: questionText }).save();
    return bot.sendMessage(chatId, '✅ Votre question a été soumise et sera répondue par un administrateur. 🙏');
  } else if (message.startsWith('/liste_questions') && isAdmin(userId)) {
    const unansweredQuestions = await Question.find({ answered: false }).sort('-timestamp').limit(10);
    const questionList = unansweredQuestions.map(q => `❓ ID: ${q._id}, Question: ${q.question}`).join('\n');
    return bot.sendMessage(chatId, questionList || '🟢 Aucune question non répondue.');
  } else if (message.startsWith('/sendcv')) {
    const args = message.split(',').map(arg => arg.trim());
    if (args.length !== 3 || !args[0].startsWith('/sendcv')) {
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
    const response = await processBotMessage(messageText, chatId, userId);
    // Save message and response to database
    await new Message({ user: messageText, bot: response.text }).save();
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
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentStatus = 'completed';
    await user.save();

    res.json({ success: true, message: 'Payment verified and status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying payment' });
  }
});

// Download CV
app.get('/api/download/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.paymentStatus === 'completed') {
      const cvFilePath = path.join(__dirname, CV_FILES[user.cvModel]);
      
      if (fs.existsSync(cvFilePath)) {
        res.download(cvFilePath, `${user.email}_CV.docx`);
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

// Get all messages
app.get('/api/bot/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort('-timestamp').limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Admin route for LinkedIn scraping
app.post('/api/bot/scrapeLinkedIn', async (req, res) => {
  const { adminId } = req.body;
  if (!isAdmin(adminId)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    // Implement LinkedIn scraping logic here
    // This is a placeholder and should be replaced with actual scraping code
    const scrapedData = { jobs: [], companies: [] };
    res.json({ message: 'LinkedIn scraping completed', data: scrapedData });
  } catch (error) {
    res.status(500).json({ error: 'Error during LinkedIn scraping' });
  }
});

// Admin route to get job offers
app.post('/api/bot/offremploi', async (req, res) => {
  const { adminId } = req.body;
  if (!isAdmin(adminId)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    // Implement job offer retrieval logic here
    // This is a placeholder and should be replaced with actual job retrieval code
    const jobs = [
      { title: 'Software Engineer', company: 'TechCorp', location: 'Algiers' },
      { title: 'Data Analyst', company: 'DataCo', location: 'Oran' }
    ];
    res.json({ message: 'Job offers retrieved', offers: jobs });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving job offers' });
  }
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

// Start the bot
bot.on('polling_error', (error) => {
  console.log(error);
});

console.log('Bot is running...');