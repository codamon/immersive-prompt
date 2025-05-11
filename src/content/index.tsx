import { createRoot } from 'react-dom/client';
import MainContainer from './MainContainer';
import { createOrEditPrompt } from './promptCreator';
import './utils'; // 确保utils被加载
import './adapter'; // 导入adapter以激活React组件渲染

/**
 * 在页面上创建并挂载主应用容器
 */
function createAppContainer() {
  // 检查是否已存在应用容器
  let appContainer = document.getElementById('immersive-prompt-container');
  
  // 如果不存在，创建一个新的容器
  if (!appContainer) {
    appContainer = document.createElement('div');
    appContainer.id = 'immersive-prompt-container';
    document.body.appendChild(appContainer);
    
    // 设置样式，确保容器位于页面顶层
    Object.assign(appContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      top: '10px',
      right: '10px',
      backgroundColor: 'transparent',
    });
  }
  
  return appContainer;
}

/**
 * 初始化React应用
 */
function initApp() {
  try {
    const container = createAppContainer();
    const root = createRoot(container);
    root.render(<MainContainer />);
    console.log("ImmersivePrompt: 应用已成功挂载");
  } catch (error) {
    console.error("ImmersivePrompt: 初始化应用时出错:", error);
  }
}

// 检测目标网站并注入按钮
function setupTargetSiteIntegration() {
  // 这里添加针对特定AI聊天网站的集成逻辑
  // 例如，在ChatGPT, Claude或Gemini的输入框旁添加按钮
  
  // 示例：检测ChatGPT
  const isChatGPT = window.location.hostname.includes('chat.openai.com');
  // 示例：检测Claude
  const isClaude = window.location.hostname.includes('claude.ai');
  // 示例：检测Gemini
  const isGemini = window.location.hostname.includes('gemini.google.com');
  
  if (isChatGPT || isClaude || isGemini) {
    // 等待聊天输入框加载
    const checkInterval = setInterval(() => {
      let chatInput;
      
      if (isChatGPT) {
        chatInput = document.querySelector('textarea[data-id="root"]');
      } else if (isClaude) {
        chatInput = document.querySelector('div[class*="ProseMirror"]');
      } else if (isGemini) {
        chatInput = document.querySelector('div[contenteditable="true"]');
      }
      
      if (chatInput) {
        clearInterval(checkInterval);
        injectPromptButton(chatInput);
      }
    }, 1000);
  }
}

// 注入Prompt按钮到输入框旁边
function injectPromptButton(targetElement: Element) {
  if (!targetElement || targetElement.parentElement?.querySelector('#immersive-prompt-button')) {
    return; // 如果目标元素不存在或按钮已存在，则返回
  }
  
  // 创建按钮
  const button = document.createElement('button');
  button.id = 'immersive-prompt-button';
  button.innerHTML = '✨'; // 使用一个简单的图标
  button.title = 'AI Chat Helper Pro';
  
  // 设置按钮样式
  Object.assign(button.style, {
    position: 'absolute',
    right: '40px',
    bottom: '10px',
    zIndex: '1000',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  
  // 添加悬停效果
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = 'transparent';
  });
  
  // 添加点击事件
  button.addEventListener('click', () => {
    // 调用创建新Prompt的方法
    createOrEditPrompt(false);
  });
  
  // 将按钮插入到输入框附近
  const parent = targetElement.parentElement;
  if (parent) {
    // 确保父元素是相对定位，以便正确放置按钮
    if (window.getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(button);
  }
}

// 在页面加载完毕后初始化
window.addEventListener('load', () => {
  console.log("ImmersivePrompt: 内容脚本已加载");
  
  // 启动应用
  initApp();
  
  // 设置目标网站集成
  setupTargetSiteIntegration();
}); 
 