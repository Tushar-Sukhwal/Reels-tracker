# Reels & Shorts Tracker Chrome Extension

A beautiful Chrome extension that tracks your Instagram Reels and YouTube Shorts viewing habits, helping you understand your consumption patterns.

## ✨ Features

- 📊 **Real-time tracking** of Instagram Reels and YouTube Shorts
- ⏱️ **Time spent** tracking for each platform
- 📈 **Video count** for total videos watched
- 📅 **Daily statistics** to see today's activity
- 🎨 **Modern, beautiful UI** with smooth animations
- 💾 **Local storage** - your data stays private
- 🔄 **Auto-refresh** stats every 30 seconds
- 🚀 **Manifest V3** compliant for future-proof compatibility

## 🎯 What It Tracks

### Instagram Reels
- Number of reels watched
- Total time spent watching reels
- Daily breakdown of reel consumption

### YouTube Shorts
- Number of shorts watched
- Total time spent watching shorts  
- Daily breakdown of shorts consumption

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone or download** this repository to your local machine
2. **Install dependencies** and build the extension:
   ```bash
   npm install
   npm run build
   ```
3. **Open Chrome** and navigate to `chrome://extensions/`
4. **Enable "Developer mode"** using the toggle in the top right corner
5. **Click "Load unpacked"** and select the project folder
6. **Pin the extension** to your toolbar for easy access

### Required Icons

Before loading the extension, you'll need to add icon files to the `icons/` folder:
- `icon-16.png` (16x16 pixels)
- `icon-48.png` (48x48 pixels)  
- `icon-128.png` (128x128 pixels)

You can create simple square icons with a video/camera theme.

## 📱 Usage

1. **Visit Instagram** and watch some reels, or go to **YouTube** and watch some shorts
2. **Click the extension icon** in your Chrome toolbar to view your stats
3. **See your consumption patterns** with beautiful visualizations
4. **Use the refresh button** to get the latest stats
5. **Reset your data** if you want to start fresh

## 🎨 UI Features

- **Gradient backgrounds** with smooth animations
- **Hover effects** on stat cards
- **Loading animations** while fetching data
- **Success/error notifications** for user actions
- **Responsive design** that works on different screen sizes
- **Keyboard shortcuts** (Ctrl/Cmd + R to refresh)

## 🔧 Technical Details

### Architecture
- **Manifest V3** service worker for background processing
- **Content scripts** for Instagram and YouTube integration
- **TypeScript** for type safety and better development experience
- **Modern CSS** with gradients, animations, and responsive design

### Privacy
- All data is stored **locally in your browser**
- **No external servers** or data collection
- **No tracking** of personal information
- Data only includes watch counts and time durations

### Browser Compatibility
- Chrome (Manifest V3 support required)
- Edge (Chromium-based)
- Other Chromium-based browsers

## 🛠️ Development

### Building from Source
```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build

# Watch for changes during development
npm run watch

# Clean build files
npm run clean
```

### Project Structure
```
reels-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── src/
│   ├── background.ts      # Service worker
│   ├── content-instagram.ts # Instagram tracking
│   ├── content-youtube.ts  # YouTube tracking
│   ├── popup.ts           # Popup logic
│   └── index.ts           # Entry point
├── dist/                  # Compiled JavaScript
└── icons/                 # Extension icons
```

## 🐛 Troubleshooting

### Extension Not Tracking
1. Make sure you're on the actual Instagram or YouTube websites
2. Check that the extension has the necessary permissions
3. Try refreshing the page and the extension popup

### Stats Not Updating
1. Click the "Refresh Stats" button in the popup
2. Check browser console for any errors
3. Make sure you're watching videos for at least 2 seconds

### Installation Issues
1. Ensure you've built the TypeScript files (`npm run build`)
2. Check that all icon files are present in the `icons/` folder
3. Verify Chrome Developer Mode is enabled

## 📊 Data Format

The extension stores data in the following format:
```typescript
{
  reels: {
    count: number,      // Total reels watched
    totalTime: number   // Total time in seconds
  },
  shorts: {
    count: number,      // Total shorts watched  
    totalTime: number   // Total time in seconds
  },
  dailyStats: {
    "YYYY-MM-DD": {
      reels: { count: number, totalTime: number },
      shorts: { count: number, totalTime: number }
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] Weekly/monthly statistics
- [ ] Export data to CSV
- [ ] Goals and limits setting
- [ ] More detailed analytics
- [ ] Support for other video platforms
- [ ] Dark/light theme toggle

---

**Built with ❤️ for mindful social media consumption** # Reels-tracker
