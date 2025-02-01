const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://valdrick97.github.io', // Your frontend domain
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions)); // Apply CORS middleware

app.use(express.json());

app.post('/api/chat', (req, res) => {
  const userInput = req.body.message;
  // Process user input and generate a response (your chatbot logic)
  const response = "This is the bot's response to: " + userInput;
  res.json({ response });
});

module.exports = app;
