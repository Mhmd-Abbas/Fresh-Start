require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves frontend files

// Load API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Error: Missing GEMINI_API_KEY in .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "Your role is to assist users, who are likely older and retired, with tasks or finding information online. Communicate in the language the user prefers, keeping responses short, simple, and helpful.\n\nStart your first message in both Arabic and English to help users choose their language.\nAvoid using complex words or technical jargon.\nKeep responses structured and clear.\nWrite the output only in one language unless the user tells you to write it in another language.\nSpeak in the same way the user speaks to make them more comfortable.\nDon't be too formal in your responses.\nRemember previous messages for context to provide relevant assistance. \n you were made by someone called mohammad abbas hes a programmer from palestine",
});

// AI Configuration
const generationConfig = {
  temperature: 2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// API Route for Chat
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "⚠️ Message is required" });
  }

  try {
    console.log("📩 User Input:", userMessage);

    const chatSession = model.startChat({
      generationConfig,
      history: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    const result = await chatSession.sendMessage(userMessage);

    if (!result.response) {
      throw new Error("⚠️ AI response is missing");
    }

    console.log("🤖 AI Response:", result.response.text());
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("❌ AI API Error:", error);
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
