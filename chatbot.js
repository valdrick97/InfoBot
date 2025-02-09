const chatContainer = document.getElementById('chatBox');
const popupMessage = document.getElementById('popupMessage');
const chatbotButton = document.getElementById('botCircle');
let isChatInitialized = false; // Track if the greeting message was shown
let inactivityTimer; // Timer for inactivity

// Ensure chat is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
  chatContainer.style.display = "none"; // Ensure chat is hidden
  popupMessage.style.display = "block"; // Show the popup message
  loadChatHistory(); // Load chat history if available
});

// Add a message to the chat box
function addMessage(text, sender) {
  const message = document.createElement('div');
  message.textContent = text;
  message.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
  chatContainer.appendChild(message);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom of the chat box
}

// Inactivity Timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer); // Clear previous timer
  inactivityTimer = setTimeout(() => {
    // Show inactivity prompt after 10 minutes of no typing
    addMessage("Would you like to clear all messages in this chat and start fresh? Yes or No.", "bot");
  }, 10 * 60 * 1000); // 10 minutes
}

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value.trim();

  // Prevent sending an empty message
  if (!userInput) {
    return; // Do nothing if the input is empty
  }

  addMessage(userInput, 'user'); // Add user input to chat
  addMessage("I'm sorry, I don't understand that question.", 'bot');
  document.getElementById('userInput').value = ''; // Clear the input field

  // Reset inactivity timer whenever a new message is added
  resetInactivityTimer();
}

// Listen for enter keypress to send message
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage(); // Process as a normal chatbot message
    // After the user presses Enter:
    openChatBox(); // Open chat box and perform the transition
  }
});

// Chatbot icon behavior
chatbotButton.addEventListener('click', function() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    openChatBox(); // Open chat
  } else {
    closeChatBox(); // Close chat
  }
});

// Function to open the chat box and animate chatbot
function openChatBox() {
  // Open chat box
  chatContainer.style.display = "flex"; // Show chat container
  chatbotButton.classList.add('open'); // Trigger the "open" animation for the icon
  chatContainer.classList.add('open'); // Trigger the opening animation for chat container
  chatbotButton.classList.add('move-to-right'); // Move the icon to the right
  chatbotButton.classList.add('shrink'); // Shrink the icon

  // After animation, finalize transition
  setTimeout(() => {
    chatbotButton.classList.remove('move-to-right');
    chatbotButton.classList.remove('shrink');
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom of the chat box
  }, 500); // Adjust this time according to the animation duration

  popupMessage.style.display = "none"; // Hide popup message when chat is open
}

// Function to close the chat box
function closeChatBox() {
  chatbotButton.classList.add('move-to-center'); // Move the icon back to the center
  chatbotButton.classList.add('grow'); // Grow the icon

  setTimeout(() => {
    chatContainer.style.display = "none"; // Hide chat container after animation
    chatbotButton.classList.remove('move-to-center');
    chatbotButton.classList.remove('grow');
  }, 500); // Adjust this time according to the animation duration

  popupMessage.style.display = "block"; // Show the popup when chat is closed
  setTimeout(() => {
    popupMessage.style.display = "none"; // Hide the popup message after random time
  }, Math.random() * (10000 - 7000) + 7000); // Popup disappears after random time
}

// Load chat history
function loadChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  chatHistory.forEach(msg => addMessage(msg.text, msg.sender));
}

// Save chat history to localStorage
function saveChatHistory() {
  const chatMessages = Array.from(chatContainer.children).map(el => ({
    text: el.textContent,
    sender: el.classList.contains('user-message') ? 'user' : 'bot',
    timestamp: Date.now() // Add a timestamp when the message is saved
  }));
  localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
}
