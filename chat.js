// Function to restore chat interface
window.restoreChatInterface = function() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Create chat container structure
    mainContent.innerHTML = `
        <div class="messages-container" id="messages-container">
            <div class="message ai-message">
                <p>Hi, I'm DyonASI! How can I assist you today?</p>
            </div>
        </div>
        <div class="input-wrapper" style="display: flex;">
            <textarea class="input-field" placeholder="Type your message here..." rows="1"></textarea>
            <button class="send-btn">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;

    // Initialize chat functionality
    window.initializeChat();
}; 