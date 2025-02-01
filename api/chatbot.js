const express = require('chatbot');
const app = express();

app.use(chatbot.json());

app.post('/chat', (req, res) => {
  const userInput = req.body.message;
  // Process user input and generate a response (your chatbot logic)
  const response = "This is the bot's response to: " + userInput;
  res.json({ response });
});

module.exports = app;
