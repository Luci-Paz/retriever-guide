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

                    // Render Markdown in the bot's response
                    const botMessage = document.createElement('div');
                    botMessage.classList.add('bot-message');
                    botMessage.innerHTML = renderMarkdown(response); // Parse Markdown
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

const API_KEY = 'AIzaSyBwLho0PLjPM7r9ugbjPpHqUGohNKMAgJs'; // Replace with your actual API key. DO NOT SHARE OR REVEAL IN PUBLCI CODE!
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function getGeminiResponse(message) {
    const conciseMessage = `You are a helpful assistant that answers the user's input as an advisor for the University of Maryland, Baltimore County, located at 1000 Hilltop Circle, Catonsville, Maryland, 21250, United States. Ensure your responses are appropriate to UMBC.: ${message}`;
    const data = {
        contents: [{
            parts: [{ text: conciseMessage }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text found.';
        return responseText;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return 'Error: Could not get response from chatbot. Please try again later.';
    }
}

// Function to render Markdown
function renderMarkdown(text) {
    return marked.parse(text);
}