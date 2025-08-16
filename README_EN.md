# 中小学语文示范诵读库

A web application for displaying and playing audio readings of Chinese language texts for primary and secondary schools.

## Project Introduction

This project is a web-based audio playback platform specifically designed to showcase reading audio resources for Chinese language texts in primary and secondary schools. It provides browsing functions for audio resources classified by grade and semester, as well as search and pagination features, allowing users to easily find and play the required text reading audio.

## Features

- 🎵 Audio Playback: Supports online playback of text reading audio
- 📚 Category Browsing: Audio resources classified by grade and semester
- 🔍 Search Function: Supports searching for audio resources by text title
- 📄 Pagination Display: Displays 15 resources per page to avoid page lag
- 🎛️ Playback Mutual Exclusion: Only one audio can be played at a time, automatically stopping others
- 🎨 Responsive Design: Adapts to different screen sizes, supports mobile browsing
- ⚡ Performance Optimization: Uses pagination loading technology to improve page performance
- ⌨️ Keyboard Support: Supports spacebar to control play/pause
- 📁 Local Loading: Supports loading data directly from the local file system
- 📊 Playback Status Tracking: Automatically saves playback progress and completion status

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- LocalStorage

## Project Structure

```
├── index.html         # Main page
├── list.json          # Audio resource data file
├── server.py          # Local development server script
├── README.md          # Project documentation (Chinese)
├── README_EN.md       # Project documentation (English)
├── LICENSE            # License file
├── .gitignore         # Git ignore file configuration
└── opus/              # Audio files directory
    ├── 1-1-1.opus
    ├── 1-1-2.opus
    └── ...
```

## Data Format

Audio resource data is stored in the `list.json` file in the following format:

```json
[
  {
    "src": "opus/1-1-1.opus",
    "年级": "1",
    "学期": "1",
    "课文序号": "第1课",
    "课文标题": "秋天天气凉了树叶黄了"
  },
  ...
]
```

## Custom Configuration

### Modifying Items Per Page

Find the following code in the [index.html](index.html) file and modify the value:

```javascript
const itemsPerPage = 15; // Modify this value to change the number of resources displayed per page
```

### Modifying Player Style

You can customize the player style by modifying the following CSS classes:

- `.custom-audio-player` - Player container
- `.play-btn` - Play/Pause button
- `.progress-container` - Progress bar container
- `.progress-bar` - Progress bar
- `.time-display` - Time display

## Playback Status Tracking Feature

This project features intelligent playback status tracking that automatically saves user playback progress:

### Feature Description

1. **Playback Progress Saving**: Automatically saves current playback position every 5 seconds
2. **Playback Completion Recording**: Records completed audio playback and play count
3. **Status Restoration**: Automatically restores last playback position when reopening the page
4. **Local Storage**: Uses browser localStorage to store playback status without uploading to server

### Display Information

Playback status information is displayed below each audio item:
- Unplayed audio: No information displayed
- Played but incomplete: Displays last playback time and completion percentage
- Completed playback: Displays play count and last playback time

### Storage Mechanism

Playback status information is stored in the browser's localStorage, with each audio file's status saved as an independent key-value pair without interference.

## Keyboard Shortcuts

- `Spacebar` - Play/Pause currently selected audio
- `Esc key` - Stop currently playing audio

## Browser Compatibility

- Chrome 50+
- Firefox 45+
- Safari 10+
- Edge 13+
- Internet Explorer 11+

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Issues and Pull Requests are welcome to help improve the project.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Create a Pull Request

## Author

[Your Name or Organization Name]

## Acknowledgements

- All teachers and volunteers who provided text reading audio