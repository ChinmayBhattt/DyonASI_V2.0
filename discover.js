document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    const discoverLink = document.getElementById('discover-link');
    const chatLink = document.getElementById('chat-link');
    const NEWS_API_KEY = 'e991d40726ac4d388a6845656128d186';
    
    // Store the original chat interface
    let chatInterface = null;

    // Function to save chat interface
    function saveChatInterface() {
        if (!chatInterface) {
            chatInterface = mainContent.innerHTML;
        }
    }
    
    // Function to create discover interface
    function createDiscoverInterface() {
        console.log('Creating discover interface');
        saveChatInterface();

        const discoverHTML = `
            <div class="discover-container">
                <div class="discover-header">
                    <h1><i class="fas fa-compass"></i> Discover</h1>
                </div>
                <div class="categories-bar">
                    <button class="category-btn active" data-category="general">
                        <span class="category-icon">🎯</span>
                        For You
                    </button>
                    <button class="category-btn" data-category="technology">
                        <span class="category-icon">🔬</span>
                        Tech & Science
                    </button>
                    <button class="category-btn" data-category="business">
                        <span class="category-icon">💰</span>
                        Finance
                    </button>
                    <button class="category-btn" data-category="entertainment">
                        <span class="category-icon">🎨</span>
                        Arts & Culture
                    </button>
                    <button class="category-btn" data-category="sports">
                        <span class="category-icon">⚽</span>
                        Sports
                    </button>
                </div>
                <div class="articles-container">
                    <div class="loading">Loading articles...</div>
                </div>
            </div>
        `;
        
        // Remove input wrapper when in discover mode
        const inputWrapper = document.querySelector('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.style.display = 'none';
        }
        
        mainContent.innerHTML = discoverHTML;

        // Add event listeners to category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                fetchArticles(btn.dataset.category);
            });
        });

        // Fetch initial articles
        fetchArticles('general');
    }

    // Function to restore chat interface
    function restoreChatInterface() {
        console.log('Restoring chat interface');
        if (chatInterface) {
            mainContent.innerHTML = chatInterface;
            
            // Show input wrapper when back in chat mode
            const inputWrapper = document.querySelector('.input-wrapper');
            if (inputWrapper) {
                inputWrapper.style.display = 'block';
            }
            
            // Reinitialize chat functionality
            const inputField = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-btn');
            
            if (inputField) {
                // Auto-resize input field
                inputField.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });

                // Handle Enter key
                inputField.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                });
            }

            if (sendButton) {
                sendButton.addEventListener('click', handleSendMessage);
            }

            // Handle sending messages
            async function handleSendMessage() {
                const message = inputField.value.trim();
                if (!message) return;

                // Create and append user message
                const userMessageDiv = document.createElement('div');
                userMessageDiv.classList.add('message', 'user-message');
                userMessageDiv.textContent = message;
                document.querySelector('.messages-container').appendChild(userMessageDiv);

                // Clear input and reset height
                inputField.value = '';
                inputField.style.height = 'auto';

                // Show thinking message
                const thinkingMessage = document.createElement('div');
                thinkingMessage.classList.add('message', 'thinking-message');
                thinkingMessage.textContent = 'DysonASI is thinking...';
                document.querySelector('.messages-container').appendChild(thinkingMessage);

                try {
                    const response = await fetch('http://localhost:5000/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message })
                    });

                    const data = await response.json();
                    thinkingMessage.remove();

                    // Create and append AI message
                    const aiMessageDiv = document.createElement('div');
                    aiMessageDiv.classList.add('message', 'ai-message');
                    aiMessageDiv.textContent = data.response || "I couldn't process that request.";
                    document.querySelector('.messages-container').appendChild(aiMessageDiv);

                } catch (error) {
                    console.error('Error:', error);
                    thinkingMessage.textContent = 'Error connecting to DysonASI server.';
                }

                // Scroll to bottom
                const messagesContainer = document.querySelector('.messages-container');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            // Initialize any other chat functionality
            if (typeof initializeChatFunctionality === 'function') {
                initializeChatFunctionality();
            }
        }
    }

    // Function to fetch articles from NewsAPI
    async function fetchArticles(category) {
        const articlesContainer = document.querySelector('.articles-container');
        articlesContainer.innerHTML = '<div class="loading">Loading articles...</div>';

        try {
            const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`);
            const data = await response.json();

            if (data.articles && data.articles.length > 0) {
                articlesContainer.innerHTML = data.articles.map(article => `
                    <div class="article-card" onclick="window.open('${article.url}', '_blank')">
                        ${article.urlToImage ? `
                            <div class="article-image-container">
                                <img src="${article.urlToImage}" alt="${article.title}" class="article-image">
                            </div>
                        ` : ''}
                        <div class="article-content">
                            <h3 class="article-title">${article.title}</h3>
                            <p class="article-description">${article.description || ''}</p>
                            <div class="article-meta">
                                <span class="article-source">${article.source.name}</span>
                                <span class="article-date">${new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                articlesContainer.innerHTML = '<div class="error">No articles found for this category.</div>';
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            articlesContainer.innerHTML = '<div class="error">Error loading articles. Please try again later.</div>';
        }
    }

    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Clear existing event listeners
        const oldDiscoverLink = document.getElementById('discover-link');
        const oldChatLink = document.getElementById('chat-link');
        
        const newDiscoverLink = oldDiscoverLink.cloneNode(true);
        const newChatLink = oldChatLink.cloneNode(true);
        
        oldDiscoverLink.parentNode.replaceChild(newDiscoverLink, oldDiscoverLink);
        oldChatLink.parentNode.replaceChild(newChatLink, oldChatLink);
        
        // Add click event listeners
        newDiscoverLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Discover clicked');
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            createDiscoverInterface();
        });
        
        newChatLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Chat clicked');
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            restoreChatInterface();
        });
    }

    // Set up event listeners immediately
    setupEventListeners();
    
    // Also expose the setup function globally
    window.setupDiscoverEventListeners = setupEventListeners;
}); 