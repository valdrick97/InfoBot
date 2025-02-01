const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json()); // Allow JSON requests

app.post('/api/chat', (req, res) => {
  const userInput = req.body.message;
  res.json({ response: "Bot response to: " + userInput });
});

// Export for Vercel
module.exports = app;
