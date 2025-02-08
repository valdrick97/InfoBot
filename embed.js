(function() {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-embed';
    chatbotContainer.innerHTML = `
        <iframe src="https://yourusername.github.io/InfoBot/" 
                width="400" height="600" 
                style="border:none; position:fixed; bottom:20px; right:20px; z-index:1000;">
        </iframe>
    `;
    document.body.appendChild(chatbotContainer);
})();
