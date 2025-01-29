const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
// const categoryContainer = document.getElementById('categoryContainer');
let faqData = [];
let fuzzySet = null;
let categories = [];
let popupTimeout;
let popupInterval;
let isChatInitialized = false;

// Disable category buttons (keeping them in code for future use)
function disableCategoryButtons() {
  const buttons = document.querySelectorAll('.category-button');
  buttons.forEach(button => {
    button.disabled = true; // Disable the buttons
    button.style.pointerEvents = 'none'; // Prevent interaction (optional, but good for visual clarity)
    button.style.opacity = '0.5'; // Make the buttons look disabled (optional)
  });
}

// Ensure chat is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
  chatContainer.style.display = "none"; // Ensure chat is hidden
  popupMessage.style.display = "block"; // Show the popup message
  disableCategoryButtons(); // Disable the category buttons on page load
  loadChatHistory(); // Load chat history if available
});

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    // Open chat
    chatContainer.style.display = "flex"; // Show chat container
    chatbotButton.classList.add('open'); // Trigger the "open" animation for the icon
    chatbotButton.classList.remove('close'); // Remove "close" animation if chat is opening
    chatContainer.classList.add('open'); // Trigger the opening animation for chat container

    // Hide the icon after the animation
    setTimeout(() => {
      chatbotButton.classList.remove('open');
    }, 500); // Adjust this time according to the animation duration

function isChatContainerEmpty() {
  return chatBox.children.length === 0;
}

// Show the initial bot greeting only once, and only if the chat container is empty
function displayGreetingIfEmpty() {
  if (!isChatInitialized && isChatContainerEmpty()) {
    addMessage("What can I help you with?", "bot");
    isChatInitialized = true;  // Prevent this greeting from showing again
  }
}

// Add a message to the chat box
function addMessage(text, sender) {
  const message = document.createElement('div');
  message.textContent = text;
  message.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
  chatBox.appendChild(message);

  // Only show the greeting message once if the chat is empty initially
  if (!isChatInitialized) {
    displayGreetingIfEmpty(); // Show greeting only if it hasn't been shown
  }
}

// Example: Adding a user message
addMessage("Hello, I need help with my account.", "user"); // User message


    popupMessage.style.display = "none"; // Hide popup message when chat is open
  } else {
    // Close chat
    chatbotButton.classList.add('close'); // Trigger the "close" animation for the icon
    chatbotButton.classList.remove('open'); // Remove "open" animation if chat is closing
    chatContainer.classList.remove('open'); // Close the chat container

    // Hide chat container after the animation
    setTimeout(() => {
      chatContainer.style.display = "none"; // Hide chat container after animation
      chatbotButton.classList.remove('close'); // Remove "close" animation after it's finished
    }, 500); // Adjust this time according to the animation duration

    popupMessage.style.display = "block"; // Show the popup when chat is closed
    setTimeout(() => {
      popupMessage.style.display = "none"; // Hide the popup message after random time
    }, Math.random() * (10000 - 7000) + 7000); // Popup disappears after random time
  }
}

// Add Message Function
function addMessage(text, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = `${sender}-message`;
  messageElement.textContent = text;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
  saveChatHistory(); // Save chat history after each message
}

// Show popup message
function showPopup() {
  if (chatContainer.style.display === "none") {
    popupMessage.style.display = "block";
    setTimeout(() => {
      popupMessage.style.display = "none";
    }, Math.random() * (10000 - 7000) + 7000); // Popup visible for 7-10 seconds
  }
}

// Start popup timer with debouncing
function startPopupTimer() {
  clearInterval(popupInterval); // Clear existing interval
  popupInterval = setInterval(() => {
    showPopup();
  }, Math.random() * (40000 - 30000) + 30000); // Popup every 30-40 seconds
}

startPopupTimer(); // Start popup timer

// Load categories and display buttons (this part will stay for future use)
//function loadCategories() {
  //categoryContainer.innerHTML = ''; // Clear any existing buttons
  //categories.forEach(category => {
    //const button = document.createElement('button');
    //button.className = 'category-button';
    //button.textContent = category.name;
    //button.onclick = () => toggleCategory(category);
    //categoryContainer.appendChild(button);
  //});
//}

// Toggle category selection
//function toggleCategory(category) {
  //const selectedButton = document.querySelector(`.category-button.selected`);
  
  //if (selectedButton && selectedButton.textContent === category.name) {
    // Deselect if the same category is clicked
    //selectedButton.classList.remove('selected');
    //chatBox.innerHTML = ''; // Clear chat box
    //addMessage('What can I help you with?', 'bot');
 // } else {
   // // Deselect any previously selected category
   // document.querySelectorAll('.category-button').forEach(button => button.classList.remove('selected'));
   // const button = Array.from(document.querySelectorAll('.category-button')).find(btn => btn.textContent === category.name);
   // button.classList.add('selected'); // Select clicked button

    // Show the prompt for the selected category
    //chatBox.innerHTML = ''; // Clear previous messages
   // addMessage(`What can I help you find in ${category.name}?`, 'bot');
  // }
// }

// Load FAQ data and categories
fetch('faqData.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load FAQ data');
    return response.json();
  })
  .then(data => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map(faq => faq.question));
  })
  .catch(error => {
    console.error('Error loading FAQ data:', error);
    addMessage("Sorry, I'm having trouble loading my knowledge base. Please try again later.", 'bot');
  });

//fetch('categories.json')
  //.then(response => response.json())
  //.then(data => {
  //categories = data.categories;
    //loadCategories();
  //})
  //.catch(error => console.error('Error loading categories:', error));

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) {
    addMessage("Please enter a question.", 'bot');
    return;
  }
  
  if (userInput.length > 200) {
    addMessage("Your question is too long. Please keep it under 200 characters.", 'bot');
    return;
  }

  addMessage(userInput, 'user');
  let bestMatch = fuzzySet.get(userInput);
  let response = "I'm sorry, I don't understand that question.";

  if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.5) {
    let matchedQuestion = bestMatch[0][1];
    let faq = faqData.find(f => f.question === matchedQuestion);
    response = faq ? faq.answer : response;
  } else {
    response = "I couldn't find a matching answer. Can you rephrase your question?";
  }

  addMessage(response, 'bot');
  document.getElementById('userInput').value = '';
}

// Send message when user presses enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Save chat history to localStorage with a timestamp
function saveChatHistory() {
  const chatMessages = Array.from(chatBox.children).map(el => ({
    text: el.textContent,
    sender: el.classList.contains('user-message') ? 'user' : 'bot',
    timestamp: Date.now() // Add a timestamp when the message is saved
  }));
  localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
}

// Load chat history from localStorage and filter out expired messages
function loadChatHistory() {
  const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // Set expiration to 24 hours (in milliseconds)
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  
  const validChatHistory = chatHistory.filter(msg => {
    // Check if the message is still within the expiration time
    return Date.now() - msg.timestamp < EXPIRATION_TIME;
  });

  // Load only valid messages
  validChatHistory.forEach(msg => addMessage(msg.text, msg.sender));
  
  // Save the filtered history back to localStorage
  localStorage.setItem('chatHistory', JSON.stringify(validChatHistory));
}

// Optional: Clear chat history after a set duration
function clearChatHistoryAfterTime() {
  const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // Set expiration to 24 hours
  setTimeout(() => {
    localStorage.removeItem('chatHistory'); // Remove chat history after the set time
  }, EXPIRATION_TIME);
}
