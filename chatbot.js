const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
const chatbotButton = document.getElementById('chatbotButton'); // Fix for missing chatbotButton

let faqData = [];
let fuzzySet = null;
let categories = [];
let popupTimeout;
let popupInterval;
let isChatInitialized = false;
let inactivityTimer;
let isInactivityPromptShown = false;
let isPromptDisplayed = false;

// Disable category buttons (keeping them in code for future use)
function disableCategoryButtons() {
  const buttons = document.querySelectorAll('.category-button');
  buttons.forEach(button => {
    button.disabled = true;
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.5';
  });
}

// Ensure chat is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
  chatContainer.style.display = "none";
  popupMessage.style.display = "block";
  disableCategoryButtons();
  loadChatHistory();
});

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = "flex";
    chatbotButton.classList.add('open');
    chatbotButton.classList.remove('close');
    chatContainer.classList.add('open');

    setTimeout(() => {
      chatbotButton.classList.remove('open');
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);

    popupMessage.style.display = "none";
  } else {
    chatbotButton.classList.add('close');
    chatbotButton.classList.remove('open');
    chatContainer.classList.remove('open');

    setTimeout(() => {
      chatContainer.style.display = "none";
      chatbotButton.classList.remove('close');
    }, 500);

    popupMessage.style.display = "block";
    setTimeout(() => {
      popupMessage.style.display = "none";
    }, Math.random() * (10000 - 7000) + 7000);
  }
}

// Check if chat container is empty
function isChatContainerEmpty() {
  return chatBox.children.length === 0;
}

// Show initial bot greeting if empty
function displayGreetingIfEmpty() {
  if (!isChatInitialized && isChatContainerEmpty()) {
    addMessage("What can I help you with?", "bot");
    isChatInitialized = true;
  }
}

// Add a message to the chat box
function addMessage(text, sender) {
  const message = document.createElement('div');
  message.textContent = text;
  message.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (!isChatInitialized) {
    displayGreetingIfEmpty();
  }

  resetInactivityTimer();
}

// Inactivity Timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (!isInactivityPromptShown) {
      addMessage("Would you like to clear all messages in this chat and start fresh? Yes or No.", "bot");
      isInactivityPromptShown = true;
    }
  }, 10 * 60 * 1000); // 10 minutes
}

// Normalize text for better matching
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")  
    .replace(/\s+/g, " ")       
    .trim();
}

let isProcessingMessage = false; // Flag to prevent duplicate message submissions

// Handle user input and bot response
function sendMessage() {
  if (isProcessingMessage) return; // If a message is already being processed, don't send another one
  isProcessingMessage = true; // Mark the start of message processing
  
  const userInput = document.getElementById('userInput').value.trim();

  // Prevent sending an empty message
  if (!userInput) {
    isProcessingMessage = false; // Reset flag
    return; // Do nothing if the input is empty
  }

  if (userInput.length > 200) {
    addMessage("Your question is too long. Please keep it under 200 characters.", 'bot');
    isProcessingMessage = false; // Reset flag if input is too long
    return;
  }

  isPromptDisplayed = false;
  addMessage(userInput, 'user'); // Display user message

  // Make sure the fetch request is correctly structured
  fetch('https://info-g8u3bln54-valdrick97s-projects.vercel.app/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userInput }),
  })
  .then(response => response.json())
  .then(data => {
    let response = data.response || "I'm sorry, I don't understand that question.";
    addMessage(response, 'bot');
  })
  .catch(error => {
    console.error('Error:', error);
    addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
  })
  .finally(() => {
    isProcessingMessage = false; // Reset the flag after processing is complete
    document.getElementById('userInput').value = ''; // Clear input field
  });
}

// Unified keypress listener for Enter key
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const userInput = this.value.trim();

    // Handle inactivity prompt response
    if (isInactivityPromptShown && (userInput.toLowerCase() === 'yes' || userInput.toLowerCase() === 'no')) {
      handleInactivityResponse(userInput);
    } else {
      sendMessage();
    }
  }
});


// Save chat history to localStorage with a timestamp
function saveChatHistory() {
  const chatMessages = Array.from(chatBox.children).map(el => ({
    text: el.textContent,
    sender: el.classList.contains('user-message') ? 'user' : 'bot',
    timestamp: Date.now()
  }));
  localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
}

// Load chat history and filter expired messages
function loadChatHistory() {
  const EXPIRATION_TIME = 24 * 60 * 60 * 1000;
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  
  const validChatHistory = chatHistory.filter(msg => Date.now() - msg.timestamp < EXPIRATION_TIME);

  validChatHistory.forEach(msg => addMessage(msg.text, msg.sender));
  
  localStorage.setItem('chatHistory', JSON.stringify(validChatHistory));
}

// Clear chat history
function clearChatHistory() {
  chatBox.innerHTML = '';
  saveChatHistory();
  isInactivityPromptShown = false;
}

// Handle user response to inactivity prompt
function handleInactivityResponse(response) {
  if (response.toLowerCase() === 'yes') {
    clearChatHistory();
    addMessage("The chat has been cleared and will start fresh.", "bot");
  } else {
    addMessage("Alright, continuing from where we left off.", "bot");
  }
}

// Fetch FAQ data and categories
fetch('faqData.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load FAQ data');
    return response.json();
  })
  .then(data => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map(faq => normalize(faq.question)));
  })
  .catch(error => {
    console.error('Error loading FAQ data:', error);
    addMessage("Sorry, I'm having trouble loading my knowledge base. Please try again later.", 'bot');
  });
