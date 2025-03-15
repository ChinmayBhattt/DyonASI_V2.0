document.addEventListener("DOMContentLoaded", function () {
    initializeChat();
});

function initializeChat() {
    const inputField = document.querySelector(".input-field");
    const sendButton = document.querySelector(".send-btn");
    const messagesContainer = document.querySelector(".messages-container");
    const modeSelector = document.querySelector(".mode-selector");
    
    window.chatHistory = window.chatHistory || [];
    window.currentChatIndex = window.currentChatIndex || -1;
    window.isProcessing = false;
    window.firstMessage = null; // Track first message for chat title
    window.isChatSaved = false; // Track if current chat is already saved

    // Save existing chat before refresh
    window.addEventListener('beforeunload', function() {
        if (messagesContainer && messagesContainer.children.length > 1 && !window.isChatSaved) {
            const chatContent = Array.from(messagesContainer.children)
                .map(msg => {
                    const isUser = msg.classList.contains('user-message');
                    return `${isUser ? 'User' : 'AI'}: ${msg.textContent}`;
                })
                .join('\n');
            
            // Get first user message as title
            const firstUserMessage = Array.from(messagesContainer.children)
                .find(msg => msg.classList.contains('user-message'))?.textContent || 'Untitled Chat';
            
            if (typeof window.saveChat === 'function') {
                window.saveChat(chatContent, firstUserMessage);
            }
        }
    });

    // Auto-resize textarea
    if (inputField) {
        inputField.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        });
    }

    // Handle keyboard shortcuts
    document.addEventListener("keydown", function(e) {
        // Command/Ctrl + K for new thread
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            window.startNewThread();
        }
    });

    // Add showThinkingMessage as a global function
    window.showThinkingMessage = function() {
        const messagesContainer = document.querySelector(".messages-container");
        if (!messagesContainer) return null;

        const thinkingMessage = document.createElement("div");
        thinkingMessage.classList.add("thinking-message");
        thinkingMessage.innerText = "DysonASI is thinking...";
        messagesContainer.appendChild(thinkingMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return thinkingMessage;
    };

    // Expose functions globally
    window.sendMessage = async function() {
        const inputField = document.querySelector(".input-field");
        const messagesContainer = document.querySelector(".messages-container");
        if (!inputField || !messagesContainer) return;

        const message = inputField.value.trim();
        if (!message || window.isProcessing) return;

        window.isProcessing = true;
        
        // Store first message as chat title
        if (!window.firstMessage) {
            window.firstMessage = message;
        }
        
        if (window.currentChatIndex === -1) {
            window.startNewThread();
        }

        // Reset textarea height
        inputField.style.height = "auto";

        // Add user message
        const userMessageDiv = document.createElement("div");
        userMessageDiv.classList.add("message", "user-message");
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        
        window.chatHistory[window.currentChatIndex].push({ text: message, isUser: true });
        inputField.value = "";
        
        // Show thinking message
        const thinkingMessage = window.showThinkingMessage();
        if (!thinkingMessage) {
            window.isProcessing = false;
            return;
        }
        
        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            const formattedResponse = formatResponse(data.response || "Sorry, I couldn't understand that.");

            window.chatHistory[window.currentChatIndex].push({ text: formattedResponse, isUser: false });

            // Remove thinking message and add AI response
            if (thinkingMessage && thinkingMessage.parentNode) {
                thinkingMessage.remove();
            }
            
            const aiMessageDiv = document.createElement("div");
            aiMessageDiv.classList.add("message", "ai-message");
            aiMessageDiv.innerHTML = formattedResponse;
            messagesContainer.appendChild(aiMessageDiv);
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Save chat to library only if it's the first message and not already saved
            if (!window.isChatSaved && window.firstMessage) {
                const chatContent = Array.from(messagesContainer.children)
                    .map(msg => {
                        const isUser = msg.classList.contains('user-message');
                        return `${isUser ? 'User' : 'AI'}: ${msg.textContent}`;
                    })
                    .join('\n');
                
                if (typeof window.saveChat === 'function') {
                    window.saveChat(chatContent, window.firstMessage);
                    window.isChatSaved = true; // Mark chat as saved
                }
            }

        } catch (error) {
            console.error("Error:", error);
            if (thinkingMessage && thinkingMessage.parentNode) {
                thinkingMessage.textContent = "Error connecting to DysonASI server.";
            }
        }
        window.isProcessing = false;
    };

    window.startNewThread = function() {
        // Save existing chat before starting new one
        if (messagesContainer && messagesContainer.children.length > 1 && !window.isChatSaved) {
            const chatContent = Array.from(messagesContainer.children)
                .map(msg => {
                    const isUser = msg.classList.contains('user-message');
                    return `${isUser ? 'User' : 'AI'}: ${msg.textContent}`;
                })
                .join('\n');
            
            // Get first user message as title
            const firstUserMessage = Array.from(messagesContainer.children)
                .find(msg => msg.classList.contains('user-message'))?.textContent || 'Untitled Chat';
            
            if (typeof window.saveChat === 'function') {
                window.saveChat(chatContent, firstUserMessage);
            }
        }

        window.chatHistory.push([]);
        window.currentChatIndex = window.chatHistory.length - 1;
        window.firstMessage = null;
        window.isChatSaved = false;
        
        if (messagesContainer && inputField) {
            messagesContainer.innerHTML = "";
            inputField.value = "";
            inputField.style.height = "auto";
            
            const welcomeMessage = document.createElement("div");
            welcomeMessage.classList.add("message", "ai-message");
            welcomeMessage.innerHTML = "<p>Hi, I'm DysonASI! How can I assist you today?</p>";
            messagesContainer.appendChild(welcomeMessage);
        }
    };

    function formatResponse(responseText) {
        // Convert markdown-style formatting to HTML
        let formattedLines = [];
        let inList = false;
        let listType = 'ul';

        responseText.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return;

            // Handle lists
            if (line.startsWith('- ') || line.startsWith('* ')) {
                if (!inList) {
                    formattedLines.push('<ul>');
                    inList = true;
                    listType = 'ul';
                }
                formattedLines.push(`<li>${line.slice(2)}</li>`);
            } else if (line.match(/^\d+\. /)) {
                if (!inList) {
                    formattedLines.push('<ol>');
                    inList = true;
                    listType = 'ol';
                }
                formattedLines.push(`<li>${line.slice(line.indexOf('.') + 2)}</li>`);
            } else {
                if (inList) {
                    formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                    inList = false;
                }
                formattedLines.push(`<p>${line}</p>`);
            }
        });

        if (inList) {
            formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        }

        return formattedLines.join('\n');
    }

    // Initialize chat if elements exist
    if (inputField && sendButton) {
        sendButton.addEventListener("click", window.sendMessage);
        inputField.addEventListener("keydown", function(event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                window.sendMessage();
            }
        });
    }

    // Initialize new thread button if it exists
    const newThreadButton = document.querySelector(".new-thread");
    if (newThreadButton) {
        newThreadButton.addEventListener("click", window.startNewThread);
    }

    // Start new thread if no chat exists
    if (window.currentChatIndex === -1) {
        window.startNewThread();
    }
}

// Make initializeChat globally available
window.initializeChat = initializeChat;

// Theme Toggle
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
    }

    document.querySelector(".toggle-theme").addEventListener("click", function () {
        body.classList.toggle("light-mode");
        localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
    });
});

// Settings Menu
document.addEventListener("DOMContentLoaded", function () {
    const settingsBtn = document.querySelector(".settings-btn");
    const settingsMenu = document.querySelector(".settings-menu");

    settingsBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        settingsMenu.style.display = settingsMenu.style.display === "none" || settingsMenu.style.display === "" ? "flex" : "none";
    });

    document.addEventListener("click", function (event) {
        if (!settingsMenu.contains(event.target) && !settingsBtn.contains(event.target)) {
            settingsMenu.style.display = "none";
        }
    });

    // Settings actions
    document.querySelector(".delete-chats").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete all chats?")) {
            document.querySelector(".messages-container").innerHTML = "";
            localStorage.removeItem("chatHistory");
        }
    });

    document.querySelector(".contact-us").addEventListener("click", function () {
        window.open("https://linktr.ee/DysonASI", "_blank");
    });
});

// Search and Thought Icons
function toggleSearch(element) {
    element.classList.toggle("active");
    setTimeout(() => {
        element.classList.remove("active");
    }, 2000);
}

document.addEventListener("DOMContentLoaded", function () {
    const settingsBtn = document.querySelector(".settings-btn");
    const settingsMenu = document.querySelector(".settings-menu");

    // Toggle Settings Menu
    settingsBtn.addEventListener("click", function () {
        settingsMenu.style.display = settingsMenu.style.display === "none" ? "flex" : "none";
    });

    // Delete All Chats
    document.querySelector(".delete-chats").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete all chats?")) {
            document.querySelector(".messages-container").innerHTML = "";
        }
    });

    // Contact Us
    // document.querySelector(".contact-us").addEventListener("click", function () {
    //     alert("Contact us at: support@dysonasi.com");
    // });
        document.querySelector(".contact-us").addEventListener("click", function () {
            window.open("https://linktr.ee/DysonASI", "_blank");
        });
    
    
    // Login
    document.querySelector(".login").addEventListener("click", function () {
        window.location.href = "/login"; // Redirect to login page
    });
});
// document.querySelector(".contact-us").addEventListener("click", function () {
//     window.open("https://linktr.ee/DysonASI", "_blank");
// });

// Function to create a new chat session
function newChat() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const currentChat = document.getElementById('chatBox').innerHTML;
    
    if (currentChat.trim() !== "") {
        chatHistory.push(currentChat);
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    
    document.getElementById('chatBox').innerHTML = "";
    alert("New chat started! Previous chat is saved.");
}

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    
    // Check local storage for saved theme preference
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
    }

    document.querySelector(".toggle-theme").addEventListener("click", function () {
        body.classList.toggle("light-mode");

        if (body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const elementsToToggle = [
        body,
        document.querySelector(".container"),
        document.querySelector(".main-content"),
        document.querySelector(".messages-container"),
        document.querySelector(".input-container"),
        document.querySelector(".top-bar"),
        document.querySelector(".sidebar"),
    ];

    // Apply saved theme from local storage
    if (localStorage.getItem("theme") === "light") {
        elementsToToggle.forEach(el => el?.classList.add("light-mode"));
    }

    document.querySelector(".toggle-theme").addEventListener("click", function () {
        elementsToToggle.forEach(el => el?.classList.toggle("light-mode"));

        if (body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    
    // Check local storage for saved theme preference
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
    }

    document.querySelector(".toggle-theme").addEventListener("click", function () {
        body.classList.toggle("light-mode");

        if (body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
            body.style.background = "#f8f9fa"; // Light mode background
        } else {
            localStorage.setItem("theme", "dark");
            body.style.background = "#0A0A0A"; // Dark mode background
        }
    });

    // Apply background color on load
    if (localStorage.getItem("theme") === "light") {
        body.style.background = "#f8f9fa";
    } else {
        body.style.background = "#0A0A0A";
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const settingsBtn = document.querySelector(".settings-btn");
    const settingsMenu = document.querySelector(".settings-menu");

    // Toggle Settings Menu when clicking the button
    settingsBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // ✅ Stops event from propagating to document
        settingsMenu.style.display = (settingsMenu.style.display === "none" || settingsMenu.style.display === "") ? "flex" : "none";
    });

    // Close settings menu when clicking anywhere else on the page
    document.addEventListener("click", function (event) {
        if (!settingsMenu.contains(event.target) && !settingsBtn.contains(event.target)) {
            settingsMenu.style.display = "none";
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const settingsBtn = document.querySelector(".settings-btn");
    const settingsMenu = document.querySelector(".settings-menu");

    // Toggle Settings Menu when clicking the button
    settingsBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // ✅ Prevents event from bubbling
        if (settingsMenu.style.display === "none" || settingsMenu.style.display === "") {
            settingsMenu.style.display = "flex"; // ✅ Open menu
        } else {
            settingsMenu.style.display = "none"; // ✅ Close menu
        }
    });

    // Close settings menu when clicking anywhere else on the page
    document.addEventListener("click", function (event) {
        if (settingsMenu.style.display === "flex" && !settingsBtn.contains(event.target) && !settingsMenu.contains(event.target)) {
            settingsMenu.style.display = "none";
        }
    });
});

const newChatButton = document.querySelector(".new-chat"); // ✅ Use specific class for "New Chat" button
newChatButton.addEventListener("click", startNewThread);

document.addEventListener("DOMContentLoaded", function () {
    const thoughtBtn = document.querySelector(".thought-icon");

    thoughtBtn.addEventListener("click", function () {
        this.classList.toggle("active");
    });
});
function toggleSearch(element) {
    element.classList.toggle("active");
    // Yahan AI search logic add kar sakte ho
}

function toggleEffect(element) {
    element.classList.toggle("active");

    // Sparkle Effect
    for (let i = 0; i < 5; i++) {  // Creating multiple sparkles
        let sparkle = document.createElement("div");
        sparkle.classList.add("sparkle");
        
        let x = Math.random() * element.clientWidth;
        let y = Math.random() * element.clientHeight;
        
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        element.appendChild(sparkle);

        // Remove sparkle after animation
        setTimeout(() => sparkle.remove(), 600);
    }
}
let recognition;
let isListening = false;

function toggleVoiceRecognition() {
    let voiceIcon = document.querySelector(".voice-icon");

    if (!isListening) {
        // 🎤 Start Voice Recognition
        isListening = true;
        voiceIcon.classList.add("active");

        if (recognition) {
            recognition.stop(); // Pehle ka instance stop karo
        }

        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onstart = function () {
            console.log("🎤 Mic On...");
        };

        recognition.onresult = function (event) {
            let transcript = event.results[0][0].transcript;
            document.querySelector(".input-field").value = transcript;
            stopVoiceRecognition(); // 🔴 Auto Stop on Result
        };

        recognition.onerror = function (event) {
            console.error("❌ Error:", event.error);
            stopVoiceRecognition(); // 🔴 Auto Stop on Error
        };

        recognition.onend = function () {
            if (isListening) stopVoiceRecognition();
        };

        recognition.start();
    } else {
        stopVoiceRecognition(); // ✋ Stop Mic on Click
    }
}

function stopVoiceRecognition() {
    let voiceIcon = document.querySelector(".voice-icon");

    if (recognition) {
        recognition.stop();
    }

    voiceIcon.classList.remove("active");
    isListening = false;
}

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const messagesContainer = document.getElementById('messages-container');
    const inputField = document.querySelector('.input-field');
    const deepthinkBtn = document.querySelector('.deepthink-btn');
    const searchBtn = document.querySelector('.search-btn');

    let isFirstMessage = true;

    // Function to create a message element
    function createMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? '👤' : '🐋';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        return messageDiv;
    }

    // Function to handle sending messages
    function handleSendMessage() {
        const message = inputField.value.trim();
        if (!message) return;

        // Hide welcome screen on first message
        if (isFirstMessage) {
            welcomeScreen.classList.add('hidden');
            isFirstMessage = false;
        }

        // Add user message
        messagesContainer.appendChild(createMessage(message, true));
        inputField.value = '';

        // Auto resize input field
        inputField.style.height = 'auto';

        // Simulate AI response
        setTimeout(() => {
            const response = "Hello! I'm DeepSeek. How can I assist you today?";
            messagesContainer.appendChild(createMessage(response, false));
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    // Handle enter key to send message
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto resize input field
    inputField.addEventListener('input', () => {
        inputField.style.height = 'auto';
        inputField.style.height = inputField.scrollHeight + 'px';
    });

    // Mode button click handlers
    deepthinkBtn.addEventListener('click', () => {
        deepthinkBtn.classList.add('active');
        searchBtn.classList.remove('active');
    });

    searchBtn.addEventListener('click', () => {
        searchBtn.classList.add('active');
        deepthinkBtn.classList.remove('active');
    });
});

// Navigation state management
window.currentPage = 'chat'; // Default page

// Function to show the appropriate interface based on current page
window.showCurrentInterface = function() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Remove any existing event listeners
    const oldContent = mainContent.cloneNode(false);
    mainContent.parentNode.replaceChild(oldContent, mainContent);

    console.log('Current page:', window.currentPage);

    switch (window.currentPage) {
        case 'chat':
            if (typeof window.restoreChatInterface === 'function') {
                window.restoreChatInterface();
            }
            break;
        case 'discover':
            if (typeof createDiscoverInterface === 'function') {
                createDiscoverInterface();
            }
            break;
        // Add other cases as needed
    }
};

// Update the existing setupEventListeners function
window.setupEventListeners = function() {
    console.log('Setting up event listeners');
    
    // Clear existing event listeners
    const oldDiscoverLink = document.getElementById('discover-link');
    const oldChatLink = document.getElementById('chat-link');
    const oldImagesLink = document.getElementById('images-link');
    const oldHistoryLink = document.getElementById('history-link');
    
    const newDiscoverLink = oldDiscoverLink?.cloneNode(true);
    const newChatLink = oldChatLink?.cloneNode(true);
    const newImagesLink = oldImagesLink?.cloneNode(true);
    const newHistoryLink = oldHistoryLink?.cloneNode(true);
    
    // Replace old elements with new ones
    if (oldDiscoverLink && newDiscoverLink) {
        oldDiscoverLink.parentNode.replaceChild(newDiscoverLink, oldDiscoverLink);
    }
    if (oldChatLink && newChatLink) {
        oldChatLink.parentNode.replaceChild(newChatLink, oldChatLink);
    }
    if (oldImagesLink && newImagesLink) {
        oldImagesLink.parentNode.replaceChild(newImagesLink, oldImagesLink);
    }
    if (oldHistoryLink && newHistoryLink) {
        oldHistoryLink.parentNode.replaceChild(newHistoryLink, oldHistoryLink);
    }
    
    // Add click event listeners
    if (newChatLink) {
        newChatLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Chat clicked');
            
            // Update current page
            window.currentPage = 'chat';
            
            // Remove active class from all nav items and add to chat
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Show chat interface immediately
            if (typeof window.restoreChatInterface === 'function') {
                window.restoreChatInterface();
            }
        });
    }
    
    if (newDiscoverLink) {
        newDiscoverLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Discover clicked');
            
            window.currentPage = 'discover';
            
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            window.showCurrentInterface();
        });
    }
    
    if (newImagesLink) {
        newImagesLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Images clicked');
            
            window.currentPage = 'images';
            
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    }
    
    if (newHistoryLink) {
        newHistoryLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('History clicked');
            
            window.currentPage = 'history';
            
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    window.setupEventListeners();
    
    // Set initial active state
    const chatLink = document.getElementById('chat-link');
    if (chatLink) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        chatLink.classList.add('active');
    }
    
    // Show initial interface
    window.showCurrentInterface();
});


