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
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css'>
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-straight/css/uicons-bold-straight.css'>
            <div class="library-container">
                <div class="library-header">
                    <div class="library-title">
                        <span class="icon"></span> <i class="fi fi-bs-time-past" style="font-size: px;"></i>

                        <h1>History</h1>
                    </div>
                    <div class="search-container">
                        <input type="text" id="chat-search" placeholder="Search your threads..." class="search-input" onkeyup="searchChats()">
                    </div>
                </div>
                <div class="threads-section">
                    <div class="threads-header">
                        <div class="threads-title">
                            <span class="icon" ></span>  <i class="fi fi-bs-rectangle-history-circle-plus"></i>
                            <h2>Save Chats</h2>
                        </div>
                        <button class="delete-all-btn" onclick="deleteAllChats()" title="Delete all chats">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
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

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .library-container {
                padding: 20px;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .library-header {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .library-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .library-title h1 {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
            }
            .search-container {
                width: 100%;
            }
            .search-input {
                width: 100%;
                padding: 10px 16px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
                font-size: 14px;
            }
            .search-input:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.2);
            }
            .threads-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .threads-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .threads-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .threads-title h2 {
                font-size: 16px;
                font-weight: 500;
                margin: 0;
            }
            .delete-all-btn {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
            }
            .delete-all-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
            }
            .saved-chats {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .saved-chat-card {
                padding: 16px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: background 0.2s;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .saved-chat-card:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .chat-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .chat-title {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
            }
            .chat-timestamp {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }
            .chat-actions {
                display: flex;
                gap: 8px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .saved-chat-card:hover .chat-actions {
                opacity: 1;
            }
            .chat-actions button {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            .chat-actions button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
            }
        `;
        document.head.appendChild(style);
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
                <div class="chat-info">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-timestamp">${chat.timestamp}</div>
                </div>
                <div class="chat-actions">
                    <button class="view-chat-btn" onclick="viewChat(${chat.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-chat-btn" onclick="deleteChat(${chat.id})">
                        <i class="fas fa-trash"></i>
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

    // Add search functionality
    window.searchChats = function() {
        const searchInput = document.getElementById('chat-search');
        const searchTerm = searchInput.value.toLowerCase();
        const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
        
        const filteredChats = savedChats.filter(chat => 
            chat.title.toLowerCase().includes(searchTerm) || 
            chat.content.toLowerCase().includes(searchTerm)
        );
        
        const savedChatsContainer = document.querySelector('.saved-chats');
        
        if (filteredChats.length === 0) {
            savedChatsContainer.innerHTML = '<div class="no-chats">No matching chats found</div>';
            return;
        }

        savedChatsContainer.innerHTML = filteredChats.map(chat => `
            <div class="saved-chat-card" data-id="${chat.id}">
                <div class="chat-info">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-timestamp">${chat.timestamp}</div>
                </div>
                <div class="chat-actions">
                    <button class="view-chat-btn" onclick="viewChat(${chat.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-chat-btn" onclick="deleteChat(${chat.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    };
}); 