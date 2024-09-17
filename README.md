# 🤖 Claude.ai Sidebar Adjuster

## 🎯 Description

This Firefox extension allows you to adjust the sidebar width on Claude.ai, providing a customizable and more focused browsing experience. You can also completely disable the sidebar from popping up. Useful for users who want to optimize their screen real estate or prefer a specific sidebar width.

## ✨ Features

- � Adjust sidebar width using a slider
- 📌 Pin or unpin the sidebar
- 🚫 Completely remove the sidebar
- 🚀 Lightweight and efficient
- 🔒 Can only access https://claude.ai/

## 🛠️ Installation

1. Clone this repository or download the ZIP file.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click on "Load Temporary Add-on".
4. Select the `manifest.json` file from the project directory.

## 📁 Project Structure

```
claude-sidebar-adjuster/
├── manifest.json
├── sidebar-disable.js
├── background.js
├── sidebar-disable.css
├── popup.html
├── popup.js
├── icon-48.png
└── icon-96.png
```

## 🔧 Usage

1. Visit a Claude.ai page.
2. Click on the extension icon in the Firefox toolbar to open the popup.
3. Use the slider to adjust the sidebar width.
4. Click the "Pin Sidebar" or "Unpin Sidebar" button to toggle the sidebar's pinned state.
5. Your settings will be automatically applied and saved.

## 👨‍💻 Development

To modify the extension:

1. Edit the relevant files (`sidebar-disable.js`, `popup.js`, `background.js`, etc.).
2. Reload the extension in Firefox (go to `about:debugging`, find the extension, and click "Reload").
3. Refresh the Claude.ai page to see your changes.

## 🐛 Troubleshooting

If you encounter any issues:

1. Ensure you're using the latest version of Firefox.
2. Try disabling and re-enabling the extension.
3. Clear your browser cache and cookies for Claude.ai.
4. If problems persist, please open an issue in this repository with a detailed description of the problem.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⚠️ **Disclaimer**: This extension modifies functionality on Claude.ai. Use at your own risk.