const chatContainer = document.getElementById('chatContainer');
const popupMessage = document.getElementById('popupMessage');
const chatBox = document.getElementById('chatBox');
// const categoryContainer = document.getElementById('categoryContainer');
let faqData = [];
let fuzzySet = null;
let categories = [];
let popupTimeout;
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
});

// Toggle chat visibility
function toggleChat() {
  if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
    chatContainer.style.display = "block";
    popupMessage.style.display = "none"; // Hide popup message when chat is open

    if (!isChatInitialized) {
      addMessage("What can I help you with?", "bot"); // Send bot greeting only once
      isChatInitialized = true;
    }
  } else {
    chatContainer.style.display = "none";
    popupMessage.style.display = "block"; // Show the popup when chat is closed
    setTimeout(() => {
      popupMessage.style.display = "none";
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

function startPopupTimer() {
  setInterval(() => {
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
  .then(response => response.json())
  .then(data => {
    faqData = data.faqs;
    fuzzySet = FuzzySet(faqData.map(faq => faq.question));
  })
  .catch(error => console.error('Error loading FAQ data:', error));

//fetch('categories.json')
  //.then(response => response.json())
  //.then(data => {
  //categories = data.categories;
    //loadCategories();
  //})
  //.catch(error => console.error('Error loading categories:', error));

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

// Send message when user presses enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
