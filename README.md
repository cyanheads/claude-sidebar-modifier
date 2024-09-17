# 🤖 Claude.ai Sidebar Disabler

## 🎯 Description

This Firefox extension disables the sidebar functionality on Claude.ai, providing a cleaner and more focused browsing experience. It's particularly useful for users who prefer a distraction-free interface or want to maximize screen real estate.

## ✨ Features

- 🚫 Completely disables the sidebar
- 🖥️ Maximizes usable screen space
- 🚀 Lightweight and efficient
- 🔒 Can only access https://claude.ai/

## 🛠️ Installation

1. Clone this repository or download the ZIP file.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click on "Load Temporary Add-on".
4. Select the `manifest.json` file from the project directory.

## 📁 Project Structure

```
firefox-sidebar-disable/
├── manifest.json
├── sidebar-disable.js
├── background.js
├── sidebar-disable.css
├── icon-48.png
└── icon-96.png
```

## 🔧 Development

To modify the extension:

1. Edit the relevant files (`sidebar-disable.js` or `sidebar-disable.css`).
2. Reload the extension in Firefox (go to `about:debugging`, find the extension, and click "Reload").
3. Refresh the page to see your changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⚠️ **Disclaimer**: This extension modifies core functionality on Claude.ai. Use at your own risk.