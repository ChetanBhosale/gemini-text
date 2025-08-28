# ClearView Chrome Extension

A simple Chrome extension that provides a clean interface for text editing with Gemini API key management.

## ✨ Features

- 🚀 **Universal**: Works on any webpage
- 📝 **Text Editing**: Two textareas - one for your text, one for prompts
- 🔑 **API Key Management**: Dropdown menu for storing Gemini API keys
- ⌨️ **Keyboard Shortcuts**: 
  - **Mac**: `Cmd + K` (open modal)
  - **Windows/Linux**: `Ctrl + K` (open modal)
- 🎯 **Simple Design**: Clean, minimal interface without fancy colors
- 🔒 **Non-intrusive**: Doesn't interfere with page functionality
- 🎨 **Responsive**: Works on all screen sizes

## 🚀 How It Works

### Opening the Modal
1. **Navigate to any webpage**
2. **Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)**
3. **Modal opens** with two textareas

### Text Areas
- **Top textarea**: Enter or paste your text here
- **Bottom textarea**: Contains a default prompt for improving English text
- **Default prompt**: "Make this text good English with proper grammar, spelling, and punctuation. Improve clarity and readability while maintaining the original meaning."

### API Key Management
1. **Click the "⋯" button** in the top-right corner of the modal
2. **Enter your Gemini API key** in the password field
3. **Click "Save"** to store the key
4. **Key is securely stored** in Chrome's local storage

## 🎨 UI Features

- **Simple Design**: Clean white background with basic borders
- **Two Textareas**: Organized layout for text input and prompts
- **Keys Dropdown**: Compact 3-dot button that expands to show key input
- **Responsive Layout**: Adapts to different screen sizes
- **Minimal Colors**: Simple grays and whites for a clean look

## 📁 Installation

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `extension` folder
5. **Pin the extension** to your toolbar for easy access

## 🔧 Usage

### Opening the Modal
1. Go to any website
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. Modal opens with two textareas

### Managing API Keys
1. Click the "⋯" button in the modal header
2. Enter your Gemini API key in the password field
3. Click "Save" or press Enter
4. Key is saved and status updates

### Closing the Modal
- Click the × button
- Click outside the modal
- Press `Escape` key
- Use the same keyboard shortcut again

## 🏗️ Architecture

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── src/
│   ├── main.js           # Main content script with modal logic
│   └── modal.css         # Simple, clean styling
└── README.md             # This file
```

## 🎯 Technical Details

- **Content Scripts**: Run on all web pages
- **Chrome Storage**: Securely stores Gemini API keys
- **Keyboard Events**: Global event listeners for shortcuts
- **DOM Manipulation**: Creates and manages modal elements
- **Simple CSS**: Clean, minimal styling without animations
- **Cross-platform**: Detects OS and uses appropriate modifier keys

## 🔒 Security Features

- **Password Field**: API keys are hidden by default
- **Local Storage**: Data stays on your device
- **No External Calls**: Extension doesn't send data anywhere
- **Permission Scoped**: Only requests necessary permissions

## 🎨 Customization

The extension is easily customizable:

- **Modal Content**: Edit the HTML structure in `src/main.js`
- **Styling**: Modify `src/modal.css` for different looks
- **Shortcuts**: Change keyboard shortcuts in the event handler
- **Default Prompt**: Update the default prompt text in the modal

## 🌐 Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Other Chromium-based browsers

## 🚀 Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the **🔄 Reload** button on the ClearView extension
4. Test your changes on any webpage

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension!
# gemini-text
