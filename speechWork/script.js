document.addEventListener('DOMContentLoaded', () => {
  // Check if browser supports speech recognition
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('startBtn').disabled = true;
    return;
  }
  
  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Get DOM elements
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const speakBtn = document.getElementById('speakBtn');  // New button for TTS
  const status = document.getElementById('status');
  const resultText = document.getElementById('result');
  const languageSelect = document.getElementById('language');
  
  // Configure recognition
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = languageSelect.value;
  
  // Variables
  let isRecording = false;
  
  // Event listeners
  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  clearBtn.addEventListener('click', clearText);
  copyBtn.addEventListener('click', copyText);
  speakBtn.addEventListener('click', speakText);
  languageSelect.addEventListener('change', changeLanguage);
  
  // Functions
  function startRecording() {
    resultText.focus();
    recognition.start();
    isRecording = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    status.textContent = 'Listening...';
  }
  
  function stopRecording() {
    recognition.stop();
    isRecording = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    status.textContent = 'Recording stopped';
  }
  
  function clearText() {
    resultText.value = '';
    status.textContent = 'Text cleared';
  }
  
  function copyText() {
    resultText.select();
    document.execCommand('copy');
    status.textContent = 'Text copied to clipboard';
  }
  
  function changeLanguage() {
    recognition.lang = languageSelect.value;
    status.textContent = `Language changed to ${languageSelect.options[languageSelect.selectedIndex].text}`;
    if (isRecording) {
      stopRecording();
      startRecording();
    }
  }
  
  function speakText() {
	const text = resultText.value.trim();
    if (text !== '') {
      // Create a new SpeechSynthesisUtterance instance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optionally, set properties like voice, rate, and pitch here:
      // utterance.voice = speechSynthesis.getVoices()[0];  // Select the first voice
      // utterance.rate = 1;  // Speed of speech (1 is normal speed)
      // utterance.pitch = 1; // Pitch of voice (1 is normal pitch)

      // Speak the text
      speechSynthesis.speak(utterance);
      status.textContent = 'Speaking...';
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
