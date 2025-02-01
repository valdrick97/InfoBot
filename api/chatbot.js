const express = require('express');
const app = express();

app.use(express.json());

app.post('/chat', (req, res) => {
  const userInput = req.body.message;
  // Process user input and generate a response (your chatbot logic)
  const response = "This is the bot's response to: " + userInput;
  res.json({ response });
});

module.exports = app;
