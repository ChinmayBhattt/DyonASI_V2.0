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
            if (line.startsWith('- ') || line.startsWith('*')) {
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

  
    // Start new thread if no chat exists
    if (window.currentChatIndex === -1) {
        window.startNewThread();
    }
}


