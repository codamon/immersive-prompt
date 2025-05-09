console.log('Immersive Prompt Content Script Loaded!');

function addOpenPromptButton() {
  // 检查按钮是否已存在，避免重复添加
  if (document.getElementById('immersive-prompt-btn')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'immersive-prompt-btn';
  button.textContent = 'Open Prompt';
  button.classList.add('immersive-prompt-button'); // 应用 CSS 中的样式

  // 暂定点击后打印日志，后续可以扩展功能
  button.onclick = () => {
    console.log('Open Prompt button clicked!');
    // 在这里可以添加打开 Prompt 界面的逻辑
  };

  document.body.appendChild(button);
  console.log('Open Prompt button added to page.');
}

// 确保在 DOM 加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addOpenPromptButton);
} else {
  addOpenPromptButton();
}

// 可以考虑在 SPA (Single Page Application) 页面切换时重新检查并添加按钮
// 例如，监听 URL 变化或使用 MutationObserver 观察 DOM 变化
// 但对于 MVP，以上已足够