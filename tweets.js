        document.addEventListener('DOMContentLoaded', function() {
            // Initialize sidebar tweets
            const tweetsLink = document.getElementById('tweets-link');
            const tweetsPage = document.getElementById('tweets-page');
            const mainContent = document.querySelector('.main-content');
            const messagesContainer = document.querySelector('.messages-container');
            const inputWrapper = document.querySelector('.input-wrapper');
            const chatHeader = document.querySelector('.chat-header');

            tweetsLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Update active state
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                this.classList.add('active');
                
                // Hide chat interface
                messagesContainer.style.display = 'none';
                inputWrapper.style.display = 'none';
                chatHeader.style.display = 'none';
                
                // Show tweets page
                tweetsPage.style.display = 'block';
                
                // Load tweets
                loadMainPageTweets();
            });

            // Restore chat interface when other nav items are clicked
            document.querySelectorAll('.nav-item:not(#tweets-link)').forEach(item => {
                item.addEventListener('click', function() {
                    tweetsPage.style.display = 'none';
                    messagesContainer.style.display = 'block';
                    inputWrapper.style.display = 'block';
                    chatHeader.style.display = 'flex';
                });
            });

            // Function to load tweets for the main page
            async function loadMainPageTweets() {
                const tweetsGrid = document.querySelector('.tweets-grid');
                tweetsGrid.innerHTML = '<div class="loading-tweets">Loading tweets...</div>';
                
                try {
                    const tweets = await fetchTweets();
                    if (!tweets.length) {
                        tweetsGrid.innerHTML = '<div class="no-tweets">No tweets available</div>';
                        return;
                    }

                    tweetsGrid.innerHTML = tweets.map(tweet => `
                        <div class="tweet-card">
                            <div class="tweet-content">
                                <p>${tweet.text}</p>
                            </div>
                            <div class="tweet-footer">
                                <span class="tweet-date">${formatTweetDate(tweet.created_at)}</span>
                            </div>
                        </div>
                    `).join('');
                } catch (error) {
                    console.error('Error loading tweets:', error);
                    tweetsGrid.innerHTML = '<div class="error-tweets">Failed to load tweets</div>';
                }
            }

            // Function to search tweets
            window.searchTweetsContent = function(searchTerm) {
                const tweetsGrid = document.querySelector('.tweets-grid');
                const tweets = Array.from(tweetsGrid.getElementsByClassName('tweet-card'));
                
                tweets.forEach(tweet => {
                    const content = tweet.querySelector('.tweet-content p').textContent.toLowerCase();
                    if (content.includes(searchTerm.toLowerCase())) {
                        tweet.style.display = 'block';
                    } else {
                        tweet.style.display = 'none';
                    }
                });
            };

            // Add tweets styles
            const style = document.createElement('style');
            style.textContent = `
                #tweets-page {
                    padding: 20px;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .page-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                }

                .search-tweets {
                    width: 300px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 14px;
                }

                .search-tweets:focus {
                    outline: none;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .tweets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
            `;
            document.head.appendChild(style);
        });