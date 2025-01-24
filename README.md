# Twitter Engagement Assistant Chrome Extension 🚀

This Chrome extension helps users efficiently engage on Twitter with customizable features like auto-reply generation, alarm notifications, and more. Stay active, organized, and productive with ease!

---

## 📹 Demo Video

https://github.com/user-attachments/assets/2e5c09f9-ce64-457f-987e-18ff91f5957b


---

## 📋 Features
- **AI-Powered Reply Generation:**
  - Supports two models: **Gemini** and **Grok**.
  - Customize tone, language, and length of replies.
- **Alarm Notification System:**
  - Notify on reply generation with a custom timer.
  - Continuous notifications for periodic reminders.
- **Multi-API Key Management:**
  - Add, edit, and delete API keys for Gemini and Grok.
  - Save and toggle between API keys easily.
- **Custom Prompts:**
  - Add personalized prompts for AI-generated replies.
- **Color Customization:**
  - Change the extension's theme color for better UI personalization.
- **Notifications:**
  - Receive Chrome notifications with large banners and buttons.

---

## 🛠 Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/hanzlaahmadcheema/X-Twitter-Auto-Reply-10x-Extension.git
Open Google Chrome and navigate to chrome://extensions/.
Enable Developer Mode (toggle in the top-right corner).
Click Load unpacked and select the extension folder.
🔧 Usage
Open the extension by clicking its icon in the Chrome toolbar.
Configure your settings:Add API keys for Gemini and Grok.
Choose your preferred reply tone and length.
Enable alarms for notifications.
Generate replies directly from Twitter or use the alarm feature to stay active.

---

## 📂 File Structure
```plaintext
├── manifest.json          # Metadata and configuration for the Chrome extension
├── background.js          # Service worker for alarms and notifications
├── contentScript.js       # Injected script for interacting with Twitter
├── popup.html             # HTML for the popup interface
├── popup.js               # JavaScript for popup functionality
├── styles/
│   ├── popup.css          # Stylesheet for popup UI
├── icons/                 # Extension icons
│   ├── icon-16.png        # 16x16 icon
│   ├── icon-48.png        # 48x48 icon
│   ├── icon-128.png       # 128x128 icon
├── sounds/
│   ├── alarm.mp3          # Alarm sound file
├── images/
│   ├── x-notification-banner.png  # Notification banner image

```

📝 Configuration
Alarm Settings
Notify on Generate: Triggers an alarm after reply generation.
Continuous Notification: Sends periodic reminders.
Customizable Timer: Set your desired time interval in minutes.

📜 Permissions
This extension requires the following Chrome permissions:

Alarms: To handle periodic notifications.
Notifications: To show reminders and updates.
Storage: To save user preferences (API keys, settings, etc.).

💻 Contributing
Fork the repository.
Create a new branch:git checkout -b feature-name
Commit your changes:git commit -m \"Add some feature\"
Push to the branch:git push origin feature-name
Open a Pull Request.

🤝 Support
For issues and feature requests, open an issue on the GitHub repository.

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

🌟 Acknowledgments
Powered by Gemini and Grok AI models.
Special thanks to the open-source community for inspiration and tools.

📞 Contact
Feel free to reach out via:

Email: hanzlaahmad100@gmail.com
GitHub: @hanzlaahmadcheema
