document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    const discoverLink = document.getElementById('discover-link');
    const chatLink = document.getElementById('chat-link');
    const NEWS_API_KEY = '';
    
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

            <style>
                .loading-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                }

                .loading-spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .no-image {
                    background: #f5f5f5;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                }
            </style>
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
                currentPage = 1; // Reset page number when changing category
                fetchArticles(btn.dataset.category);
            });
        });

        // Fetch initial articles and setup infinite scroll
        currentPage = 1;
        fetchArticles('general');
        setupInfiniteScroll();
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
    let currentPage = 1;
    let isLoading = false;
    let currentCategory = 'general';

    async function fetchArticles(category, page = 1) {
        const articlesContainer = document.querySelector('.articles-container');
        
        if (page === 1) {
            articlesContainer.innerHTML = '<div class="loading">Loading articles...</div>';
            currentCategory = category;
        } else {
            // Add loading indicator at bottom
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Loading more articles...</p>
            `;
            articlesContainer.appendChild(loadingIndicator);
        }

        try {
            const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&page=${page}&pageSize=10&apiKey=${NEWS_API_KEY}`);
            const data = await response.json();

            // Remove loading indicator if it exists
            const loadingIndicator = document.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }

            if (data.articles && data.articles.length > 0) {
                const articlesHTML = data.articles.map(article => `
                    <div class="article-card" onclick="window.open('${article.url}', '_blank')">
                        ${article.urlToImage ? `
                            <div class="article-image-container">
                                <img src="${article.urlToImage}" alt="${article.title}" class="article-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                            </div>
                        ` : '<div class="article-image-container"><div class="no-image">No Image Available</div></div>'}
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

                if (page === 1) {
                    articlesContainer.innerHTML = articlesHTML;
                } else {
                    articlesContainer.insertAdjacentHTML('beforeend', articlesHTML);
                }
            } else if (page === 1) {
                articlesContainer.innerHTML = '<div class="error">No articles found for this category.</div>';
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            if (page === 1) {
                articlesContainer.innerHTML = '<div class="error">Error loading articles. Please try again later.</div>';
            }
        } finally {
            isLoading = false;
        }
    }

    // Add scroll event listener for infinite scroll
    function setupInfiniteScroll() {
        const handleScroll = () => {
            if (isLoading) return;

            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            
            // Check if user has scrolled to near bottom
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                isLoading = true;
                currentPage++;
                fetchArticles(currentCategory, currentPage);
            }
        };

        // Add throttling to scroll event
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 100);
            }
        });
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
