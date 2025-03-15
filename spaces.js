document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    const spacesLink = document.getElementById('spaces-link');
    const chatLink = document.getElementById('chat-link');
    
    const STABILITY_API_KEY = "sk-J4q0VQabR3DaH1kISlRacrCR8qSBRUmFDtHCujUVJAHDXUIk";
    const STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

    // Store the original chat interface
    let chatInterface = null;

    // Function to save chat interface
    function saveChatInterface() {
        if (!chatInterface) {
            chatInterface = mainContent.innerHTML;
        }
    }

    async function generateImage(prompt) {
        const statusDiv = document.querySelector('.generation-status');
        const generatedGrid = document.getElementById('generated-images-grid');
        
        try {
            statusDiv.style.display = 'flex';
            
            const response = await fetch(STABILITY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${STABILITY_API_KEY}`
                },
                body: JSON.stringify({
                    text_prompts: [
                        {
                            text: prompt,
                            weight: 1
                        }
                    ],
                    cfg_scale: 7,
                    height: 1024,
                    width: 1024,
                    samples: 1,
                    steps: 50
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate image');
            }

            const data = await response.json();
            console.log('Stability AI Response:', data);

            if (data.artifacts && data.artifacts.length > 0) {
                const imageBase64 = data.artifacts[0].base64;
                const imageUrl = `data:image/png;base64,${imageBase64}`;

                // Add the generated image to the grid
                const imageCard = document.createElement('div');
                imageCard.className = 'image-card';
                imageCard.innerHTML = `
                    <img src="${imageUrl}" alt="${prompt}" class="generated-image" loading="lazy">
                    <div class="image-info">
                        <p class="prompt-text">${prompt}</p>
                        <div class="image-actions">
                            <button class="action-btn download-btn" onclick="saveBase64AsImage('${imageBase64}', 'generated-image.png')">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn share-btn">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                `;
                generatedGrid.insertBefore(imageCard, generatedGrid.firstChild);
            } else {
                throw new Error('No image generated');
            }

        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image: ' + error.message);
        } finally {
            statusDiv.style.display = 'none';
        }
    }

    // Function to create spaces interface
    function createSpacesInterface() {
        console.log('Creating spaces interface');
        saveChatInterface();

        // Generate 20 example images with different prompts
        const examplePrompts = [
            "A beautiful sunset over mountains in digital art style",
            "Futuristic cityscape with flying cars",
            "Magical forest with glowing butterflies",
            "Abstract digital art with neon colors",
            "Underwater city with bioluminescent creatures",
            "Space station orbiting a distant planet",
            "Cyberpunk street scene at night",
            "Ancient temple in a mystical jungle",
            "Dragon soaring through stormy clouds",
            "Crystal cave with magical formations",
            "Steampunk airship in the sky",
            "Japanese garden in cherry blossom season",
            "Northern lights over snowy landscape",
            "Floating islands with waterfalls",
            "Mechanical clockwork universe",
            "Desert oasis under starry night",
            "Alien landscape with multiple moons",
            "Enchanted library with floating books",
            "Futuristic transportation hub",
            "Ancient ruins with mystical energy",
            "Neon samurai in cyberpunk city",
            "Mystical tree of life at twilight",
            "Underwater palace with merfolk",
            "Steampunk robot in Victorian London",
            "Crystal dragon in rainbow cave",
            "Floating city in the clouds",
            "Ancient space civilization ruins",
            "Magical potion shop at night",
            "Fairy garden with glowing mushrooms",
            "Time travel portal in space",
            "Mechanical butterflies in garden",
            "Desert temple with magic symbols",
            "Cosmic whale swimming through stars",
            "Ice palace under aurora borealis",
            "Enchanted forest with spirit lights"
        ];

        const getRandomPrompt = () => {
            return examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
        };

        const generateExampleCards = (filter = 'all') => {
            const cards = [];
            const categories = [
                'nature', 'technology', 'space', 'fantasy', 'art',
                'architecture', 'abstract', 'landscape', 'sci-fi', 'digital'
            ];
            
            // Sort prompts based on filter
            let filteredPrompts = [...examplePrompts];
            if (filter === 'latest') {
                // For latest, take the most recent 15 prompts
                filteredPrompts = examplePrompts.slice(-15);
            } else if (filter === 'popular') {
                // For popular, shuffle and take first 15 prompts
                filteredPrompts = examplePrompts
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 15);
            }
            
            for (let i = 0; i < (filter === 'all' ? 30 : 15); i++) {
                const randomIndex = Math.floor(Math.random() * filteredPrompts.length);
                const prompt = filteredPrompts[randomIndex];
                const category = categories[i % categories.length];
                const timestamp = Date.now() + i;
                
                cards.push(`
                    <div class="image-card" onclick="document.getElementById('image-prompt').value = this.querySelector('.prompt-text').textContent; document.getElementById('image-prompt').focus();">
                        <img src="https://source.unsplash.com/featured/800x800/?${encodeURIComponent(category)}&${timestamp}" 
                             alt="${prompt}" 
                             class="generated-image" 
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://picsum.photos/800/800?random=${timestamp}'">
                        <div class="image-info">
                            <p class="prompt-text">${prompt}</p>
                            <div class="image-actions">
                                <button class="action-btn download-btn" onclick="event.stopPropagation()">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="action-btn share-btn" onclick="event.stopPropagation()">
                                    <i class="fas fa-share"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `);
            }
            return cards.join('');
        };

        const spacesHTML = `
            <div class="spaces-container">
                <div class="hero-section">
                    <h1 class="main-title">Describe your ideas and generate</h1>
                    <p class="subtitle">Transform your words into visual masterpieces: Leverage AI technology to craft breathtaking images.</p>
                    
                    <div class="prompt-container">
                        <div class="input-group">
                            <button class="dice-btn">
                                <i class="fas fa-dice input-icon"></i>
                            </button>
                            <input type="text" id="image-prompt" class="prompt-input" placeholder="Write a prompt to generate">
                            <button id="generate-btn" class="generate-btn">
                                <i class="fas fa-magic"></i> Generate
                            </button>
                        </div>
                    </div>
                </div>

                <div class="generation-section" style="display: none;">
                    <div class="generation-status">
                        <div class="loading-animation">
                            <div class="spinner"></div>
                        </div>
                        <p>Creating your masterpiece...</p>
                        <p class="sub-text">This may take a few moments</p>
                    </div>
                    <div id="current-generation" class="current-generation">
                        <!-- Currently generating image will appear here -->
                    </div>
                </div>

                <div class="explore-section">
                    <h2>Explore Imagine</h2>
                    <div class="filter-tabs">
                        <button class="tab active" data-filter="all">All</button>
                        <button class="tab" data-filter="latest">Latest</button>
                        <button class="tab" data-filter="popular">Popular</button>
                    </div>
                    <div id="generated-images-grid" class="images-grid">
                        ${generateExampleCards()}
                    </div>
                    <div class="load-more" style="text-align: center; margin-top: 2rem;">
                        <button id="load-more-btn" class="generate-btn">
                            <i class="fas fa-plus"></i> Load More
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .spaces-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .hero-section {
                    text-align: center;
                    padding: 4rem 0;
                    background: linear-gradient(135deg, #2a1f4c 0%, #1a1528 100%);
                    border-radius: 20px;
                    margin-bottom: 2rem;
                }
                .main-title {
                    font-size: 2.5rem;
                    color: white;
                    margin-bottom: 1rem;
                }
                .subtitle {
                    color: #a8a8b3;
                    margin-bottom: 2rem;
                }
                .prompt-container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 0 1rem;
                }
                .input-group {
                    display: flex;
                    align-items: center;
                    background: #1a1528;
                    border-radius: 12px;
                    padding: 0.5rem;
                    margin: 0;
                    width: 100%;
                }
                .dice-btn {
                    background: transparent;
                    border: none;
                    color: #a8a8b3;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    transition: color 0.3s;
                }
                .dice-btn:hover {
                    color: #8b3dff;
                }
                .input-icon {
                    font-size: 1.2rem;
                }
                .prompt-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 1rem;
                    font-size: 1rem;
                    width: 100%;
                }
                .generate-btn {
                    background: #8b3dff;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                }
                .generate-btn:hover {
                    background: #9f5bff;
                }
                .generation-section {
                    text-align: center;
                    margin: 2rem 0;
                    background: linear-gradient(135deg, #2a1f4c 0%, #1a1528 100%);
                    border-radius: 20px;
                    padding: 2rem;
                }
                .generation-status {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }
                .loading-animation {
                    position: relative;
                    width: 80px;
                    height: 80px;
                }
                .spinner {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    border: 4px solid transparent;
                    border-top: 4px solid #8b3dff;
                    border-right: 4px solid #8b3dff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .spinner:before {
                    content: '';
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    right: 4px;
                    bottom: 4px;
                    border: 4px solid transparent;
                    border-top: 4px solid #ff3d9e;
                    border-right: 4px solid #ff3d9e;
                    border-radius: 50%;
                    animation: spin-reverse 0.8s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(-360deg); }
                }
                .generation-status p {
                    color: white;
                    font-size: 1.2rem;
                    margin: 0;
                }
                .generation-status .sub-text {
                    color: #a8a8b3;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                }
                .placeholder-image {
                    width: 100%;
                    height: 400px;
                    background: linear-gradient(45deg, #1a1528 25%, #2a1f4c 25%, #2a1f4c 50%, #1a1528 50%, #1a1528 75%, #2a1f4c 75%, #2a1f4c);
                    background-size: 20px 20px;
                    animation: move-background 2s linear infinite;
                    border-radius: 12px;
                    margin-top: 1rem;
                }
                @keyframes move-background {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                }
                .generating {
                    background: #1a1528;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }
                .generating .prompt-text {
                    color: white;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    text-align: left;
                }
                .filter-tabs {
                    margin: 2rem 0;
                }
                .tab {
                    background: transparent;
                    border: none;
                    color: #a8a8b3;
                    padding: 0.5rem 1rem;
                    margin-right: 1rem;
                    cursor: pointer;
                }
                .tab.active {
                    color: white;
                    border-bottom: 2px solid #8b3dff;
                }
                .images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                .image-card {
                    background: #1a1528;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.3s;
                    min-height: 350px;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                    position: relative;
                }
                .image-card:hover {
                    transform: translateY(-5px);
                }
                .image-card:hover::after {
                    content: "Click to use this prompt";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(139, 61, 255, 0.9);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }
                .image-card:hover .generated-image {
                    opacity: 0.7;
                }
                .generated-image {
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                    background: #1a1528;
                    transition: opacity 0.3s;
                }
                .image-info {
                    padding: 1rem;
                }
                .prompt-text {
                    color: #a8a8b3;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }
                .image-actions {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: flex-end;
                }
                .action-btn {
                    background: transparent;
                    border: none;
                    color: #8b3dff;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: background 0.3s;
                }
                .action-btn:hover {
                    background: rgba(139, 61, 255, 0.1);
                }
            </style>
        `;
        mainContent.innerHTML = spacesHTML;

        // Set up event listeners
        const filterTabs = document.querySelectorAll('.tab');
        const imagesGrid = document.getElementById('generated-images-grid');
        let currentFilter = 'all';

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Get the filter value
                const filter = tab.getAttribute('data-filter');
                currentFilter = filter;

                // Clear and regenerate the grid with filtered content
                imagesGrid.innerHTML = '';
                imagesGrid.innerHTML = generateExampleCards(filter);
            });
        });

        // Update Load More functionality to respect current filter
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.addEventListener('click', () => {
            const newCards = generateExampleCards(currentFilter);
            imagesGrid.insertAdjacentHTML('beforeend', newCards);
        });

        // Update infinite scroll to respect current filter
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                const newCards = generateExampleCards(currentFilter);
                imagesGrid.insertAdjacentHTML('beforeend', newCards);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Set up event listeners for the generate button and prompt input
        const generateBtn = document.getElementById('generate-btn');
        const promptInput = document.getElementById('image-prompt');
        const diceBtn = document.querySelector('.dice-btn');
        const generationSection = document.querySelector('.generation-section');
        const currentGeneration = document.getElementById('current-generation');

        generateBtn.addEventListener('click', async () => {
            const prompt = promptInput.value.trim();
            if (prompt) {
                // Show generation section with loading animation
                generationSection.style.display = 'block';
                currentGeneration.innerHTML = '';
                
                // Create a temporary card for the generating image
                const tempCard = document.createElement('div');
                tempCard.className = 'image-card generating';
                tempCard.innerHTML = `
                    <div class="generation-status">
                        <div class="loading-animation">
                            <div class="spinner"></div>
                        </div>
                        <p>Creating your masterpiece...</p>
                        <p class="sub-text">This may take a few moments</p>
                    </div>
                    <div class="placeholder-image"></div>
                    <div class="image-info">
                        <p class="prompt-text">"${prompt}"</p>
                    </div>
                `;
                currentGeneration.appendChild(tempCard);

                // Scroll to the generation section with smooth animation
                generationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Generate the image
                await generateImage(prompt);
                
                // Hide generation section after completion
                generationSection.style.display = 'none';
                promptInput.value = '';
            }
        });

        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const prompt = promptInput.value.trim();
                if (prompt) {
                    generateBtn.click();
                }
            }
        });

        // Add click event listener for dice button
        diceBtn.addEventListener('click', () => {
            const randomPrompt = getRandomPrompt();
            promptInput.value = randomPrompt;
            promptInput.focus();
        });

        // Remove input wrapper when in spaces mode
        const inputWrapper = document.querySelector('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.style.display = 'none';
        }
    }

    // Function to fetch images from an API
    async function fetchImages() {
        const imagesContainer = document.querySelector('.images-container');
        imagesContainer.innerHTML = '<div class="loading">Loading images...</div>';

        try {
            const response = await fetch('https://api.example.com/ai-generated-images'); // Replace with actual API endpoint
            const data = await response.json();

            if (data.images && data.images.length > 0) {
                imagesContainer.innerHTML = data.images.map(image => `
                    <div class="image-card">
                        <img src="${image.url}" alt="${image.title}" class="image">
                        <div class="image-title">${image.title}</div>
                    </div>
                `).join('');
            } else {
                imagesContainer.innerHTML = '<div class="error">No images found.</div>';
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            imagesContainer.innerHTML = '<div class="error">Error loading images. Please try again later.</div>';
        }
    }

    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Clear existing event listeners
        const oldSpacesLink = document.getElementById('spaces-link');
        const oldChatLink = document.getElementById('chat-link');
        
        const newSpacesLink = oldSpacesLink.cloneNode(true);
        const newChatLink = oldChatLink.cloneNode(true);
        
        oldSpacesLink.parentNode.replaceChild(newSpacesLink, oldSpacesLink);
        oldChatLink.parentNode.replaceChild(newChatLink, oldChatLink);
        
        // Add click event listeners
        newSpacesLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Spaces clicked');
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            createSpacesInterface();
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
    window.setupSpacesEventListeners = setupEventListeners;
});