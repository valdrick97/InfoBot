const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
const categoryContainer = document.getElementById('categoryContainer');
let faqData = [];
let fuzzySet = null;
let categories = [];
let popupTimeout;
let isChatInitialized = false;

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = "block";
    addMessage('What can I help you with?', 'bot'); // Correct prompt when chat opens
    popupMessage.style.display = "none"; // Hide popup message when chat is open
    categoryContainer.style.display = "flex"; // Show categories only when chat is open

    if (!isChatInitialized) {
      addMessage("What can I help you with?", "bot"); // Send bot greeting only once
      isChatInitialized = true;
    }
  } else {
    chatContainer.style.display = "none";
    popupMessage.style.display = "block"; // Show the popup when chat is closed
    categoryContainer.style.display = "none"; // Hide categories when chat is closed
    setTimeout(() => {
      popupMessage.style.display = "none";
    }, Math.random() * (10000 - 7000) + 7000); // Popup disappears after random time between 7s and 10s
  }
}

// Add Message Function
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.className = sender === "bot" ? "bot-message" : "user-message";
  messageElement.innerText = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Load Categories
function loadCategories() {
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.innerText = category.name;
    button.onclick = () => alert(`Category: ${category.name}`);
    categoryContainer.appendChild(button);
  });
}

// Popup Timer
function startPopupTimer() {
  setInterval(() => {
    if (chatContainer.style.display === "none") {
      popupMessage.style.display = "block";
      setTimeout(() => {
        popupMessage.style.display = "none";
      }, Math.random() * (10000 - 7000) + 7000); // Hide after random time between 7-10s
    }
  }, Math.random() * (40000 - 30000) + 30000); // Popup every 30-40 seconds
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories(); // Load category buttons on page load
  startPopupTimer(); // Start the popup message timer
});
