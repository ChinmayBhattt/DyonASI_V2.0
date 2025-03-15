document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    const libraryLink = document.getElementById('library-link');
    const chatLink = document.getElementById('chat-link');
    
    // Store the original chat interface
    let chatInterface = null;

    // Function to save chat interface
    function saveChatInterface() {
        if (!chatInterface) {
            chatInterface = mainContent.innerHTML;
        }
    }

    // Function to create library interface
    function createLibraryInterface() {
        console.log('Creating library interface');
        saveChatInterface();

        const libraryHTML = `
            <div class="library-container">
                <div class="library-header">
                    <h1><i class="fas fa-history"></i> History</h1>
                    <button class="delete-all-chats-btn" onclick="deleteAllChats()">
                        <i class="fas fa-trash"></i> Delete All Chats
                    </button>
                </div>
                <div class="library-content">
                    <div class="saved-chats">
                        <!-- Saved chats will be displayed here -->
                    </div>
                </div>
            </div>
        `;
        
        // Remove input wrapper when in library mode
        const inputWrapper = document.querySelector('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.style.display = 'none';
        }
        
        mainContent.innerHTML = libraryHTML;
        displaySavedChats();
    }

    // Function to restore chat interface
    function restoreChatInterface() {
        console.log('Restoring chat interface');
        if (chatInterface) {
            // Save the messages content before restoring interface
            const currentMessages = document.querySelector('.messages-container')?.innerHTML || '';
            
            // Restore the interface
            mainContent.innerHTML = chatInterface;
            
            // Restore messages if they exist
            const messagesContainer = document.querySelector('.messages-container');
            if (currentMessages && messagesContainer) {
                messagesContainer.innerHTML = currentMessages;
            }
            
            // Show input wrapper when back in chat mode
            const inputWrapper = document.querySelector('.input-wrapper');
            if (inputWrapper) {
                inputWrapper.style.display = 'block';
            }

            // Initialize chat functionality
            initializeChatFunctionality();
        }
    }

    // Function to initialize chat functionality
    function initializeChatFunctionality() {
        const inputField = document.querySelector('.input-field');
        const sendButton = document.querySelector('.send-btn');
        const newChatBtn = document.querySelector('.new-chat-btn');

        if (inputField) {
            // Auto-resize textarea
            inputField.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });

            // Handle Enter key
            inputField.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (typeof window.sendMessage === 'function') {
                        window.sendMessage();
                    }
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', function() {
                if (typeof window.sendMessage === 'function') {
                    window.sendMessage();
                }
            });
        }

        if (newChatBtn) {
            newChatBtn.addEventListener('click', function() {
                if (typeof window.startNewThread === 'function') {
                    window.startNewThread();
                }
            });
        }
    }

    // Function to save a chat
    function saveChat(chatContent, customTitle) {
        let savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
        const newChat = {
            id: Date.now(),
            content: chatContent,
            timestamp: new Date().toLocaleString(),
            title: customTitle || chatContent.split('\n')[0].slice(0, 50) + '...' // Use custom title if provided, otherwise fallback to first line
        };
        savedChats.push(newChat);
        localStorage.setItem('savedChats', JSON.stringify(savedChats));
        console.log('Chat saved:', newChat);
    }

    // Expose saveChat function globally
    window.saveChat = saveChat;

    // Function to display saved chats
    function displaySavedChats() {
        const savedChatsContainer = document.querySelector('.saved-chats');
        const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
        
        if (savedChats.length === 0) {
            savedChatsContainer.innerHTML = '<div class="no-chats">No saved chats yet</div>';
            return;
        }

        savedChatsContainer.innerHTML = savedChats.map(chat => `
            <div class="saved-chat-card" data-id="${chat.id}">
                <div class="chat-title">${chat.title}</div>
                <div class="chat-timestamp">${chat.timestamp}</div>
                <div class="chat-actions">
                    <button class="view-chat-btn" onclick="viewChat(${chat.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="delete-chat-btn" onclick="deleteChat(${chat.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Function to view a specific chat
    window.viewChat = function(chatId) {
        const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
        const chat = savedChats.find(c => c.id === chatId);
        
        if (chat) {
            const messagesContainer = document.querySelector('.messages-container');
            messagesContainer.innerHTML = chat.content;
            restoreChatInterface();
        }
    };

    // Function to delete a chat
    window.deleteChat = function(chatId) {
        if (confirm('Are you sure you want to delete this chat?')) {
            let savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
            savedChats = savedChats.filter(chat => chat.id !== chatId);
            localStorage.setItem('savedChats', JSON.stringify(savedChats));
            displaySavedChats();
        }
    };

    // Function to delete all chats
    window.deleteAllChats = function() {
        if (confirm('Are you sure you want to delete all saved chats? This action cannot be undone.')) {
            localStorage.removeItem('savedChats');
            displaySavedChats(); // Refresh the display
        }
    };

    // Set up event listeners
    function setupEventListeners() {
        libraryLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            createLibraryInterface();
        });

        chatLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            restoreChatInterface();
        });
    }

    // Initialize
    setupEventListeners();
}); 