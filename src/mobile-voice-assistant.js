class MobileVoiceAssistant {
    constructor() {
        this.setupSpeechRecognition();
        this.setupSpeechSynthesis();
        
        this.isListening = false;
        this.setupUI();
    }

    setupSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        } else {
            console.warn('Speech recognition not supported in this browser.');
            this.recognition = null;
        }
    }

    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
        } else {
            console.warn('Speech synthesis not supported in this browser.');
            this.synth = null;
        }
    }

    setupUI() {
        this.startButton = document.getElementById('startButton');
        this.output = document.getElementById('output');
        this.textInput = document.getElementById('textInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.startButton.addEventListener('click', () => this.toggleListening());
        this.sendButton.addEventListener('click', () => this.handleTextInput());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleTextInput();
            }
        });
    }

    toggleListening() {
        if (!this.recognition) {
            this.addMessage('Speech recognition is not supported. Please use text input instead.', 'error');
            this.showTextInput();
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        this.isListening = true;
        this.startButton.querySelector('i').textContent = 'stop';
        this.startButton.classList.remove('red');
        this.startButton.classList.add('green');
        this.addMessage('Assistant: Listening...', 'assistant');
        this.recognition.start();
    }

    stopListening() {
        this.isListening = false;
        this.startButton.querySelector('i').textContent = 'mic';
        this.startButton.classList.remove('green');
        this.startButton.classList.add('red');
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    showTextInput() {
        document.getElementById('textInputContainer').style.display = 'block';
        this.startButton.style.display = 'none';
    }

    handleTextInput() {
        const text = this.textInput.value.trim();
        if (text) {
            this.addMessage(`You: ${text}`, 'user');
            this.processAndRespond(text);
            this.textInput.value = '';
        }
    }

    processCommand(text) {
        const lowerText = text.toLowerCase();
        
        // Check for "weather"
        if (lowerText.includes('weather')) {
            return "I'm sorry, I don't have access to weather information right now.";
        
        // Check for "time"
        } else if (lowerText.includes('time')) {
            return `The current time is ${new Date().toLocaleTimeString()}.`;

        } else if (lowerText.includes('lomdie')) {
            return 'Lomdie is my closest to my Dillll';
            
        
        // Check for "name"
        } else if (lowerText.includes('your name') || lowerText.includes('who are you')) {
            return "My name is Assistant. I'm here to help you with any questions or concerns you may have.";
        
        // Check for "age"
        } else if (lowerText.includes('how old are you') || lowerText.includes('your age') || lowerText.includes('what is your age')) {
            return "I am an ageless digital assistant, always here to help you!";
        
        // Default response for unknown commands
        } else {
            return "I'm not sure how to help with that. Can you try again?";
        }
    }
    

    async processAndRespond(text) {
        const response = this.processCommand(text);
        await this.speak(response);
        this.addMessage(`Assistant: ${response}`, 'assistant');
    }

    speak(text) {
        return new Promise((resolve) => {
            if (this.synth && !this.isIOS()) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = resolve;
                this.synth.speak(utterance);
            } else {
                console.warn('Speech synthesis not available');
                resolve();
            }
        });
    }

    addMessage(text, sender) {
        const messageElement = document.createElement('p');
        messageElement.textContent = text;
        messageElement.className = sender;
        this.output.appendChild(messageElement);
        this.output.scrollTop = this.output.scrollHeight;
    }

    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    init() {
        if (this.recognition) {
            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                this.addMessage(`You: ${text}`, 'user');
                this.processAndRespond(text);
                this.stopListening();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addMessage(`Error: ${event.error}`, 'error');
                this.stopListening();
                this.showTextInput();
            };
        } else {
            this.addMessage('Speech recognition is not supported in this browser. You can use text input instead.', 'error');
            this.showTextInput();
        }

        // Check for iOS
        if (this.isIOS()) {
            this.addMessage('Speech recognition may not work on iOS. You can use text input instead.', 'error');
            this.showTextInput();
        }

        // Check for Android
        if (this.isAndroid()) {
            this.addMessage('Tap the microphone icon and grant permission to use speech recognition.', 'assistant');
        }
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const assistant = new MobileVoiceAssistant();
    assistant.init();
});
