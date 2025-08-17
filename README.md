# 中小学语文示范诵读库

一个用于展示和播放中小学语文课文朗读音频的Web应用程序。

[English version](README_EN.md)

## 项目简介

本项目是一个基于Web的音频播放平台，专门用于展示中小学语文课文的朗读音频资源。它提供了按年级、学期分类的音频资源浏览功能，以及搜索和分页功能，让用户能够方便地找到并播放所需的课文朗读音频。

音频资源来源于[中央人民广播电台中小学语文示范诵读库](https://edu.cnr.cn/eduzt/ywkwsfsd/)，版权归原作者所有。

## 功能特点

- 🎵 音频播放：支持在线播放课文朗读音频
- 📚 分类浏览：按年级和学期对音频资源进行分类
- 🔍 搜索功能：支持通过课文标题搜索音频资源
- 📄 分页展示：每页显示15个资源，避免页面卡顿
- 🎛️ 播放互斥：同时只能播放一个音频，自动停止其他音频
- 🎨 响应式设计：适配不同屏幕尺寸，支持移动端浏览
- ⚡ 性能优化：采用分页加载技术，提升页面性能
- ⌨️ 键盘支持：支持空格键控制播放/暂停
- 📁 本地加载：支持直接从本地文件系统加载数据
- 📊 播放状态跟踪：自动保存播放进度和完成状态
- 🔄 自动保存播放进度：每5秒自动保存一次播放进度
- 💾 本地存储播放状态：使用localStorage保存播放状态，包括播放时间、总时长、播放次数和完成状态
- 🎯 焦点播放控制：支持键盘快捷键控制当前焦点播放器
- 🌐 多种加载方式：支持服务器加载、XMLHttpRequest加载和FileReader本地文件读取
- 🖱️ 多种交互方式：支持播放器容器点击和按钮获得焦点等多种交互方式

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- LocalStorage

## 项目结构

```
├── index.html         # 主页面
├── list.json          # 音频资源数据文件
├── server.py          # 本地开发服务器脚本
├── README.md          # 项目说明文档
├── README_EN.md       # 项目说明文档（英文版）
├── DISCLAIMER.md      # 免责声明
├── LICENSE            # 许可证文件
├── .gitignore         # Git忽略文件配置
└── opus/              # 音频文件目录
    ├── 1-1-1.opus
    ├── 1-1-2.opus
    └── ...
```

## 使用方法

### 在线访问

1. 访问项目GitHub Pages地址（部署后）：
   ```
   https://ZedeX.github.io/mandarin-reading-resource/
   ```

### 本地运行

有两种方式可以在本地运行项目：

#### 方法一：直接访问Github托管网页（推荐）

1. 访问项目GitHub托管页面：
   ```
   https://ZedeX.github.io/mandarin-reading-resource/
   ```

#### 方法二：使用本地服务器

1. 克隆项目到本地：
   ```bash
   git clone https://github.com/ZedeX/mandarin-reading-resource.git
   cd mandarin-reading-resource
   ```

2. 启动本地服务器：
   ```bash
   python server.py
   ```

3. 在浏览器中访问：
   ```
   http://localhost:8000
   ```

#### 方法三：直接打开HTML文件

1. 克隆项目到本地：
   ```bash
   git clone https://github.com/ZedeX/mandarin-reading-resource.git
   cd mandarin-reading-resource
   ```

2. 在浏览器中直接打开[index.html](index.html)文件

3. 在页面上点击"选择文件"按钮，选择[list.json](list.json)文件并点击"加载数据"

> 注意：使用方法三时，由于浏览器安全限制，可能无法正确加载音频文件。如果遇到问题，请使用方法一或二。

## 数据格式

音频资源数据存储在`list.json`文件中，格式如下：

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

## 自定义配置

### 修改每页显示数量

在[index.html](index.html)文件中找到以下代码并修改数值：

```javascript
const itemsPerPage = 15; // 修改此数值改变每页显示的资源数量
```

### 修改播放器样式

可以通过修改CSS中的以下类来自定义播放器样式：

- `.custom-audio-player` - 播放器容器
- `.play-btn` - 播放/暂停按钮
- `.progress-container` - 进度条容器
- `.progress-bar` - 进度条
- `.time-display` - 时间显示

## 播放状态跟踪功能

本项目具备智能播放状态跟踪功能，可以自动保存用户的播放进度：

### 功能说明

1. **播放进度保存**：每隔5秒自动保存当前播放位置
2. **播放完成记录**：记录已完成播放的音频及播放次数
3. **状态恢复**：重新打开页面时自动恢复上次播放位置
4. **本地存储**：使用浏览器localStorage存储播放状态，不上传到服务器

### 显示信息

在每个音频项下方会显示播放状态信息：
- 未播放过的音频：不显示任何信息
- 播放过但未完成：显示上次播放到的时间点和完成百分比
- 已完成播放：显示播放次数和上次播放到的时间点

### 存储机制

播放状态信息存储在浏览器的localStorage中，每个音频文件的状态以独立的键值对形式保存，互不干扰。

## 键盘快捷键

- `空格键` - 播放/暂停当前选中的音频
- `Esc键` - 停止当前播放的音频

## 浏览器兼容性

- Chrome 50+
- Firefox 45+
- Safari 10+
- Edge 13+
- Internet Explorer 11+

## 许可证

本项目采用MIT许可证，详情请见[LICENSE](LICENSE)文件。

## 免责声明

本项目仅为方便学习和研究使用。音频资源来源于[中央人民广播电台中小学语文示范诵读库](https://edu.cnr.cn/eduzt/ywkwsfsd/)，版权归原作者所有。详细免责声明请参见[DISCLAIMER.md](DISCLAIMER.md)文件。

## 贡献

欢迎提交Issue和Pull Request来帮助改进项目。

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建Pull Request

## 作者

ZedeX

## 致谢

- [中央人民广播电台中小学语文示范诵读库](https://edu.cnr.cn/eduzt/ywkwsfsd/)提供优质的语文课文朗读音频资源
- 所有提供课文朗读音频的教师和志愿者

## 特别说明

本项目所有代码均由TRAE生成。