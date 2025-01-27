const chatBox = document.getElementById('chatBox');
const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const categoryContainer = document.getElementById('categoryContainer');
let faqData = [];
let fuzzySet = null;
let categories = [];

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
  const message = document.createElement('div');
  message.className = `message ${sender}-message`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatBox.addEventListener('scroll', function() {
  const isScrolledToBottom = chatBox.scrollHeight - chatBox.scrollTop === chatBox.clientHeight;
  if (isScrolledToBottom) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

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

// Toggle chat visibility
if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = 'block';
    addMessage('What can I help you with?', 'bot'); // Correct prompt when chat opens
    popupMessage.style.display = "none"; // Hide popup message when chat is open
  } else {
    chatContainer.style.display = "none";
    popupMessage.style.display = "block"; // Show the popup when chat is closed
  }
}

// Load categories
function loadCategories() {
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category.name;
    button.onclick = () => showQuestions(category);
    categoryContainer.appendChild(button);
  });
}

// Show questions for selected category
function showQuestions(category) {
  // Clear previous messages
  chatBox.innerHTML = ''; // Clear the chat box before showing new message
  
  // Show the "What can I help you find in [Category]" message
  addMessage(`What can I help you find in ${category.name}?`, 'bot');

  // Highlight the selected category button
  document.querySelectorAll('.category-button').forEach(button => {
    if (button.textContent === category.name) {
      button.classList.add('selected'); // Add 'selected' class for styling
    } else {
      button.classList.remove('selected');
    }
  });

  // Display category-related questions
  const categoryQuestions = category.questions;
  categoryQuestions.forEach(question => {
    addMessage(question, 'bot');
  });
}
