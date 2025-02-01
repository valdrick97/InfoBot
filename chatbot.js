const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
let faqData = [];
let fuzzySet = null;  // Fuzzy set is initially null
let categories = [];
let popupTimeout;
let popupInterval;
let isChatInitialized = false;
let inactivityTimer;
let isInactivityPromptShown = false;
let isPromptDisplayed = false;

// Disable category buttons
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
  loadChatHistory();  // Load chat history if available
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

// Show the initial bot greeting if the chat is empty
function displayGreetingIfEmpty() {
  if (!isChatInitialized && isChatContainerEmpty()) {
    addMessage("What can I help you with?", "bot");
    isChatInitialized = true;
  }
}

// Check if the chat container is empty
function isChatContainerEmpty() {
  return chatBox.children.length === 0;
}

// Inactivity Timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (!isInactivityPromptShown) {
      addMessage("Would you like to clear all messages in this chat and start fresh? Yes or No.", "bot");
      isInactivityPromptShown = true;
    }
  }, 10 * 60 * 1000);  // 10 minutes
}

// Handle user input and bot response
function sendMessage() {
  const userInput = document.getElementById('userInput').value.trim();

  if (!userInput) {
    return;
  }

  if (userInput.length > 200) {
    addMessage("Your question is too long. Please keep it under 200 characters.", 'bot');
    return;
  }

  addMessage(userInput, 'user');

  // Check if fuzzySet has been initialized
  if (fuzzySet) {
    let bestMatch = fuzzySet.get(userInput);
    let response = "I'm sorry, I don't understand that question.";

    if (bestMatch && bestMatch.length > 0 && bestMatch[0][0] > 0.7) {
      let faq = faqData.find(f => normalize(f.question) === bestMatch[0][1]);
      response = faq ? faq.answer : "I couldn't find a matching answer. Can you rephrase your question?";
    } else {
      response = "I couldn't find a matching answer. Can you rephrase your question?";
    }

    addMessage(response, 'bot');
  } else {
    addMessage("Sorry, the system is not ready yet. Please try again later.", 'bot');
  }

  document.getElementById('userInput').value = '';
}

// Normalize function for matching questions
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Submit user input to Google Form
function submitToGoogleForm(userInput) {
  const [employeeId, confirmationNumber] = userInput.split(' ');

  const formData = new FormData();
  formData.append('entry.571940493', employeeId);  // Employee ID field
  formData.append('entry.1140129675', confirmationNumber);  // Confirmation Number field

  fetch('https://docs.google.com/forms/d/e/1FAIpQLScE3LWodAQxUn739QNBsDGMaOPa7uQQI7JsDcsbqLVRbpgZ6g/formResponse', {
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

// Listen for "Enter" key to send message
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const userInput = this.value.trim();
    
    // Check if the input matches "EmployeeID 12345" format
    if (/^\S+\s+\d{5}$/.test(userInput)) {
      submitToGoogleForm(userInput);  // Submit form if input is valid
      this.value = "";  // Clear input field
    } else {
      sendMessage();  // Otherwise, process as a normal chatbot message
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
    fuzzySet = new FuzzySet(faqData.map(f => f.question));  // Initialize fuzzySet with FAQ questions
  })
  .catch(error => {
    console.error('Error loading FAQ data:', error);
    addMessage("Sorry, I'm having trouble loading my knowledge base. Please try again later.", 'bot');
  });
