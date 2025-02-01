const express = require('express');
const app = express();

// Enable CORS for your frontend domain
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://valdrick97.github.io'); // Allow requests from your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Allow the necessary HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.post('/chat', (req, res) => {
  const userInput = req.body.message;
  // Process user input and generate a response (your chatbot logic)
  const response = "This is the bot's response to: " + userInput;
  res.json({ response });
});

module.exports = app;
