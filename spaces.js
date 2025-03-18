document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    const spacesLink = document.getElementById('spaces-link');
    const chatLink = document.getElementById('chat-link');
    
    const STABILITY_API_KEY = "";
    const STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

    // Store the original chat interface
    let chatInterface = null;

    // Function to save chat interface
    function saveChatInterface() {
        if (!chatInterface) {
            chatInterface = mainContent.innerHTML;
        }
    }

    // Function to restore chat interface
    function restoreChatInterface() {
        console.log('Restoring chat interface');
        if (chatInterface) {
            mainContent.innerHTML = chatInterface;
            // Remove any spaces-specific event listeners
            window.removeEventListener('scroll', handleScroll);
            // Re-initialize any chat-specific functionality if needed
            const inputWrapper = document.querySelector('.input-wrapper');
            if (inputWrapper) {
                inputWrapper.style.display = 'block';
            }
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

                // Create image card for user-generated image
                const imageCard = document.createElement('div');
                imageCard.className = 'image-card';
                imageCard.innerHTML = `
                    <img src="${imageUrl}" alt="${prompt}" class="generated-image" loading="lazy">
                    <div class="image-info">
                        <p class="prompt-text">${prompt}</p>
                        <div class="image-actions">
                            <button class="action-btn download-btn" onclick="event.stopPropagation(); fetch('${imageUrl}').then(resp => resp.blob()).then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'generated-image.png';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                            });">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn share-btn">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                `;

                // Show user images section if hidden
                const userImagesSection = document.getElementById('user-images-section');
                userImagesSection.style.display = 'block';

                // Add the generated image to the user's grid
                const userGrid = document.getElementById('user-generated-grid');
                userGrid.insertBefore(imageCard, userGrid.firstChild);
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

        // Add image loading handler function
        const handleImageLoad = (img) => {
            img.classList.add('loaded');
        };

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
                filteredPrompts = examplePrompts.slice(-15);
            } else if (filter === 'popular') {
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
                        <div class="image-container">
                            <img src="https://source.unsplash.com/featured/800x800/?${encodeURIComponent(category)}&${timestamp}" 
                                 alt="${prompt}" 
                                 class="generated-image" 
                                 loading="lazy"
                                 crossorigin="anonymous"
                                 onload="this.classList.add('loaded')"
                                 onerror="this.onerror=null; this.src='https://picsum.photos/800/800?random=${timestamp}'">
                        </div>
                        <div class="image-info">
                            <p class="prompt-text">${prompt}</p>
                            <div class="image-actions">
                                <button class="action-btn download-btn" onclick="event.stopPropagation(); (async () => {
                                    try {
                                        const img = this.closest('.image-card').querySelector('img');
                                        const response = await fetch(img.src);
                                        const blob = await response.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'explore-image.jpg';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Error downloading image:', error);
                                        alert('Failed to download image. Please try again.');
                                    }
                                })();">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="action-btn share-btn" onclick="event.stopPropagation();">
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
                                <i class="fas fa-dice"></i>
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
                </div>

                <div id="user-images-section" class="user-images-section" style="display: none;">
                    <h2>Your Images</h2>
                    <div id="user-generated-grid" class="images-grid">
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
                    padding: 1rem;
                }

                @media (max-width: 768px) {
                    .spaces-container {
                        padding: 0.5rem;
                    }
                }

                .hero-section {
                    text-align: center;
                    padding: 2rem 1rem;
                    background: #000000;
                    border: 1px solid #333;
                    border-radius: 20px;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .hero-section {
                        padding: 1.5rem 0.5rem;
                        border-radius: 12px;
                    }
                }

                .main-title {
                    font-size: clamp(1.5rem, 5vw, 2.5rem);
                    color: white;
                    margin-bottom: 1rem;
                    padding: 0 1rem;
                }

                .subtitle {
                    color: #a8a8b3;
                    margin-bottom: 2rem;
                    font-size: clamp(0.9rem, 3vw, 1rem);
                    padding: 0 1rem;
                }

                .prompt-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .input-group {
                    display: flex;
                    align-items: center;
                    background: #111111;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 0.5rem;
                    margin: 0;
                    width: 100%;
                    position: relative;
                }

                .dice-btn {
                    background: transparent;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    transition: color 0.3s;
                    position: absolute;
                    left: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .dice-btn:hover {
                    color: #fff;
                }

                .input-icon {
                    font-size: 1.2rem;
                }

                .prompt-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 1rem 1rem 1rem 3rem;
                    font-size: 1rem;
                    width: 100%;
                }

                .generate-btn {
                    background: #111111;
                    color: white;
                    border: 1px solid #333;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                    margin-left: 8px;
                }

                .generate-btn:hover {
                    background: #222222;
                    border-color: #444;
                }

                .images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-top: 2rem;
                }

                @media (max-width: 640px) {
                    .images-grid {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                        gap: 0.75rem;
                    }

                    .image-card {
                        min-height: 250px;
                    }

                    .generated-image {
                        height: 150px;
                    }
                }

                .filter-tabs {
                    margin: 1.5rem 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .tab {
                    background: transparent;
                    border: none;
                    color: #888;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: clamp(0.8rem, 2.5vw, 1rem);
                    transition: color 0.3s;
                }

                .tab:hover {
                    color: #fff;
                }

                .tab.active {
                    color: #fff;
                    border-bottom: 2px solid #fff;
                }

                .generation-section {
                    text-align: center;
                    margin: 1.5rem auto;
                    background: #111111;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 1.5rem;
                    max-width: min(400px, 90%);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .prompt-text {
                    color: #a8a8b3;
                    font-size: clamp(0.8rem, 2.5vw, 0.9rem);
                    margin-bottom: 1rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .image-info {
                    padding: 0.75rem;
                }

                @media (max-width: 480px) {
                    .image-info {
                        padding: 0.5rem;
                    }

                    .action-btn {
                        padding: 0.35rem;
                    }
                }

                .user-images-section h2,
                .explore-section h2 {
                    color: white;
                    margin-bottom: 1rem;
                    font-size: clamp(1.2rem, 4vw, 1.5rem);
                }

                @media (prefers-reduced-motion: reduce) {
                    .image-card {
                        transition: none;
                    }

                    .spinner {
                        animation: none;
                    }

                    .spinner:before {
                        animation: none;
                    }
                }

                @media (hover: none) {
                    .image-card:hover {
                        transform: none;
                    }

                    .image-card:hover::after {
                        display: none;
                    }

                    .image-card:hover .generated-image {
                        opacity: 1;
                    }
                }
                .generation-status {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .loading-animation {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    margin-bottom: 0.5rem;
                }
                .spinner {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border: 3px solid transparent;
                    border-top: 3px solid #fff;
                    border-right: 3px solid #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .spinner:before {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    right: 3px;
                    bottom: 3px;
                    border: 3px solid transparent;
                    border-top: 3px solid #666;
                    border-right: 3px solid #666;
                    border-radius: 50%;
                    animation: spin-reverse 0.8s linear infinite;
                }
                .generation-status p {
                    color: white;
                    font-size: 1rem;
                    margin: 0;
                }
                .generation-status .sub-text {
                    color: #a8a8b3;
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                }
                .placeholder-image {
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(45deg, #1a1528 25%, #2a1f4c 25%, #2a1f4c 50%, #1a1528 50%, #1a1528 75%, #2a1f4c 75%, #2a1f4c);
                    background-size: 10px 10px;
                    animation: move-background 1s linear infinite;
                    border-radius: 8px;
                    margin-top: 0.5rem;
                }
                .generating {
                    background: transparent;
                    padding: 0;
                    margin-top: 0;
                }
                .generating .prompt-text {
                    color: #a8a8b3;
                    font-size: 0.9rem;
                    margin: 0.5rem 0 0 0;
                    text-align: center;
                }
                .image-card {
                    background: #111111;
                    border: 1px solid #333;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                    min-height: 350px;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                    position: relative;
                }
                .image-card:hover {
                    transform: translateY(-5px);
                    border-color: #444;
                }
                .image-card:hover::after {
                    content: "Click to use this prompt";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    z-index: 2;
                }
                .generated-image {
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                    background: #111111;
                    opacity: 0;
                    transition: opacity 0.5s ease-in-out;
                }
                .generated-image.loaded {
                    opacity: 1;
                }
                .image-card:hover .generated-image {
                    opacity: 0.8;
                }
                .image-info {
                    padding: 0.75rem;
                    background: #111111;
                    border-top: 1px solid #333;
                }
                .prompt-text {
                    color: #fff;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .image-actions {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: flex-end;
                }
                .action-btn {
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: background 0.3s;
                }
                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .user-images-section {
                    margin: 2rem 0;
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

        generateBtn.addEventListener('click', async () => {
            const prompt = promptInput.value.trim();
            if (prompt) {
                // Show generation section with loading animation
                generationSection.style.display = 'block';
                
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

    // Add these functions at the start of the file, after the initial declarations
    async function downloadImage(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image');
        }
    }

    async function shareImage(imageUrl, prompt) {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Generated Image',
                    text: prompt,
                    url: imageUrl
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const tempInput = document.createElement('input');
                document.body.appendChild(tempInput);
                tempInput.value = imageUrl;
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                alert('Image URL copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            alert('Failed to share image');
        }
    }
});
