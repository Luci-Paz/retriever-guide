
document.addEventListener('DOMContentLoaded', () => {
  // Check if browser supports speech recognition
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('record-button').disabled = true;
    return;
  }
  
  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Get DOM elements
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatInterface = document.getElementById('chat-interface');
  const chatWindow = document.getElementById('chat-window');
  const startChatButton = document.getElementById('start-chat');
  const resultText = document.getElementById('result');
  const recordButton = document.getElementById('record-button');
  const sendButton = document.getElementById('send-button');
  const clearChatButton = document.getElementById('clear-chat');
  const languageSelect = document.getElementById('language');
  
  // Configure recognition
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = languageSelect.value;
  
  // Variables
  let isRecording = false;
  
  // Event listeners
  
  startChatButton.addEventListener('click', startChat);
  recordButton.addEventListener('click', recording);
  clearChatButton.addEventListener('click', clearChat);
  sendButton.addEventListener('click', sendText);
  languageSelect.addEventListener('change', changeLanguage);
  
  // Functions
  function startChat() {
	  welcomeScreen.style.display = 'none';
	  chatInterface.style.display = 'block';
  } //end startChat()
  
  
  function recording() {
	  // If recording, change button display and get user input
	  if (!isRecording) {
		  recordButton.textContent = 'recording... click again to end';
		  resultText.focus();
		  recognition.start();
		  isRecording = true;
	  } 
	  // else, change button display and stop getting user input
	  else {
		  recordButton.textContent = 'Ask Question';
		  recognition.stop();
		  isRecording = false;
	  } //end if-else
  } //end recording()
  
  
  function clearText() {
    resultText.value = '';
  } //end clearText()
  
  
  function clearChat() {
        chatWindow.innerHTML = '';
		clearText();
  } //end clearChat()
  
  
  function changeLanguage() {
    recognition.lang = languageSelect.value;
    status.textContent = `Language changed to ${languageSelect.options[languageSelect.selectedIndex].text}`;
    if (isRecording) {
      stopRecording();
      startRecording();
    } //end if
  } //end changeLanguage()

  
  function sendText() {
	  const message = result.value;
	  clearText();
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
					
					getGeminiResponseSummary(response)
						.then(summary => {
							speakText(summary);
						})
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
				
				

            result.value = '';
        }
   } //end sendText();
   

  function speakText(message) {
	const text = message.trim();
    if (text !== '') {
      // Create a new SpeechSynthesisUtterance instance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optionally, set properties like voice, rate, and pitch here:
      utterance.voice = speechSynthesis.getVoices()[0];  // Select the first voice
      utterance.rate = 1.5;  // Speed of speech (1 is normal speed)
      utterance.pitch = 1.2; // Pitch of voice (1 is normal pitch)

      // Speak the text
      speechSynthesis.speak(utterance);
	  
    } else {
      status.textContent = 'No text to speak.';
    }
  }
  
  // Recognition events
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      resultText.value += finalTranscript;
    }
  };
  
  recognition.onerror = (event) => {
    status.textContent = `Error: ${event.error}`;
    stopRecording();
  };
  
  recognition.onend = () => {
    if (isRecording) {
      recognition.start();
      status.textContent = 'Restarted listening...';
    }
  };
});

const API_KEY = 'AIzaSyBwLho0PLjPM7r9ugbjPpHqUGohNKMAgJs'; // Replace with your actual API key. DO NOT SHARE OR REVEAL IN PUBLCI CODE!
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;


async function getGeminiResponse(message) {
    const conciseMessage = `You are a helpful assistant that answers the user's input as an advisor for the University of Maryland, Baltimore County, located at 1000 Hilltop Circle, Catonsville, Maryland, 21250, United States. 
    You will be addressed as Grit in the user promt and your response should imitate a counseling conversation and should provide useful insight. Also ensure that your responses are concise, appropriate to UMBC, 
    and asks the user if they need more information. Generate a list of relevant and accurate URLs at the end of your response. Lastly before presenting your message double check your output and validate that it's correct: ${message}`;
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


async function getGeminiResponseSummary(message) {
		const consiceMessage = `You are a helpful assistant that summarizes inputs in the tone of an advisor for the University of Maryland, Baltimore County. You will give a brief response and avoid 
		saying the urls of websites and any markdown markings such as asterisks or heading signs. Please include the main and relevant information in your responses: ${message}`;
		const data = {
			contents: [{
				parts: [{ text: consiceMessage }]
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