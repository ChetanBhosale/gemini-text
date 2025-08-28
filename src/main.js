// ClearView Extension - Modal Opener with Auto Text Capture
(function() {
    'use strict';
    
    let modal = null;
    let isModalOpen = false;
    let capturedText = '';
    let lastFocusedInput = null;
    
    // Track focused input elements
    function trackFocusedInputs() {
        document.addEventListener('focus', function(event) {
            // Track various input types
            if (event.target.matches('input[type="text"], input[type="email"], input[type="search"], input[type="url"], textarea, [contenteditable="true"]')) {
                lastFocusedInput = event.target;
            }
        }, true);
    }
    
    // Capture text from the currently focused input
    function captureTextFromInput() {
        if (lastFocusedInput) {
            let text = '';
            
            // Handle different input types
            if (lastFocusedInput.tagName.toLowerCase() === 'textarea' || 
                lastFocusedInput.tagName.toLowerCase() === 'input') {
                text = lastFocusedInput.value;
            } else if (lastFocusedInput.contentEditable === 'true') {
                text = lastFocusedInput.textContent || lastFocusedInput.innerText;
            }
            
            // Get selected text if available
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && selection.toString().trim()) {
                const selectedText = selection.toString().trim();
                // If selected text is from the focused input, use it instead
                if (lastFocusedInput.contains(selection.focusNode) || 
                    lastFocusedInput === selection.focusNode) {
                    text = selectedText;
                }
            }
            
            if (text && text.trim()) {
                capturedText = text.trim();
                console.log('Captured text:', capturedText);
                return true;
            }
        }
        
        // Fallback: try to get any selected text on the page
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().trim()) {
            capturedText = selection.toString().trim();
            console.log('Captured selected text:', capturedText);
            return true;
        }
        
        return false;
    }
    
    // Create modal HTML
    function createModal() {
        const modalHTML = `
            <div id="clearview-modal" class="clearview-modal">
                <div class="clearview-modal-content">
                    <div class="clearview-modal-header">
                        <h2>ClearView</h2>
                        <div class="header-controls">
                            <div class="keys-dropdown">
                                <button class="keys-dropdown-btn" id="keys-dropdown-btn">⋯</button>
                                <div class="keys-dropdown-content" id="keys-dropdown-content">
                                    <div class="key-input-group">
                                        <input 
                                            type="password" 
                                            id="gemini-api-key" 
                                            class="key-input" 
                                            placeholder="Enter Gemini API key..."
                                        >
                                        <button id="save-api-key" class="save-btn">Save</button>
                                    </div>
                                    <div class="key-status" id="key-status">No key saved</div>
                                </div>
                            </div>
                            <button class="clearview-close-btn" id="clearview-close-btn">&times;</button>
                        </div>
                    </div>
                    <div class="clearview-modal-body">
                        <div class="textarea-section">
                            <label for="user-text">Your Text:</label>
                            <div class="text-input-container">
                                <textarea 
                                    id="user-text" 
                                    class="text-input" 
                                    placeholder="Enter or paste your text here..."
                                    rows="5"
                                ></textarea>
                                <div class="text-capture-info" id="text-capture-info" style="display: none;">
                                    <small>✓ Auto-captured text from input field</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="textarea-section">
                            <label for="prompt-text">Prompt:</label>
                            <textarea 
                                id="prompt-text" 
                                class="text-input" 
                                placeholder="Enter your prompt here..."
                                rows="3"
                            >Make this text good English with proper grammar, spelling, and punctuation. Improve clarity and readability while maintaining the original meaning.</textarea>
                        </div>
                        
                        <div class="action-section">
                            <button id="go-btn" class="go-btn">Go →</button>
                        </div>
                        
                        <div class="result-section" id="result-container" style="display: none;">
                            <label>Result:</label>
                            <div class="result-container">
                                <div id="result-text" class="result-text"></div>
                                <button id="copy-result-btn" class="copy-btn">Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        return document.getElementById('clearview-modal');
    }
    
    // Load API key from storage
    function loadApiKey() {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            const apiKeyInput = document.getElementById('gemini-api-key');
            const statusElement = document.getElementById('key-status');
            
            if (result.geminiApiKey) {
                apiKeyInput.value = result.geminiApiKey;
                statusElement.textContent = 'Key saved ✓';
                statusElement.className = 'key-status saved';
            }
        });
    }
    
    // Save API key
    function saveApiKey() {
        const apiKeyInput = document.getElementById('gemini-api-key');
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey) {
            chrome.storage.local.set({ 'geminiApiKey': apiKey }, () => {
                const statusElement = document.getElementById('key-status');
                statusElement.textContent = 'Key saved successfully! ✓';
                statusElement.className = 'key-status saved';
            });
        }
    }
    
    // Handle Go button click
    async function handleGoClick() {
        const userText = document.getElementById('user-text').value;
        const promptText = document.getElementById('prompt-text').value;
        const goBtn = document.getElementById('go-btn');
        const resultContainer = document.getElementById('result-container');
        const resultText = document.getElementById('result-text');
        const copyBtn = document.getElementById('copy-result-btn');
        
        if (!userText.trim()) {
            alert('Please enter some text in the "Your Text" field.');
            return;
        }
        
        if (!promptText.trim()) {
            alert('Please enter a prompt.');
            return;
        }
        
        // Check if API key is saved
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(['geminiApiKey'], resolve);
        });
        
        if (!result.geminiApiKey) {
            alert('Please save your Gemini API key first. Click the ⋯ button to add it.');
            return;
        }
        
        // Show loading state
        goBtn.disabled = true;
        goBtn.textContent = 'Processing...';
        resultContainer.style.display = 'none';
        
        try {
            // Send message to background script to make API call
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'callGeminiAPI',
                    userText: userText,
                    promptText: promptText,
                    apiKey: result.geminiApiKey
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                });
            });
            
            // Display result
            if (response.result) {
                resultText.textContent = response.result;
                resultContainer.style.display = 'block';
                
                // Add copy functionality
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(response.result).then(() => {
                        const originalText = copyBtn.textContent;
                        copyBtn.textContent = 'Copied!';
                        setTimeout(() => {
                            copyBtn.textContent = originalText;
                        }, 2000);
                    });
                };
            }
            
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            alert('Error processing your request: ' + error.message);
        } finally {
            // Reset button state
            goBtn.disabled = false;
            goBtn.textContent = 'Go →';
        }
    }
    
    // Toggle keys dropdown
    function toggleKeysDropdown() {
        const dropdownContent = document.getElementById('keys-dropdown-content');
        dropdownContent.classList.toggle('show');
    }
    
    // Close keys dropdown when clicking outside
    function closeKeysDropdown(event) {
        const dropdown = document.getElementById('keys-dropdown-btn');
        const dropdownContent = document.getElementById('keys-dropdown-content');
        
        if (!dropdown.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownContent.classList.remove('show');
        }
    }
    
    // Show modal and populate with captured text
    function showModal() {
        if (!modal) {
            modal = createModal();
        }
        
        modal.style.display = 'flex';
        isModalOpen = true;
        
        // Load saved data
        loadApiKey();
        
        // Populate the textarea with captured text if available
        const userTextArea = document.getElementById('user-text');
        const captureInfo = document.getElementById('text-capture-info');
        
        if (capturedText) {
            userTextArea.value = capturedText;
            captureInfo.style.display = 'block';
            // Focus on the textarea and move cursor to end
            setTimeout(() => {
                userTextArea.focus();
                userTextArea.setSelectionRange(userTextArea.value.length, userTextArea.value.length);
            }, 100);
        } else {
            captureInfo.style.display = 'none';
            // Focus on the textarea
            setTimeout(() => {
                userTextArea.focus();
            }, 100);
        }
        
        // Add event listeners
        const closeBtn = document.getElementById('clearview-close-btn');
        const saveBtn = document.getElementById('save-api-key');
        const keysDropdownBtn = document.getElementById('keys-dropdown-btn');
        const goBtn = document.getElementById('go-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', hideModal);
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', saveApiKey);
        }
        
        if (keysDropdownBtn) {
            keysDropdownBtn.addEventListener('click', toggleKeysDropdown);
        }
        
        if (goBtn) {
            goBtn.addEventListener('click', handleGoClick);
        }
        
        // Add event listener for clicking outside modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
        
        // Add event listener for Enter key in API key input
        const apiKeyInput = document.getElementById('gemini-api-key');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveApiKey();
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', closeKeysDropdown);
    }
    
    // Hide modal
    function hideModal() {
        if (modal) {
            modal.style.display = 'none';
            isModalOpen = false;
        }
        
        // Clear captured text after modal closes
        capturedText = '';
        
        // Remove document click listener
        document.removeEventListener('click', closeKeysDropdown);
    }
    
    // Toggle modal
    function toggleModal() {
        if (isModalOpen) {
            hideModal();
        } else {
            showModal();
        }
    }
    
    // Keyboard event handler
    function handleKeydown(event) {
        // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux) - Open modal
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifierKey = isMac ? event.metaKey : event.ctrlKey;
        
        if (modifierKey && event.key === 'k') {
            event.preventDefault();
            event.stopPropagation();
            
            // Capture text before opening modal
            captureTextFromInput();
            toggleModal();
        }
        
        // Close modal with Escape key
        if (event.key === 'Escape' && isModalOpen) {
            hideModal();
        }
    }
    
    // Initialize
    function init() {
        // Track focused input elements
        trackFocusedInputs();
        
        // Add keyboard event listener
        document.addEventListener('keydown', handleKeydown, true);
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();