const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
let faqData = [];
let fuzzySet = null;
let categories = [];
let popupTimeout;

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = "block";
    addMessage('What can I help you with?', 'bot'); // Correct prompt when chat opens
    popupMessage.style.display = "none"; // Hide popup message when chat is open
    categoryContainer.style.display = "block";
  } else {
    chatContainer.style.display = "none";
    popupMessage.style.display = "block"; // Show the popup when chat is closed
    categoryContainer.style.display = "none";
    setTimeout(() => {
      popupMessage.style.display = "none";
    }, Math.random() * (10000 - 7000) + 7000); // Popup disappears after random time between 7s and 10s
  }
}

function startPopupTimer() {
  setInterval(() => {
    showPopup();
  }, Math.random() * (40000 - 30000) + 30000); // Popup appears after random time between 30s and 40s
}

startPopupTimer(); // Correct function call

// Load FAQ data and categories
fetch('faqData.json')
  .then(response => response.json())
  .then(data => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map(faq => faq.question));
  })
  .catch(error => console.error('Error loading FAQ data:', error));

fetch('categories.json')
  .then(response => response.json())
  .then(data => {
    categories = data.categories;
    loadCategories();
  })
  .catch(error => console.error('Error loading categories:', error));

// Add message to chatbox
function addMessage(text, sender) {
  // Dim only previous messages of the same type (bot or user)
  const otherSender = sender === 'user' ? 'bot' : 'user';
  const messages = document.querySelectorAll(`.${otherSender}-message`);
  
  messages.forEach(message => message.classList.add('dim'));
  
  // Create new message
  const message = document.createElement('div');
  message.className = `message ${sender}-message`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Load categories and display buttons
function loadCategories() {
  const categoryContainer = document.getElementById('categoryContainer');
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category.name;
    button.onclick = () => toggleCategory(category);
    categoryContainer.appendChild(button);
  });
}

// Toggle category selection
function toggleCategory(category) {
  const selectedButton = document.querySelector(`.category-button.selected`);
  
  if (selectedButton && selectedButton.textContent === category.name) {
    // Deselect if the same category is clicked
    selectedButton.classList.remove('selected');
    chatBox.innerHTML = ''; // Clear chat box
    addMessage('What can I help you with?', 'bot');
  } else {
    // Deselect any previously selected category
    document.querySelectorAll('.category-button').forEach(button => button.classList.remove('selected'));
    const button = Array.from(document.querySelectorAll('.category-button')).find(btn => btn.textContent === category.name);
    button.classList.add('selected'); // Select clicked button

    // Show the prompt for the selected category
    chatBox.innerHTML = ''; // Clear previous messages
    addMessage(`What can I help you find in ${category.name}?`, 'bot');
  }
}

// Send message when user presses enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput.trim()) return;

  addMessage(userInput, 'user');
  let bestMatch = fuzzySet.get(userInput);
  let response = "I'm sorry, I don't understand that question.";

  if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.5) {
    let matchedQuestion = bestMatch[0][1];
    let faq = faqData.find(f => f.question === matchedQuestion);
    response = faq ? faq.answer : response;
  }

  addMessage(response, 'bot');
  document.getElementById('userInput').value = '';
}

// Ensure chat is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
  chatContainer.style.display = "none"; // Ensure chat is hidden
  popupMessage.style.display = "block"; // Show the popup message
});
