document.addEventListener('DOMContentLoaded', function() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatInterface = document.getElementById('chat-interface');
    const startChatButton = document.getElementById('start-chat');
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');

    startChatButton.addEventListener('click', function() {
        welcomeScreen.style.display = 'none';
        chatInterface.style.display = 'block';
    });

    clearChatButton.addEventListener('click', function() {
        chatWindow.innerHTML = '';
    });

    sendButton.addEventListener('click', function() {
        const message = userInput.value;
        if (message.trim() !== '') {
            // Display user message
            const userMessage = document.createElement('div');
            userMessage.classList.add('user-message');
            userMessage.textContent = message;
            chatWindow.appendChild(userMessage);

            // Display loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.classList.add('bot-message', 'loading');
            loadingIndicator.textContent = 'Loading...';
            chatWindow.appendChild(loadingIndicator);
            chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom

            // Send message to Gemini chatbot and display response
            getGeminiResponse(message)
                .then(response => {
                    // Remove loading indicator
                    loadingIndicator.remove();

                    const botMessage = document.createElement('div');
                    botMessage.classList.add('bot-message');
                    botMessage.textContent = response;
                    chatWindow.appendChild(botMessage);
                    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom
                })
                .catch(error => {
                    // Remove loading indicator
                    loadingIndicator.remove();

                    const errorMessage = document.createElement('div');
                    errorMessage.classList.add('bot-message', 'error');
                    errorMessage.textContent = 'Error: Could not get response from chatbot.';
                    chatWindow.appendChild(errorMessage);
                    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom
                });

            userInput.value = '';
        }
    });

    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
});

async function getGeminiResponse(message) {
    // Placeholder function for Gemini chatbot API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`Placeholder response from Gemini: ${message}`);
        }, 1000);
    });
}