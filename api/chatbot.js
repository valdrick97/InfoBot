const express = require('express');
const app = express();

// Allow requests from specific origin (your frontend URL)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://valdrick97.github.io'); // Add your frontend URL here
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Allow the necessary HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
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
