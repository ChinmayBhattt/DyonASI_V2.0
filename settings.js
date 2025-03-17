document.addEventListener('DOMContentLoaded', function() {
    // Get the settings link and create settings panel
    const settingsLink = document.querySelector('.dropdown-item:first-child');
    const mainContent = document.querySelector('.main-content');
    
    // Create settings panel
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';
    settingsPanel.innerHTML = `
        <div class="settings-panel-header">
            <h2>Settings</h2>
            <button class="close-settings">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="settings-panel-content">
            <div class="settings-section">
                <h3>Appearance</h3>
                <div class="setting-item">
                    <span>Theme</span>
                    <select id="theme-selector">
                        <option value="system">System</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h3>Chat Settings</h3>
                <div class="setting-item">
                    <span>Message Sound</span>
                    <label class="switch">
                        <input type="checkbox" id="message-sound">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>Auto-scroll to bottom</span>
                    <label class="switch">
                        <input type="checkbox" id="auto-scroll" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="settings-section">
                <h3>Language</h3>
                <div class="setting-item">
                    <span>Interface Language</span>
                    <select id="interface-language">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h3>Privacy</h3>
                <div class="setting-item">
                    <span>Save Chat History</span>
                    <label class="switch">
                        <input type="checkbox" id="save-history" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Add settings panel to main container
    document.querySelector('.container').appendChild(settingsPanel);

    // Function to close settings panel
    const closeSettingsPanel = () => {
        settingsPanel.classList.remove('show');
        mainContent.classList.remove('blur');
    };

    // Handle settings link click
    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent click from immediately closing the panel
        settingsPanel.classList.add('show');
        mainContent.classList.add('blur');
    });

    // Handle close button click
    const closeBtn = settingsPanel.querySelector('.close-settings');
    closeBtn.addEventListener('click', closeSettingsPanel);

    // Close settings when clicking outside the panel
    document.addEventListener('click', function(e) {
        if (settingsPanel.classList.contains('show') && 
            !settingsPanel.contains(e.target) && 
            !settingsLink.contains(e.target)) {
            closeSettingsPanel();
        }
    });

    // Prevent clicks inside settings panel from closing it
    settingsPanel.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Handle theme selection
    const themeSelector = document.getElementById('theme-selector');
    themeSelector.addEventListener('change', function() {
        const selectedTheme = this.value;
        document.body.className = selectedTheme === 'system' ? '' : `${selectedTheme}-mode`;
        localStorage.setItem('theme', selectedTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelector.value = savedTheme;
    if (savedTheme !== 'system') {
        document.body.className = `${savedTheme}-mode`;
    }

    // Handle other settings changes
    const settingsToggles = {
        'message-sound': true,
        'auto-scroll': true,
        'save-history': true
    };

    Object.keys(settingsToggles).forEach(settingId => {
        const toggle = document.getElementById(settingId);
        const savedValue = localStorage.getItem(settingId);
        
        if (savedValue !== null) {
            toggle.checked = savedValue === 'true';
        } else {
            toggle.checked = settingsToggles[settingId];
        }

        toggle.addEventListener('change', function() {
            localStorage.setItem(settingId, this.checked);
        });
    });
}); 