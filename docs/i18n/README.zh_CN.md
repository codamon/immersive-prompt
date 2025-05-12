# 沉浸式AI提示词 (Immersive Prompt)

一个提升用户在各种AI聊天平台（如ChatGPT、Claude、Gemini等）交互效率的Chrome扩展程序。

## 🌟 核心功能

- **快速插入提示词**: 在AI聊天界面一键插入预设的高质量提示词
- **多语言支持**: 界面和提示词支持多语言（中文、英文等）
- **本地/远程存储**: 将您的提示词保存在本地或云端，随时随地访问
- **提示词市场**: 浏览、下载社区分享的热门提示词
- **模板系统**: 使用变量创建动态提示词模板，提高复用性
- **无缝集成**: 与主流AI对话平台（ChatGPT、Claude、Gemini等）无缝集成

## 📦 安装方法

### 开发版本

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/immersive-prompt.git
   cd immersive-prompt
   ```

2. 安装依赖
   ```bash
   yarn install
   ```

3. 构建扩展
   ```bash
   yarn build
   ```

4. 在Chrome中加载扩展
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `dist` 文件夹

### 从Chrome商店安装
*(即将推出)*

## 🚀 使用方法

1. **访问AI聊天网站**：打开支持的AI聊天网站（如ChatGPT、Claude、Gemini等）

2. **打开插件界面**：点击聊天界面右下角的浮动按钮打开主界面

3. **浏览和使用提示词**：
   - 从不同分类中浏览提示词
   - 点击"使用"将提示词直接插入到聊天输入框
   - 使用搜索框快速查找特定提示词

4. **创建新提示词**：
   - 点击"添加新提示词"按钮
   - 填写标题、内容、描述等信息
   - 支持使用`{{变量名}}`语法创建模板变量

5. **管理您的提示词**：
   - 收藏常用提示词
   - 编辑或删除已有提示词
   - 导入/导出提示词数据

## 🔧 技术栈

- TypeScript
- React
- Chrome Extensions API
- Tailwind CSS

## 🤝 贡献指南

欢迎提交问题和功能请求！如果您想贡献代码，请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 详情请查看LICENSE文件

---

**沉浸式AI提示词** - 让AI对话更高效、更智能、更个性化！