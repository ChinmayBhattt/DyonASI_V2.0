document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const musicLink = document.getElementById('music-link');
    const chatLink = document.getElementById('chat-link');
    let currentInterface = null;

    // API Configuration
    const API_KEY = "a734e0aef1a2ff7a8a18d769ad49703b";
    const API_ENDPOINT = "https://api.suno.ai/v1/music";
    const REFERENCE_AUDIO = 'https://tand-dev.github.io/audio-hosting/spinning-head-271171.mp3';

    function saveChatInterface() {
        currentInterface = mainContent.innerHTML;
    }

    function restoreChatInterface() {
        if (currentInterface) {
            mainContent.innerHTML = currentInterface;
        }
    }

    function createMusicInterface() {
        saveChatInterface();
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        musicLink.classList.add('active');
        
        mainContent.innerHTML = `
            <div class="music-container">
                <div class="music-sidebar">
                    <div class="input-section lyrics-section">
                        <label>Lyrics</label>
                        <textarea class="lyrics-input" placeholder="Write your lyrics here..." rows="6"></textarea>
                        <div class="char-count">0 / 3000</div>
                    </div>
                    
                    <div class="input-section style-section">
                        <label>Style of Music</label>
                        <div class="style-tags">
                            <div class="style-input-wrapper">
                                <input type="text" class="style-input" placeholder="Enter style keywords...">
                                <span class="input-icon">✨</span>
                            </div>
                            <div class="style-suggestions">
                                <span class="style-tag">gregorian chant</span>
                                <span class="style-tag">electro dub</span>
                                <span class="style-tag">polyphony</span>
                                <span class="style-tag">jazzcore</span>
                                <span class="style-tag">djent</span>
                            </div>
                        </div>
                    </div>

                    <div class="input-section title-section">
                        <label>Title</label>
                        <div class="title-input-wrapper">
                            <input type="text" class="title-input" placeholder="Name your creation">
                            <span class="input-icon">🎵</span>
                        </div>
                    </div>

                    <button class="create-music-btn">
                        <span class="btn-icon">🎼</span>
                        Create Music
                    </button>
                </div>

                <div class="music-content">
                    <div class="music-display">
                        <div class="placeholder-message">
                            <span class="placeholder-icon">🎹</span>
                            <p>Your AI-generated music will appear here</p>
                            <span class="placeholder-subtitle">Fill in the details on the left to get started</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .music-container {
                display: flex;
                height: 100%;
                background-color: var(--background-primary);
                color: var(--text-primary);
            }

            .music-sidebar {
                width: 380px;
                min-width: 380px;
                height: 100%;
                border-right: 1px solid var(--border-color);
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 24px;
                background-color: var(--background-secondary);
                position: relative;
            }

            .input-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .input-section label {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .lyrics-input, .style-input, .title-input {
                width: 100%;
                padding: 14px;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                background-color: var(--background-primary);
                color: var(--text-primary);
                font-size: 14px;
                line-height: 1.5;
                transition: all 0.2s ease;
            }

            .lyrics-input:focus, .style-input:focus, .title-input:focus {
                border-color: var(--accent-color);
                outline: none;
                box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.1);
            }

            .lyrics-input {
                height: 180px;
                resize: none;
            }

            .char-count {
                font-size: 12px;
                color: var(--text-secondary);
                text-align: right;
                margin-top: 4px;
            }

            .style-input-wrapper, .title-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }

            .input-icon {
                position: absolute;
                right: 14px;
                font-size: 16px;
                opacity: 0.7;
            }

            .style-tags {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .style-suggestions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 4px;
            }

            .style-tag {
                padding: 8px 14px;
                background-color: var(--background-primary);
                border: 1px solid var(--border-color);
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                user-select: none;
            }

            .style-tag:hover {
                background-color: var(--accent-color);
                border-color: var(--accent-color);
                color: white;
                transform: translateY(-1px);
            }

            .create-music-btn {
                margin-top: auto;
                padding: 16px;
                background-color: var(--accent-color);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .create-music-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(29, 185, 84, 0.2);
            }

            .btn-icon {
                font-size: 18px;
            }

            .music-content {
                flex: 1;
                padding: 32px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            .music-display {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                border: 2px dashed var(--border-color);
                border-radius: 16px;
                margin: 20px;
            }

            .placeholder-message {
                text-align: center;
                color: var(--text-secondary);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }

            .placeholder-icon {
                font-size: 48px;
                margin-bottom: 8px;
            }

            .placeholder-message p {
                font-size: 16px;
                font-weight: 500;
                color: var(--text-primary);
                margin: 0;
            }

            .placeholder-subtitle {
                font-size: 14px;
                opacity: 0.7;
            }

            /* Loading animation */
            .loading-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                color: var(--text-primary);
            }

            .loading-message:after {
                content: '';
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top-color: var(--accent-color);
                border-radius: 50%;
                animation: loading 0.8s infinite linear;
            }

            @keyframes loading {
                to {
                    transform: rotate(360deg);
                }
            }

            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-track {
                background: transparent;
            }

            ::-webkit-scrollbar-thumb {
                background: var(--border-color);
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: var(--text-secondary);
            }

            /* Input placeholder styles */
            ::placeholder {
                color: var(--text-secondary);
                opacity: 0.7;
            }

            /* Focus styles */
            *:focus {
                outline: none;
            }
        `;
        document.head.appendChild(style);

        setupMusicEventListeners();
    }

    function setupMusicEventListeners() {
        const styleTags = document.querySelectorAll('.style-tag');
        const styleInput = document.querySelector('.style-input');
        const createButton = document.querySelector('.create-music-btn');
        const lyricsInput = document.querySelector('.lyrics-input');
        const charCount = document.querySelector('.char-count');

        styleTags.forEach(tag => {
            tag.addEventListener('click', () => {
                styleInput.value = tag.textContent;
            });
        });

        lyricsInput.addEventListener('input', () => {
            const count = lyricsInput.value.length;
            charCount.textContent = `${count} / 3000`;
        });

        createButton.addEventListener('click', handleMusicCreation);
    }

    async function handleMusicCreation() {
        const lyrics = document.querySelector('.lyrics-input').value;
        const style = document.querySelector('.style-input').value;
        const title = document.querySelector('.title-input').value;

        if (!lyrics || !style || !title) {
            alert('Please fill in all fields');
            return;
        }

        const musicDisplay = document.querySelector('.music-display');
        musicDisplay.innerHTML = `
            <div class="loading-message">
                <p>Creating your masterpiece...</p>
                <p style="font-size: 14px; opacity: 0.7;">This may take a few minutes</p>
            </div>
        `;
        
        try {
            // Initial generation request
            const response = await fetch(API_ENDPOINT + '/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: lyrics,
                    genre: style,
                    title: title,
                    duration: 180,
                    model: 'v2'
                })
            });

            const data = await response.json();
            console.log("Generation initiated:", data);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to generate music');
            }

            const generationId = data.generation_id;
            
            // Poll for the result
            const checkStatus = async () => {
                const statusResponse = await fetch(`${API_ENDPOINT}/generations/${generationId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!statusResponse.ok) {
                    const errorData = await statusResponse.json();
                    throw new Error(errorData.message || 'Failed to check generation status');
                }

                const statusData = await statusResponse.json();
                console.log("Status check:", statusData);
                
                if (statusData.status === 'completed') {
                    // Display the generated music
                    musicDisplay.innerHTML = `
                        <div class="generated-music">
                            <div class="music-header">
                                <h2>${title}</h2>
                                <span class="music-style">${style}</span>
                            </div>
                            <div class="music-player">
                                <audio controls>
                                    <source src="${statusData.audio_url}" type="audio/mpeg">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                            <div class="music-info">
                                <div class="lyrics-display">
                                    <h3>Lyrics</h3>
                                    <pre>${lyrics}</pre>
                                </div>
                                <div class="download-section">
                                    <a href="${statusData.audio_url}" download="${title}.mp3" class="download-btn">
                                        <span class="btn-icon">⬇️</span>
                                        Download Music
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (statusData.status === 'failed') {
                    throw new Error(statusData.error || 'Music generation failed. Please try again.');
                } else if (statusData.status === 'processing') {
                    // Update loading message with progress if available
                    const progress = statusData.progress || 0;
                    musicDisplay.innerHTML = `
                        <div class="loading-message">
                            <p>Creating your masterpiece... ${Math.round(progress * 100)}%</p>
                            <p style="font-size: 14px; opacity: 0.7;">This may take a few minutes</p>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${progress * 100}%"></div>
                            </div>
                        </div>
                    `;
                    setTimeout(checkStatus, 2000);
                } else {
                    // Still in queue or other status
                    setTimeout(checkStatus, 2000);
                }
            };

            // Start polling
            setTimeout(checkStatus, 2000);

        } catch (error) {
            console.error('Error generating music:', error);
            musicDisplay.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">❌</span>
                    <p>${error.message}</p>
                    <button class="retry-btn" onclick="handleMusicCreation()">Try Again</button>
                </div>
            `;
        }
    }

    // Add progress bar styles
    const progressStyles = document.createElement('style');
    progressStyles.textContent = `
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #2a2a2a;
            border-radius: 2px;
            margin-top: 16px;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            background: var(--accent-color);
            transition: width 0.3s ease;
        }

        .error-message {
            text-align: center;
            padding: 20px;
        }

        .error-message .error-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
        }

        .error-message p {
            color: var(--text-primary);
            font-size: 16px;
            margin-bottom: 16px;
        }

        .retry-btn {
            padding: 12px 24px;
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .retry-btn:hover {
            transform: translateY(-1px);
            background: var(--accent-color-hover);
        }
    `;
    document.head.appendChild(progressStyles);

    function setupEventListeners() {
        musicLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            musicLink.classList.add('active');
            createMusicInterface();
        });

        chatLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            chatLink.classList.add('active');
            restoreChatInterface();
        });
    }

    // Initialize event listeners
    setupEventListeners();
}); 