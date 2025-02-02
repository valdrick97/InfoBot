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
let inactivityTimer;  // Timer for inactivity
let isInactivityPromptShown = false; // Flag to prevent repeated inactivity prompts
let isPromptDisplayed = false; // Flag to track if the prompt is shown

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
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
}, 500); // Adjust this time according to the animation duration

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

// Function to check if the chat container is empty
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
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
  
  // Only show the greeting message if it hasn't been shown before
  if (!isChatInitialized) {
    displayGreetingIfEmpty(); // Show greeting only if it hasn't been shown
  }

  // Reset inactivity timer whenever a new message is added
  resetInactivityTimer();
}

// Example: Adding a user message
//addMessage("Hello, I need help with my account.", "user"); // User message

// Inactivity Timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer); // Clear previous timer
  inactivityTimer = setTimeout(() => {
    // Show inactivity prompt after 10 minutes of no typing
    if (!isInactivityPromptShown) {
      addMessage("Would you like to clear all messages in this chat and start fresh? Yes or No.", "bot");
      isInactivityPromptShown = true;
    }
  }, 10 * 60 * 1000); // 10 minutes
}

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value.trim();

  // Prevent sending an empty message
  if (!userInput) {
    return; // Do nothing if the input is empty
  }

  if (userInput.length > 200) {
    addMessage("Your question is too long. Please keep it under 200 characters.", 'bot');
    return;
  }

  // Check if the input matches "EmployeeID ConfirmationNumber" format
  if (/^\d{5}\s+[A-Za-z0-9]+$/.test(userInput)) {
    submitToGoogleForm(userInput); // If valid, submit the form and skip FAQ matching
    document.getElementById('userInput').value = ''; // Clear the input field after submission
    return; // Exit to avoid FAQ logic being processed
  }

  // Process FAQ matching logic if the input isn't in the correct format
  let bestMatch = fuzzySet.get(userInput);
  let response = "I'm sorry, I don't understand that question.";

  if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.7) {
    let faq = faqData.find(f => normalize(f.question) === bestMatch[0][1]); // Directly using bestMatch[0][1]
    response = faq ? faq.answer : "I couldn't find a matching answer. Can you rephrase your question?";
  } else {
    response = "I couldn't find a matching answer. Can you rephrase your question?";
  }

  addMessage(response, 'bot');
  document.getElementById('userInput').value = ''; // Clear the input field
}


  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]|_/g, "")  // Remove punctuation
      .replace(/\s+/g, " ")       // Replace multiple spaces with a single space
      .trim();
  }

// Send message when user presses enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const userInput = this.value.trim();
    if (/^\d{5}\s+\S+$/.test(userInput)) {  // Match format: "EmployeeID 12345"
      submitToGoogleForm(userInput); // Submit form data
      this.value = ""; // Clear input after submission
      // No need to add user input again in the chat
    } else {
      sendMessage(); // Otherwise, process as a normal chatbot message
    }
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

// Clear chat history based on user response to inactivity prompt
function clearChatHistory() {
  chatBox.innerHTML = ''; // Clear chat box
  saveChatHistory(); // Save cleared history
  isInactivityPromptShown = false; // Reset inactivity prompt flag
}

// Handle user response to inactivity prompt (yes or no)
function handleInactivityResponse(response) {
  if (response.toLowerCase() === 'yes') {
    clearChatHistory();
    addMessage("The chat has been cleared and will start fresh.", "bot");
  } else {
    addMessage("Alright, continuing from where we left off.", "bot");
  }
}

// Listen for yes/no responses to the inactivity prompt
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const userInput = document.getElementById('userInput').value.trim();
    if (isInactivityPromptShown && (userInput.toLowerCase() === 'yes' || userInput.toLowerCase() === 'no')) {
      handleInactivityResponse(userInput);
    }
  }
});

// Fetch FAQ data and categories
fetch('faqData.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load FAQ data');
    return response.json();
  })
  .then(data => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map(faq => faq.question));
    fuzzySet = FuzzySet(faqData.map(faq => normalize(faq.question)));
  })
  .catch(error => {
    console.error('Error loading FAQ data:', error);
    addMessage("Sorry, I'm having trouble loading my knowledge base. Please try again later.", 'bot');
  });

function submitToGoogleForm(userInput) {
  const [employeeId, confirmationNumber] = userInput.split(' ');

  const formData = new FormData();
  formData.append('entry.571940493', employeeId); // Employee ID field
  formData.append('entry.1140129675', confirmationNumber); // Confirmation Number field

  addMessage("Submitting your information...", "bot");

  // Submit data to Google Apps Script URL
  fetch('https://script.google.com/macros/s/AKfycbxsnSc0PB7KviFfryDQMl0DBj8iEHe6-rgnbH0l8ZdZ2-OU952nhVn6QvIVpmCPb-YE/exec', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (response.ok) {
      addMessage(`Your information has been successfully submitted! Employee ID: ${employeeId}, Confirmation Number: ${confirmationNumber}`, "bot");
    } else {
      addMessage("There was an issue submitting your information. Please try again.", "bot");
    }
  })
  .catch(error => {
    console.error('Network error:', error);
    addMessage("There was an error submitting your information. Please try again later.", "bot");
  });
}
