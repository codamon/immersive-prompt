import type { MarketplacePrompt } from '../types/prompt';

// Variable to store original styles
let originalStyles: {
  htmlOverflow?: string;
  htmlHeight?: string;
  bodyMarginRight?: string;
  bodyOverflowY?: string;
  bodyHeight?: string;
} | null = null;

// 添加主题相关变量
let isDarkMode = false;

// 监听DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 初始化UI
  initializeUI();
});

// 如果DOMContentLoaded已经触发，直接初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initializeUI();
}

// 初始化UI
function initializeUI() {
  // 检测当前页面是否为暗黑模式
  detectPageTheme();
  
  // 注入按钮到页面
  injectMarketplaceButton();
  
  // 注入Tailwind CSS
  injectTailwindCSS();
}

// 检测页面主题
function detectPageTheme() {
  // 方法1：检查系统偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode = true;
  }
  
  // 方法2：检查页面元素和CSS变量
  const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
  const htmlEl = document.documentElement;
  
  // 检查常见的暗色背景颜色值或CSS类
  if (
    document.body.classList.contains('dark') || 
    htmlEl.classList.contains('dark') ||
    bodyBgColor === 'rgb(0, 0, 0)' || 
    bodyBgColor === 'rgb(17, 17, 17)' || 
    bodyBgColor === 'rgb(32, 33, 35)' || // ChatGPT暗色背景
    bodyBgColor === 'rgb(52, 53, 65)' // Gemini暗色背景
  ) {
    isDarkMode = true;
  }
  
  // 针对特定网站的检测（可根据需要增加）
  if (
    document.querySelector('.dark-theme') || 
    document.querySelector('[data-theme="dark"]') || 
    document.querySelector('[data-color-mode="dark"]')
  ) {
    isDarkMode = true;
  }
  
  console.log('检测到的主题模式：', isDarkMode ? '暗黑模式' : '明亮模式');
}

// 切换主题模式
function toggleThemeMode() {
  isDarkMode = !isDarkMode;
  
  // 获取市场界面元素
  const marketplace = document.getElementById('ai-prompt-marketplace');
  if (marketplace) {
    if (isDarkMode) {
      marketplace.classList.add('dark-theme');
      marketplace.classList.remove('light-theme');
    } else {
      marketplace.classList.add('light-theme');
      marketplace.classList.remove('dark-theme');
    }
    
    // 更新主题图标
    const themeIcon = marketplace.querySelector('#theme-toggle-icon');
    if (themeIcon) {
      if (isDarkMode) {
        themeIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
      } else {
        themeIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
      }
    }
  }
}

// 注入Tailwind CSS
function injectTailwindCSS() {
  const tailwindLink = document.createElement('link');
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
  document.head.appendChild(tailwindLink);
}

// 注入Marketplace按钮
function injectMarketplaceButton() {
  // 创建按钮容器 - 不再依赖于找到textarea元素
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'fixed bottom-24 right-5 z-50';
  buttonContainer.id = 'ai-prompt-marketplace-button';
  
  // 创建按钮
  const button = document.createElement('button');
  button.className = 'bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
      <path d="M12 3v18"></path>
      <path d="M3 12h18"></path>
    </svg>
  `;
  button.title = 'Prompt 市场';
  button.addEventListener('click', toggleMarketplaceUI);
  
  // 将按钮添加到容器
  buttonContainer.appendChild(button);
  
  // 将容器添加到页面
  document.body.appendChild(buttonContainer);
  
  // 设置样式确保按钮始终可见
  const style = document.createElement('style');
  style.textContent = `
    #ai-prompt-marketplace-button {
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(style);
  
  console.log('Prompt市场按钮已注入到页面');
}

// 切换Marketplace UI显示
function toggleMarketplaceUI() {
  let marketplace = document.getElementById('ai-prompt-marketplace');
  
  if (marketplace) { // Is currently visible, so hide it
    marketplace.remove();
    if (originalStyles) {
      document.documentElement.style.overflow = originalStyles.htmlOverflow || "";
      document.documentElement.style.height = originalStyles.htmlHeight || "";
      document.body.style.marginRight = originalStyles.bodyMarginRight || "";
      document.body.style.overflowY = originalStyles.bodyOverflowY || "";
      document.body.style.height = originalStyles.bodyHeight || "";
      originalStyles = null; // Clear stored styles
    }
  } else { // Is currently hidden, so show it
    // Store original styles before making changes
    const computedHtmlStyle = window.getComputedStyle(document.documentElement);
    const computedBodyStyle = window.getComputedStyle(document.body);
    originalStyles = {
      htmlOverflow: computedHtmlStyle.overflow,
      htmlHeight: computedHtmlStyle.height,
      bodyMarginRight: computedBodyStyle.marginRight,
      bodyOverflowY: computedBodyStyle.overflowY,
      bodyHeight: computedBodyStyle.height,
    };

    createMarketplaceUI(); // This just creates and appends the element

    // Now apply styles that make space and ensure scrollability
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.marginRight = '400px';
    document.body.style.height = '100%';
    document.body.style.overflowY = 'auto';
  }
}

// 创建Marketplace UI
function createMarketplaceUI() {
  // 创建Marketplace容器
  const marketplace = document.createElement('div');
  marketplace.id = 'ai-prompt-marketplace';
  marketplace.className = `fixed top-0 right-0 h-screen w-[400px] flex flex-col shadow-xl ${isDarkMode ? 'dark-theme' : 'light-theme'}`;
  marketplace.style.zIndex = '9999'; // Set a high z-index
  
  // 添加标题栏
  marketplace.innerHTML = `
    <header class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold">Immersive Prompt</h1>
      </div>
      <div class="flex items-center space-x-2">
        <button id="save-button" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="保存">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
        <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="切换主题">
          <span id="theme-toggle-icon">
            ${isDarkMode ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            `}
          </span>
        </button>
        <button id="settings-button" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="设置">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
        </button>
      </div>
    </header>
    
    <div class="p-4 space-y-4">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
        <input id="prompt-search" type="text" placeholder="搜索提示..." class="search-input w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400">
      </div>
      
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button id="tab-all" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2 active-tab">全部</button>
        <button id="tab-favorites" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2">收藏</button>
        <button id="tab-recent" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2">最近</button>
        <button id="tab-popular" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2">热门</button>
      </div>
    </div>
    
    <div id="prompts-container" class="flex-1 overflow-y-auto p-4">
      <div id="prompts-grid" class="grid grid-cols-1 gap-4">
        <!-- 提示卡片将在这里动态插入 -->
      </div>
    </div>
  `;
  
  document.body.appendChild(marketplace);
  
  // 添加CSS样式
  addThemeStyles();
  
  // 初始化事件监听
  initMarketplaceEvents();
  
  // 加载提示数据
  loadPromptData();
}

// 添加主题样式
function addThemeStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* 明亮模式样式 */
    #ai-prompt-marketplace.light-theme {
      background-color: #ffffff;
      color: #333333;
    }
    #ai-prompt-marketplace.light-theme header {
      background-color: #f8f9fa;
      border-color: #e9ecef;
    }
    #ai-prompt-marketplace.light-theme input, 
    #ai-prompt-marketplace.light-theme select {
      background-color: #ffffff;
      border-color: #dee2e6;
      color: #333333;
    }
    #ai-prompt-marketplace.light-theme button:not(.use-prompt-btn) {
      color: #333333;
    }
    #ai-prompt-marketplace.light-theme .options-menu {
      background-color: #ffffff;
      border-color: #dee2e6;
    }
    
    /* 卡片明亮模式 */
    #ai-prompt-marketplace.light-theme .prompt-card {
      background-color: #ffffff;
      border-color: #e9ecef;
      color: #333333;
    }
    #ai-prompt-marketplace.light-theme .prompt-description {
      color: #555555;
    }
    #ai-prompt-marketplace.light-theme .tag-item {
      background-color: #f8f9fa;
      border-color: #e9ecef;
      color: #666666;
    }
    #ai-prompt-marketplace.light-theme .favorite-prompt-btn,
    #ai-prompt-marketplace.light-theme .more-options-btn {
      color: #555555;
    }
    
    /* 暗黑模式样式 */
    #ai-prompt-marketplace.dark-theme {
      background-color: #1e1e2e;
      color: #e4e6eb;
    }
    #ai-prompt-marketplace.dark-theme header {
      background-color: #252836;
      border-color: #393a4d;
    }
    #ai-prompt-marketplace.dark-theme input, 
    #ai-prompt-marketplace.dark-theme select {
      background-color: #2e303e;
      border-color: #393a4d;
      color: #e4e6eb;
    }
    #ai-prompt-marketplace.dark-theme button:not(.use-prompt-btn) {
      color: #e4e6eb;
    }
    #ai-prompt-marketplace.dark-theme .options-menu {
      background-color: #2e303e;
      border-color: #393a4d;
    }
    #ai-prompt-marketplace.dark-theme .text-gray-500 {
      color: #a9adc1;
    }
    #ai-prompt-marketplace.dark-theme .text-gray-600 {
      color: #cdd0e3;
    }
    
    /* 卡片暗黑模式 */
    #ai-prompt-marketplace.dark-theme .prompt-card {
      background-color: #252836;
      border-color: #393a4d;
      color: #e4e6eb;
    }
    #ai-prompt-marketplace.dark-theme .prompt-description {
      color: #cdd0e3;
    }
    #ai-prompt-marketplace.dark-theme .tag-item {
      background-color: #2e303e;
      border-color: #393a4d;
      color: #b1b5d0;
    }
    #ai-prompt-marketplace.dark-theme .favorite-prompt-btn,
    #ai-prompt-marketplace.dark-theme .more-options-btn {
      color: #b1b5d0;
    }
    
    /* 悬停效果 */
    .prompt-card {
      transition: transform 0.2s ease;
    }
    .prompt-card:hover {
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(styleElement);
}

// 初始化Marketplace事件监听
function initMarketplaceEvents() {
  // 关闭按钮
  document.getElementById('marketplace-back')?.addEventListener('click', toggleMarketplaceUI);
  
  // 市场链接按钮
  document.getElementById('marketplace-link')?.addEventListener('click', () => {
    // 触发显示市场页面
    const event = new CustomEvent('showMarketplace');
    document.dispatchEvent(event);
  });
  
  // 主题切换按钮
  document.getElementById('theme-toggle')?.addEventListener('click', toggleThemeMode);
  
  // 搜索输入框
  document.getElementById('prompt-search')?.addEventListener('input', filterPrompts);
  
  // 标签切换
  document.getElementById('tab-all')?.addEventListener('click', () => switchTab('all'));
  document.getElementById('tab-favorites')?.addEventListener('click', () => switchTab('favorites'));
  document.getElementById('tab-recent')?.addEventListener('click', () => switchTab('recent'));
  document.getElementById('tab-popular')?.addEventListener('click', () => switchTab('popular'));
}

// 切换标签
function switchTab(tab: string) {
  // 重置所有标签样式
  const tabs = ['tab-all', 'tab-favorites', 'tab-recent', 'tab-popular'];
  tabs.forEach(tabId => {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.className = 'tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2';
    }
  });
  
  // 设置当前标签样式
  const currentTab = document.getElementById(`tab-${tab}`);
  if (currentTab) {
    currentTab.className = 'tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2 active-tab';
  }
  
  // 重新加载并排序数据
  loadPromptData(tab);
}

// 声明mockPrompts为一个全局变量，使其可以在其他函数中访问
let mockPrompts: MarketplacePrompt[] = [];

// 修改loadPromptData函数开头
function loadPromptData(sortBy: string = 'popular') {
  mockPrompts = [
    {
      id: "1",
      title: "高级SEO内容创作器",
      content:
        "为{{topic}}写一篇针对关键词{{keyword}}的SEO优化博客文章。包括引言、至少3个小标题和结论。",
      description: "创建具有适当结构的SEO友好博客内容",
      tags: ["写作", "seo", "博客"],
      language: "en",
      category: "Content Creation",
      author: "seomaster",
      rating: 4.8,
      downloads: 1250,
      createdAt: new Date(2023, 3, 15),
    },
    {
      id: "2",
      title: "代码审查助手专业版",
      content:
        "请帮我审查以下{{language}}代码，找出潜在的bug、性能问题和安全漏洞：\n\n```{{language}}\n{{code}}\n```",
      description: "帮助审查代码，发现潜在问题，提供专业建议",
      tags: ["编程", "审查", "安全"],
      language: "zh",
      category: "Development",
      author: "codereviewer",
      rating: 4.9,
      downloads: 3200,
      createdAt: new Date(2023, 2, 10),
    },
    {
      id: "3",
      title: "会议总结专家",
      content:
        "将以下会议记录总结为要点、行动项目和已做决定：\n\n{{transcript}}",
      description: "使用高级NLP从会议记录中提取重要信息",
      tags: ["效率", "商业", "总结"],
      language: "en",
      category: "Productivity",
      author: "meetingmaster",
      rating: 4.7,
      downloads: 980,
      createdAt: new Date(2023, 4, 5),
    },
    {
      id: "4",
      title: "学习计划生成器高级版",
      content:
        "请为我创建一个为期{{duration}}的{{subject}}学习计划。我的目标是{{goal}}，我每周可以投入{{hours_per_week}}小时学习。",
      description: "生成个性化学习计划，包含详细的学习资源和进度跟踪",
      tags: ["教育", "计划", "学习"],
      language: "zh",
      category: "Education",
      author: "eduexpert",
      rating: 4.6,
      downloads: 750,
      createdAt: new Date(2023, 1, 20),
    },
    {
      id: "5",
      title: "电商产品描述生成器",
      content:
        "为{{product_name}}创建一个引人注目的产品描述，包含以下特点：{{features}}。目标受众：{{audience}}。包含SEO关键词：{{keywords}}。",
      description: "为在线商店生成有说服力的产品描述",
      tags: ["电商", "营销", "文案"],
      language: "en",
      category: "Business",
      author: "ecomwriter",
      rating: 4.5,
      downloads: 2100,
      createdAt: new Date(2023, 3, 25),
    },
    {
      id: "6",
      title: "创意故事生成器",
      content:
        "请以{{setting}}为背景，创作一个关于{{character}}的短篇故事。故事应包含以下元素：{{elements}}，并以{{tone}}的风格呈现。",
      description: "生成创意短篇故事，可自定义背景、角色和风格",
      tags: ["创意", "写作", "故事"],
      language: "zh",
      category: "Creative",
      author: "storycrafter",
      rating: 4.7,
      downloads: 1800,
      createdAt: new Date(2023, 2, 15),
    },
  ];

  // 排序数据
  let sortedPrompts = [...mockPrompts];
  switch (sortBy) {
    case 'popular':
      sortedPrompts.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'recent':
      sortedPrompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case 'top-rated':
      sortedPrompts.sort((a, b) => b.rating - a.rating);
      break;
    default:
      sortedPrompts.sort((a, b) => b.downloads - a.downloads);
  }

  renderPrompts(sortedPrompts);
  filterPrompts();
}

// 渲染Prompts
function renderPrompts(prompts: MarketplacePrompt[]) {
  const container = document.getElementById('prompts-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  prompts.forEach(prompt => {
    container.appendChild(createPromptCard(prompt));
  });
}

// 创建Prompt卡片
function createPromptCard(prompt: MarketplacePrompt): HTMLElement {
  const card = document.createElement('div');
  card.className = 'w-full border rounded-lg shadow-sm overflow-hidden prompt-card flex flex-col';
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };
  
  card.innerHTML = `
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="text-base font-medium">${prompt.title}</h3>
        <div class="flex items-center gap-2">
          <button class="favorite-prompt-btn p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" data-prompt-id="${prompt.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <div class="relative">
            <button class="more-options-btn p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" data-prompt-id="${prompt.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div class="options-menu hidden absolute right-0 top-6 w-32 border rounded-md shadow-lg z-10">
              <button class="edit-prompt-btn w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600" data-prompt-id="${prompt.id}">编辑</button>
              <button class="delete-prompt-btn w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600" data-prompt-id="${prompt.id}">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-2 flex flex-wrap gap-1">
        ${prompt.tags.map((tag: string) => `<span class="px-2 py-0.5 text-xs border tag-item rounded-full">${tag}</span>`).join('')}
      </div>
      
      <p class="mt-3 text-sm prompt-description">${prompt.description}</p>
      
      <div class="mt-4 flex justify-between items-center">
        <div class="text-xs text-gray-500">
          <span class="font-medium">@${prompt.author}</span> · ${formatDate(prompt.createdAt)}
        </div>
        <button class="use-prompt-btn px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1" data-prompt-id="${prompt.id}">
          Use
        </button>
      </div>
    </div>
  `;
  
  // 添加导入按钮点击事件
  card.querySelector('.use-prompt-btn')?.addEventListener('click', (e) => {
    const promptId = (e.currentTarget as HTMLElement).getAttribute('data-prompt-id');
    if (promptId) {
      const promptToUse = mockPrompts.find(p => p.id === promptId);
      if (promptToUse) {
        insertPromptToInput(promptToUse.content);
      }
    }
  });
  
  // 添加更多选项点击事件
  card.querySelector('.more-options-btn')?.addEventListener('click', (e) => {
    const optionsMenu = (e.currentTarget as HTMLElement).nextElementSibling;
    if (optionsMenu) {
      optionsMenu.classList.toggle('hidden');
    }
  });
  
  // 添加收藏按钮点击事件
  card.querySelector('.favorite-prompt-btn')?.addEventListener('click', (e) => {
    const promptId = (e.currentTarget as HTMLElement).getAttribute('data-prompt-id');
    if (promptId) {
      // 切换收藏状态
      toggleFavoritePrompt(promptId);
      // 切换填充状态
      const svg = (e.currentTarget as HTMLElement).querySelector('svg');
      if (svg) {
        if (svg.getAttribute('fill') === 'none') {
          svg.setAttribute('fill', 'currentColor');
        } else {
          svg.setAttribute('fill', 'none');
        }
      }
    }
  });
  
  return card;
}

// 将Prompt插入到聊天输入框
function insertPromptToInput(promptText: string) {
  // 查找Gemini的输入框
  const textarea = document.querySelector('textarea[aria-label="Type something or pick one from prompt gallery"]');
  
  if (textarea) {
    // 设置值
    (textarea as HTMLTextAreaElement).value = promptText;
    
    // 触发input事件让Angular知道值已经改变
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);
    
    // 触发focus事件
    textarea.dispatchEvent(new Event('focus'));
    
    // 让Run按钮变成可点击状态
    const runButton = document.querySelector('button.run-button');
    if (runButton && runButton.hasAttribute('disabled')) {
      runButton.removeAttribute('disabled');
      runButton.setAttribute('aria-disabled', 'false');
      runButton.classList.remove('disabled');
    }
    
    // 显示成功消息
    showToast('Prompt已成功插入到对话框');
  } else {
    // 尝试查找其他可能的输入框（ChatGPT等）
    const otherTextarea = document.querySelector('textarea');
    if (otherTextarea) {
      (otherTextarea as HTMLTextAreaElement).value = promptText;
      otherTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      otherTextarea.dispatchEvent(new Event('focus'));
      showToast('Prompt已成功插入到对话框');
    } else {
      showToast('无法找到输入框，请手动复制Prompt');
      console.error('找不到输入框元素');
    }
  }
}

// 切换收藏状态
function toggleFavoritePrompt(promptId: string) {
  console.log(`收藏/取消收藏提示 ${promptId}`);
  // 实际实现中，这里应该切换prompt在用户收藏库中的状态
  showToast('收藏状态已更新');
}

// 显示Toast消息
function showToast(message: string) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 过滤Prompts
function filterPrompts() {
  const searchInput = document.getElementById('prompt-search') as HTMLInputElement;
  const searchQuery = searchInput?.value.toLowerCase() || '';
  
  // 应用过滤器到DOM元素
  const promptCards = document.querySelectorAll('#prompts-grid > div');
  promptCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const description = card.querySelector('p')?.textContent?.toLowerCase() || '';
    const tags = Array.from(card.querySelectorAll('.mt-2.flex.flex-wrap.gap-1 > span')).map(tag => tag.textContent?.toLowerCase() || '');
    
    const matchesSearch = searchQuery === '' || 
                          title.includes(searchQuery) || 
                          description.includes(searchQuery) || 
                          tags.some(tag => tag.includes(searchQuery));
    
    if (matchesSearch) {
      (card as HTMLElement).style.display = '';
    } else {
      (card as HTMLElement).style.display = 'none';
    }
  });
}
