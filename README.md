# Immersive Prompt

*Read this in other languages: [简体中文](./docs/i18n/README.zh_CN.md), [日本語](./docs/i18n/README.ja_JP.md)*

A Chrome extension that enhances user interaction efficiency on various AI chat platforms (such as ChatGPT, Claude, Gemini, etc.).

## 🌟 Core Features

- **Quick Prompt Insertion**: Insert high-quality prompts into AI chat interfaces with one click
- **Multi-language Support**: Interface and prompts available in multiple languages (English, Chinese, etc.)
- **Local/Remote Storage**: Save your prompts locally or in the cloud for access anytime, anywhere
- **Prompt Marketplace**: Browse and download popular prompts shared by the community
- **Template System**: Create dynamic prompt templates using variables for better reusability
- **Seamless Integration**: Integrates seamlessly with mainstream AI conversation platforms (ChatGPT, Claude, Gemini, etc.)

## 📦 Installation

### Development Version

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/immersive-prompt.git
   cd immersive-prompt
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Build the extension
   ```bash
   yarn build
   ```

4. Load the extension in Chrome
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder in the project

### Install from Chrome Web Store
*(Coming soon)*

## 🚀 Usage

1. **Visit AI Chat Websites**: Open supported AI chat websites (such as ChatGPT, Claude, Gemini, etc.)

2. **Open the Plugin Interface**: Click the floating button in the bottom right corner of the chat interface to open the main interface

3. **Browse and Use Prompts**:
   - Browse prompts from different categories
   - Click "Use" to directly insert a prompt into the chat input box
   - Use the search box to quickly find specific prompts

4. **Create New Prompts**:
   - Click the "Add New Prompt" button
   - Fill in title, content, description, and other information
   - Support for creating template variables using the `{{variable_name}}` syntax

5. **Manage Your Prompts**:
   - Favorite commonly used prompts
   - Edit or delete existing prompts
   - Import/export prompt data

## 🔧 Technology Stack

- TypeScript
- React
- Chrome Extensions API
- Tailwind CSS

## 🤝 Contribution Guidelines

Issues and feature requests are welcome! If you want to contribute code, please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details

---

**Immersive Prompt** - Make AI conversations more efficient, smarter, and personalized!
