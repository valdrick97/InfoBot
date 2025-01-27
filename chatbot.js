const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
let faqData = [];
let fuzzySet = null;
let categories = [];

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = 'block';
    addMessage('What can I help you with?', 'bot'); // Correct prompt when chat opens
    popupMessage.style.display = "none"; // Hide popup message when chat is open
  } else {
    chatContainer.style.display = "none";
    popupMessage.style.display = "block"; // Show the popup when chat is closed
  }
}

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
  // Dim all existing messages
  const messages = document.querySelectorAll('.message');
  messages.forEach(message => message.classList.add('dim'));
  
  // Create new message
  const newMessage = document.createElement('div');
  newMessage.className = `message ${sender}-message`;
  newMessage.textContent = text;
  chatBox.appendChild(newMessage);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Load categories and display buttons
function loadCategories() {
  const categoryContainer = document.getElementById('categoryContainer');
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category.name;
    button.onclick = () => selectCategory(category.name);
    categoryContainer.appendChild(button);
  });
}

// Show prompt for selected category (without displaying questions)
function showQuestions(category) {
  const selectedButton = document.querySelector(`.category-button.selected`);

  // If a category button is already selected, we will toggle it off
  if (selectedButton && selectedButton.textContent === category.name) {
    // Deselect the button
    selectedButton.classList.remove('selected');
    chatBox.innerHTML = ''; // Clear the chat box
    addMessage('What can I help you with?', 'bot'); // Reset prompt
  } else {
    // If it's not selected, select the button and show the prompt
    document.querySelectorAll('.category-button').forEach(button => {
      button.classList.remove('selected');
    });
    const button = document.querySelector(`.category-button[textContent="${category.name}"]`);
    button.classList.add('selected'); // Select the clicked button

    // Show the prompt for the selected category
    chatBox.innerHTML = ''; // Clear previous messages
    addMessage(`What can I help you find in ${category.name}?`, 'bot');
  }
}


  // Display category-related questions
  const categoryQuestions = category.questions;
  categoryQuestions.forEach(question => {
    addMessage(question, 'bot');
  });
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
