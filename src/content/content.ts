import type { MarketplacePrompt } from '../types/prompt';
import ChromeStorage from '../storage/chromeStorage';
import { showToast as utilShowToast } from './utils'; // 假设 utils.ts 在同级目录
import { initPromptCreator, createOrEditPrompt } from './promptCreator'; // 导入新创建的模块

// Variable to store original styles
let originalStyles: {
  htmlOverflow?: string;
  htmlHeight?: string;
  bodyMarginRight?: string;
  bodyOverflowY?: string;
  bodyHeight?: string;
} | null = null;

let isDarkMode = false;
let currentView: 'home' | 'promptForm' = 'home';

const activeTabClasses = [
  'border-blue-600', 'dark:border-blue-500',
  'text-gray-900', 'dark:text-white',
  'font-semibold',
];

const inactiveTabClasses = [
  'border-transparent',
  'text-gray-500', 'dark:text-gray-400',
  'hover:text-gray-800', 'dark:hover:text-gray-200',
  'hover:border-gray-300', 'dark:hover:border-gray-500',
  'font-medium'
];

// 监听DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
});

// 如果DOMContentLoaded已经触发，直接初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initializeUI();
}

// 监听toggle-prompt-view事件，用于从adapter.ts切换视图
document.addEventListener('toggle-prompt-view', ((event: CustomEvent) => {
  const { view, promptToEdit } = event.detail;
  if (view) {
    togglePromptView(view, promptToEdit);
  }
}) as EventListener);

// 初始化UI
function initializeUI() {
  detectPageTheme();
  injectHomePageButton(); // 确保这个函数被调用
  injectTailwindCSS();
  
  // 将togglePromptView函数传递给promptCreator模块
  initPromptCreator(togglePromptView);
}

// 检测页面主题
function detectPageTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode = true;
  }
  const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
  const htmlEl = document.documentElement;
  if (
    document.body.classList.contains('dark') || 
    htmlEl.classList.contains('dark') ||
    bodyBgColor === 'rgb(0, 0, 0)' || 
    bodyBgColor === 'rgb(17, 17, 17)' || 
    bodyBgColor === 'rgb(32, 33, 35)' ||
    bodyBgColor === 'rgb(52, 53, 65)'
  ) {
    isDarkMode = true;
  }
  if (
    document.querySelector('.dark-theme') || 
    document.querySelector('[data-theme="dark"]') || 
    document.querySelector('[data-color-mode="dark"]')
  ) {
    isDarkMode = true;
  }
  console.log('ImmersivePrompt: Detected theme:', isDarkMode ? 'Dark Mode' : 'Light Mode');
}

// 切换主题模式
function toggleThemeMode() {
  isDarkMode = !isDarkMode;
  const homePageContainer = document.getElementById('ai-prompt-home-page');
  const promptFormViewContainer = document.getElementById('prompt-form-view-container');

  if (homePageContainer) {
    if (isDarkMode) {
      homePageContainer.classList.add('dark-theme');
      homePageContainer.classList.remove('light-theme');
    } else {
      homePageContainer.classList.add('light-theme');
      homePageContainer.classList.remove('dark-theme');
    }
    const themeIcon = homePageContainer.querySelector('#theme-toggle-icon');
    if (themeIcon) {
      themeIcon.innerHTML = isDarkMode ? 
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : 
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }
  
  // 更新表单视图的主题（如果存在）
  if (promptFormViewContainer) {
    if (isDarkMode) {
        promptFormViewContainer.classList.remove('bg-white', 'text-gray-900');
        promptFormViewContainer.classList.add('bg-gray-800', 'text-gray-100');
        promptFormViewContainer.querySelectorAll('input, textarea, select').forEach(el => {
            el.classList.remove('border-gray-300', 'bg-white', 'text-gray-900');
            el.classList.add('border-gray-600', 'bg-gray-700', 'text-white');
        });
        promptFormViewContainer.querySelectorAll('label, p.text-xs').forEach(el => {
            el.classList.remove('text-gray-700', 'text-gray-500');
            el.classList.add('text-gray-300', 'text-gray-400');
        });
        promptFormViewContainer.querySelectorAll('#form-tags-container span.flex').forEach(el => { // 更具体地选择标签的span
            el.classList.remove('bg-gray-200', 'text-gray-700');
            el.classList.add('bg-gray-600', 'text-gray-200');
        });
        promptFormViewContainer.querySelector('#form-cancel-button')?.classList.remove('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        promptFormViewContainer.querySelector('#form-cancel-button')?.classList.add('bg-gray-600', 'hover:bg-gray-500', 'text-gray-300');
    } else {
        promptFormViewContainer.classList.remove('bg-gray-800', 'text-gray-100');
        promptFormViewContainer.classList.add('bg-white', 'text-gray-900');
        promptFormViewContainer.querySelectorAll('input, textarea, select').forEach(el => {
            el.classList.remove('border-gray-600', 'bg-gray-700', 'text-white');
            el.classList.add('border-gray-300', 'bg-white', 'text-gray-900');
        });
        promptFormViewContainer.querySelectorAll('label, p.text-xs').forEach(el => {
            el.classList.remove('text-gray-300', 'text-gray-400');
            el.classList.add('text-gray-700', 'text-gray-500');
        });
        promptFormViewContainer.querySelectorAll('#form-tags-container span.flex').forEach(el => {
            el.classList.remove('bg-gray-600', 'text-gray-200');
            el.classList.add('bg-gray-200', 'text-gray-700');
        });
        promptFormViewContainer.querySelector('#form-cancel-button')?.classList.remove('bg-gray-600', 'hover:bg-gray-500', 'text-gray-300');
        promptFormViewContainer.querySelector('#form-cancel-button')?.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
    }
  }
  // 更新首页主题样式（如果 addHomePageThemeStyles 依赖 isDarkMode）
  // 但通常 Tailwind 的 dark: 前缀会自动处理，这里主要是确保动态添加的表单部分也更新
  addHomePageThemeStyles(); // 确保主题样式表是最新的
}

// 注入Tailwind CSS
function injectTailwindCSS() {
  if (document.getElementById('tailwind-injected-styles')) return;
  const tailwindLink = document.createElement('link');
  tailwindLink.id = 'tailwind-injected-styles';
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css';
  document.head.appendChild(tailwindLink);
}

// 注入首页按钮
function injectHomePageButton() {
  // 确保只注入一次
  if (document.getElementById('ai-prompt-home-page-button')) return;

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'fixed bottom-24 right-5 z-[2147483647]'; // 使用极高的 z-index
  buttonContainer.id = 'ai-prompt-home-page-button';
  
  const button = document.createElement('button');
  button.className = 'bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 lucide lucide-layout-panel-left">
        <rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
    </svg>
  `;
  button.title = '打开提示首页';
  button.addEventListener('click', toggleHomePageUI);
  
  buttonContainer.appendChild(button);
  document.body.appendChild(buttonContainer);
  console.log('ImmersivePrompt: 首页按钮已注入');
}

// 切换首页UI显示
function toggleHomePageUI() {
  let homePageContainer = document.getElementById('ai-prompt-home-page');
  
  if (homePageContainer) {
    homePageContainer.remove();
    if (originalStyles) {
      document.documentElement.style.overflow = originalStyles.htmlOverflow || "";
      document.documentElement.style.height = originalStyles.htmlHeight || "";
      document.body.style.marginRight = originalStyles.bodyMarginRight || "";
      document.body.style.overflowY = originalStyles.bodyOverflowY || "";
      document.body.style.height = originalStyles.bodyHeight || "";
      originalStyles = null;
    }
  } else {
    const computedHtmlStyle = window.getComputedStyle(document.documentElement);
    const computedBodyStyle = window.getComputedStyle(document.body);
    originalStyles = {
      htmlOverflow: computedHtmlStyle.overflow,
      htmlHeight: computedHtmlStyle.height,
      bodyMarginRight: computedBodyStyle.marginRight,
      bodyOverflowY: computedBodyStyle.overflowY,
      bodyHeight: computedBodyStyle.height,
    };

    createHomePageUI(); // 创建并显示UI

    // 应用页面滚动和边距调整
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.marginRight = '400px'; 
    document.body.style.height = '100%';
    document.body.style.overflowY = 'auto';
  }
}

// 创建首页UI的容器
function createHomePageUI() {
  const homePage = document.createElement('div');
  homePage.id = 'ai-prompt-home-page';
  homePage.className = `fixed top-0 right-0 h-screen w-[400px] flex flex-col shadow-xl ${isDarkMode ? 'dark-theme' : 'light-theme'}`;
  homePage.style.zIndex = '2147483646'; // 略低于按钮，但仍很高
  
  homePage.innerHTML = `
    <header class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2"> 
        <h1 class="text-xl font-bold">Prompt 首页</h1>
      </div>
      <div class="flex items-center space-x-2">
        <button id="save-button" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" title="保存（功能待定）">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        </button>
        <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" title="切换主题">
          <span id="theme-toggle-icon">
            ${isDarkMode ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`}
          </span>
        </button>
        <button id="settings-button" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" title="设置（功能待定）">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
        </button>
      </div>
    </header>

    <div id="home-view-main-content">
      <div class="p-4 space-y-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
          <input id="prompt-search" type="text" placeholder="搜索提示..." class="search-input w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400">
        </div>
        <button id="add-prompt-button" class="w-full flex items-center justify-center gap-x-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500 dark:text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          添加新提示
        </button>
        <div class="flex">
          <button id="tab-all"       class="tab-button flex-1 py-2 px-1 text-sm border-b-2 -mb-px transition-colors duration-150">全部</button>
          <button id="tab-favorites" class="tab-button flex-1 py-2 px-1 text-sm border-b-2 -mb-px transition-colors duration-150">收藏</button>
          <button id="tab-recent"    class="tab-button flex-1 py-2 px-1 text-sm border-b-2 -mb-px transition-colors duration-150">最近</button>
          <button id="tab-popular"   class="tab-button flex-1 py-2 px-1 text-sm border-b-2 -mb-px transition-colors duration-150">热门</button>
        </div>
      </div>
      <div id="prompts-container" class="flex-1 overflow-y-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div id="prompts-grid" class="grid grid-cols-1 gap-4"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(homePage);
  addHomePageThemeStyles();
  initHomePageEvents();
  switchTab('popular');
}

// 添加首页主题样式
function addHomePageThemeStyles() {
  const styleElement = document.getElementById('ai-prompt-home-page-styles') || document.createElement('style');
  styleElement.id = 'ai-prompt-home-page-styles';
  styleElement.textContent = `
    #ai-prompt-home-page.light-theme { background-color: #ffffff; color: #333333; }
    #ai-prompt-home-page.light-theme header { background-color: #f8f9fa; border-color: #e9ecef; }
    #ai-prompt-home-page.light-theme input, 
    #ai-prompt-home-page.light-theme select { background-color: #ffffff; border-color: #dee2e6; color: #333333; }
    #ai-prompt-home-page.light-theme button:not(.use-prompt-btn):not(#add-prompt-button) { color: #333333; }
    #ai-prompt-home-page.light-theme .options-menu { background-color: #ffffff; border-color: #dee2e6; }
    #ai-prompt-home-page.light-theme .prompt-card { background-color: #ffffff; border-color: #e9ecef; color: #333333; }
    #ai-prompt-home-page.light-theme .prompt-description { color: #555555; }
    #ai-prompt-home-page.light-theme .tag-item { background-color: #f8f9fa; border-color: #e9ecef; color: #666666; }
    #ai-prompt-home-page.light-theme .favorite-prompt-btn,
    #ai-prompt-home-page.light-theme .more-options-btn { color: #555555; }
    #ai-prompt-home-page.light-theme .tab-button.text-gray-900 { color: #111827 !important; }
    #ai-prompt-home-page.light-theme .tab-button.text-gray-500 { color: #6B7280 !important; }
    #ai-prompt-home-page.light-theme .tab-button.hover\\:text-gray-800:hover { color: #1F2937 !important; }
    
    #ai-prompt-home-page.dark-theme { background-color: #1e1e2e; color: #e4e6eb; }
    #ai-prompt-home-page.dark-theme header { background-color: #252836; border-color: #393a4d; }
    #ai-prompt-home-page.dark-theme input, 
    #ai-prompt-home-page.dark-theme select { background-color: #2e303e; border-color: #393a4d; color: #e4e6eb; }
    #ai-prompt-home-page.dark-theme button:not(.use-prompt-btn):not(#add-prompt-button) { color: #e4e6eb; }
    #ai-prompt-home-page.dark-theme .options-menu { background-color: #2e303e; border-color: #393a4d; }
    #ai-prompt-home-page.dark-theme .text-gray-500:not(.tab-button) { color: #a9adc1 !important; }
    #ai-prompt-home-page.dark-theme .text-gray-400:not(.tab-button) { color: #8c91a5 !important; } 
    #ai-prompt-home-page.dark-theme .prompt-card { background-color: #252836; border-color: #393a4d; color: #e4e6eb; }
    #ai-prompt-home-page.dark-theme .prompt-description { color: #cdd0e3; }
    #ai-prompt-home-page.dark-theme .tag-item { background-color: #2e303e; border-color: #393a4d; color: #b1b5d0; }
    #ai-prompt-home-page.dark-theme .favorite-prompt-btn,
    #ai-prompt-home-page.dark-theme .more-options-btn { color: #b1b5d0; }
    #ai-prompt-home-page.dark-theme .tab-button.dark\\:text-white { color: #ffffff !important; }
    #ai-prompt-home-page.dark-theme .tab-button.dark\\:text-gray-400 { color: #9CA3AF !important; }
    #ai-prompt-home-page.dark-theme .tab-button.dark\\:hover\\:text-gray-200:hover { color: #E5E7EB !important; }

    .prompt-card { transition: transform 0.2s ease; }
    .prompt-card:hover { transform: translateY(-2px); }
  `;
  if (!document.getElementById(styleElement.id)) {
    document.head.appendChild(styleElement);
  }
}

// 初始化首页事件监听
function initHomePageEvents() {
  document.getElementById('theme-toggle')?.addEventListener('click', toggleThemeMode);
  document.getElementById('prompt-search')?.addEventListener('input', filterPrompts);
  
  document.getElementById('tab-all')?.addEventListener('click', () => switchTab('all'));
  document.getElementById('tab-favorites')?.addEventListener('click', () => switchTab('favorites'));
  document.getElementById('tab-recent')?.addEventListener('click', () => switchTab('recent'));
  document.getElementById('tab-popular')?.addEventListener('click', () => switchTab('popular'));

  document.getElementById('add-prompt-button')?.addEventListener('click', () => {
    console.log('"添加新提示"按钮被点击了！');
    createOrEditPrompt(false); // 使用createOrEditPrompt函数创建新的Prompt
  });
  
  // 添加自定义事件监听器，用于刷新提示列表
  document.addEventListener('refresh-prompts', ((event: CustomEvent) => {
    const { tab, promptId } = event.detail;
    loadPromptData(tab, tab);
    if (promptId) {
      showToast(`ID: ${promptId} 的Prompt操作成功！列表已刷新（事件触发）。`);
    }
  }) as EventListener);
}

// 切换标签
function switchTab(tabName: string) {
  const tabIds = ['tab-all', 'tab-favorites', 'tab-recent', 'tab-popular'];
  const currentActiveTabId = `tab-${tabName}`;

  tabIds.forEach(tabId => {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.classList.remove(...activeTabClasses, ...inactiveTabClasses);
      if (tabId === currentActiveTabId) {
        tabElement.classList.add(...activeTabClasses);
      } else {
        tabElement.classList.add(...inactiveTabClasses);
      }
    }
  });
  
  loadPromptData(tabName, tabName);
}

let mockPrompts: MarketplacePrompt[] = [];

// 加载提示数据
function loadPromptData(sortBy: string = 'popular', currentTabName: string = 'popular') {
  mockPrompts = [
    { id: "1", title: "高级SEO内容创作器", content: "为{{topic}}写一篇针对关键词{{keyword}}的SEO优化博客文章。包括引言、至少3个小标题和结论。", description: "创建具有适当结构的SEO友好博客内容", tags: ["写作", "seo", "博客"], language: "en", category: "Content Creation", author: "seomaster", rating: 4.8, downloads: 1250, createdAt: new Date(2023, 3, 15)},
    { id: "2", title: "代码审查助手专业版", content: "请帮我审查以下{{language}}代码，找出潜在的bug、性能问题和安全漏洞：\n\n```{{language}}\n{{code}}\n```", description: "帮助审查代码，发现潜在问题，提供专业建议", tags: ["编程", "审查", "安全"], language: "zh", category: "Development", author: "codereviewer", rating: 4.9, downloads: 3200, createdAt: new Date(2023, 2, 10)},
    { id: "3", title: "会议总结专家", content: `将以下会议记录总结为要点、行动项目和已做决定：\n\n{{transcript}}`, description: "使用高级NLP从会议记录中提取重要信息", tags: ["效率", "商业", "总结"], language: "en", category: "Productivity", author: "meetingmaster", rating: 4.7, downloads: 980, createdAt: new Date(2023, 4, 5)},
    { id: "4", title: "学习计划生成器高级版", content: "请为我创建一个为期{{duration}}的{{subject}}学习计划。我的目标是{{goal}}，我每周可以投入{{hours_per_week}}小时学习。", description: "生成个性化学习计划", tags: ["教育", "计划", "学习"], language: "zh", category: "Education", author: "eduexpert", rating: 4.6, downloads: 750, createdAt: new Date(2023, 1, 20)},
    { id: "5", title: "电商产品描述生成器", content: "为{{product_name}}创建一个引人注目的产品描述，包含以下特点：{{features}}。目标受众：{{audience}}。包含SEO关键词：{{keywords}}。", description: "为在线商店生成有说服力的产品描述", tags: ["电商", "营销", "文案"], language: "en", category: "Business", author: "ecomwriter", rating: 4.5, downloads: 2100, createdAt: new Date(2023, 3, 25)},
    { id: "6", title: "创意故事生成器", content: "请以{{setting}}为背景，创作一个关于{{character}}的短篇故事。故事应包含以下元素：{{elements}}，并以{{tone}}的风格呈现。", description: "生成创意短篇故事", tags: ["创意", "写作", "故事"], language: "zh", category: "Creative", author: "storycrafter", rating: 4.7, downloads: 1800, createdAt: new Date(2023, 2, 15)},
  ];

  let sortedPrompts = [...mockPrompts];
  switch (sortBy) {
    case 'popular': sortedPrompts.sort((a, b) => b.downloads - a.downloads); break;
    case 'recent': sortedPrompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
    case 'all': sortedPrompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
    case 'favorites':
      showToast('"收藏"功能正在开发中，当前显示热门提示。');
      sortedPrompts.sort((a, b) => b.downloads - a.downloads); break;
    default: sortedPrompts.sort((a, b) => b.downloads - a.downloads);
  }

  renderPrompts(sortedPrompts, currentTabName);
  filterPrompts();
}

// 渲染Prompts
function renderPrompts(prompts: MarketplacePrompt[], _currentTabName: string) {
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
  const formatDate = (date: Date) => date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  
  card.innerHTML = `
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="text-base font-medium">${prompt.title}</h3>
        <div class="flex items-center gap-2">
          <button class="favorite-prompt-btn p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" data-prompt-id="${prompt.id}" title="收藏">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
          <div class="relative">
            <button class="more-options-btn p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" data-prompt-id="${prompt.id}" title="更多选项">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            <div class="options-menu hidden absolute right-0 mt-1 w-32 border rounded-md shadow-lg z-10 bg-white dark:bg-gray-700 dark:border-gray-600">
              <button class="edit-prompt-btn w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600" data-promptid="${prompt.id}">编辑</button>
              <button class="delete-prompt-btn w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600" data-promptid="${prompt.id}">删除</button>
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
  
  card.querySelector('.use-prompt-btn')?.addEventListener('click', (e) => {
    const promptId = (e.currentTarget as HTMLElement).getAttribute('data-prompt-id');
    if (promptId) {
      const promptToUse = mockPrompts.find(p => p.id === promptId);
      if (promptToUse) insertPromptToInput(promptToUse.content);
    }
  });
  
  card.querySelector('.more-options-btn')?.addEventListener('click', (e) => {
    const optionsMenu = (e.currentTarget as HTMLElement).closest('.relative')?.querySelector('.options-menu');
    if (optionsMenu) optionsMenu.classList.toggle('hidden');
  });
  
  card.querySelector('.favorite-prompt-btn')?.addEventListener('click', (e) => {
    const promptId = (e.currentTarget as HTMLElement).getAttribute('data-prompt-id');
    if (promptId) {
      toggleFavoritePrompt(promptId);
      const svg = (e.currentTarget as HTMLElement).querySelector('svg');
      if (svg) {
        svg.getAttribute('fill') === 'none' ? svg.setAttribute('fill', 'currentColor') : svg.setAttribute('fill', 'none');
      }
    }
  });

  const editButton = card.querySelector('.edit-prompt-btn');
  editButton?.addEventListener('click', async (e) => {
      const promptId = (e.currentTarget as HTMLElement).dataset.promptid;
      if (promptId) {
          const promptDataFromStorage = await ChromeStorage.getPrompt(promptId);
          if (promptDataFromStorage) {
              // Map ChromeStorage.Prompt to MarketplacePrompt for the form
              const mappedPromptData: MarketplacePrompt = {
                  id: promptDataFromStorage.id,
                  title: promptDataFromStorage.title,
                  content: promptDataFromStorage.content,
                  description: promptDataFromStorage.description,
                  tags: promptDataFromStorage.tags,
                  language: promptDataFromStorage.language,
                  category: promptDataFromStorage.category,
                  author: promptDataFromStorage.authorName, 
                  rating: promptDataFromStorage.rating,
                  downloads: promptDataFromStorage.downloads,
                  createdAt: new Date(promptDataFromStorage.createdAt),
              };
              createOrEditPrompt(true, mappedPromptData);
          } else {
              showToast("无法找到要编辑的提示。");
          }
      }
  });

  const deleteButton = card.querySelector('.delete-prompt-btn');
  deleteButton?.addEventListener('click', async (e) => {
      const promptId = (e.currentTarget as HTMLElement).dataset.promptid;
      // It's better to use the title from the prompt object associated with this card
      const promptTitle = prompt.title; 
      if (promptId && confirm(`确定要删除提示 "${promptTitle}" 吗？`)) {
          await ChromeStorage.deletePrompt(promptId);
          showToast(`提示 "${promptTitle}" 已删除。`);
          const activeTabElement = document.querySelector('.tab-button.font-semibold');
          let currentTab = 'popular';
          if (activeTabElement && activeTabElement.id) {
              currentTab = activeTabElement.id.replace('tab-', '');
          }
          loadPromptData(currentTab, currentTab);
      }
  });
  
  return card;
}

// 将Prompt插入到聊天输入框
function insertPromptToInput(promptText: string) {
  const geminiTextarea = document.querySelector('textarea[aria-label="Type something or pick one from prompt gallery"], textarea[placeholder*="Enter a prompt here"], textarea[data-testid="chat-input"]');
  const chatGptTextarea = document.getElementById('prompt-textarea');
  let targetTextarea: HTMLTextAreaElement | null = geminiTextarea as HTMLTextAreaElement || chatGptTextarea as HTMLTextAreaElement || document.querySelector('textarea');
  
  if (targetTextarea) {
    targetTextarea.value = promptText;
    targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    targetTextarea.dispatchEvent(new Event('focus'));
    targetTextarea.focus();
    targetTextarea.style.height = 'auto';
    targetTextarea.style.height = `${targetTextarea.scrollHeight}px`;
    showToast('Prompt已成功插入到对话框');
  } else {
    showToast('无法找到输入框，请手动复制Prompt');
    console.error('找不到输入框元素');
  }
}

// 切换收藏状态 (模拟)
function toggleFavoritePrompt(promptId: string) {
  console.log(`ImmersivePrompt: Toggling favorite for prompt ${promptId}`);
  showToast('收藏状态已更新 (模拟)');
}

// Toast消息 (使用从 utils 导入的)
function showToast(message: string) {
    utilShowToast(message);
}

// 过滤Prompts
function filterPrompts() {
  const searchInput = document.getElementById('prompt-search') as HTMLInputElement;
  const searchQuery = searchInput?.value.toLowerCase().trim() || '';
  const promptCards = document.querySelectorAll('#prompts-grid > div.prompt-card');
  promptCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const description = card.querySelector('p.prompt-description')?.textContent?.toLowerCase() || '';
    const tags = Array.from(card.querySelectorAll('.tag-item')).map(tag => tag.textContent?.toLowerCase() || '');
    const matchesSearch = searchQuery === '' || title.includes(searchQuery) || description.includes(searchQuery) || tags.some(tag => tag.includes(searchQuery));
    (card as HTMLElement).style.display = matchesSearch ? '' : 'none';
  });
}

// 更新视图切换函数，并导出供其他模块使用
export function togglePromptView(view: 'home' | 'promptForm', promptToEdit?: MarketplacePrompt) {
  currentView = view;
  const homePageContainer = document.getElementById('ai-prompt-home-page');
  if (!homePageContainer) {
    console.error("ImmersivePrompt: Cannot find #ai-prompt-home-page container");
    return;
  }

  const mainContentArea = homePageContainer.querySelector<HTMLElement>('#home-view-main-content');
  const existingFormView = homePageContainer.querySelector<HTMLElement>('#prompt-form-view-container');

  if (existingFormView) existingFormView.remove();

  if (view === 'promptForm') {
    if (mainContentArea) mainContentArea.style.display = 'none';
    
    // 使用PromptFormView组件替代旧的createPromptView
    const promptFormContainer = document.createElement('div');
    promptFormContainer.id = 'prompt-form-view-container';
    
    // 创建一个简单的表单视图，后续可以通过React渲染替换
    promptFormContainer.innerHTML = `
      <div class="p-4 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}">
        <h3 class="text-lg font-medium mb-4">${promptToEdit ? '编辑' : '创建新'} Prompt</h3>
        <p class="text-sm mb-4">请使用React组件版本的PromptFormView</p>
      </div>
    `;
    
    const header = homePageContainer.querySelector('header');
    header?.insertAdjacentElement('afterend', promptFormContainer);
    updateHeaderForViewChange(true, !!promptToEdit);
    
    // 触发React组件渲染 - 这里仅占位，实际需要通过React渲染机制
    if (chrome.runtime) {
      chrome.runtime.sendMessage({ 
        action: "renderPromptForm", 
        targetElementId: 'prompt-form-view-container',
        isEditing: !!promptToEdit,
        promptData: promptToEdit
      });
    }
  } else { // view === 'home'
    if (mainContentArea) mainContentArea.style.display = 'block';
    updateHeaderForViewChange(false);
    const activeTabElement = document.querySelector('.tab-button.font-semibold');
    let currentTab = 'popular';
    if (activeTabElement && activeTabElement.id) {
      currentTab = activeTabElement.id.replace('tab-', '');
    }
    loadPromptData(currentTab, currentTab);
  }
}

// 更新Header以适应不同视图
function updateHeaderForViewChange(isFormView: boolean, isEditing: boolean = false) {
  const header = document.querySelector('#ai-prompt-home-page header');
  if (!header) return;

  const titleElement = header.querySelector('h1');
  const rightButtonsContainer = header.querySelector<HTMLElement>('.flex.items-center.space-x-2');
  const existingBackButton = header.querySelector<HTMLElement>('#back-to-home-button');

  if (existingBackButton) existingBackButton.remove();

  if (isFormView) {
    if (titleElement) {
      const backButton = document.createElement('button');
      backButton.id = 'back-to-home-button';
      backButton.className = 'p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2';
      backButton.title = '返回首页';
      backButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;
      backButton.onclick = () => togglePromptView('home');
      
      const titleContainer = titleElement.parentElement;
      if (titleContainer) titleContainer.insertBefore(backButton, titleElement);
      titleElement.textContent = isEditing ? '编辑 Prompt' : '创建新 Prompt';
    }
    if (rightButtonsContainer) rightButtonsContainer.style.display = 'none';
  } else {
    if (titleElement) titleElement.textContent = 'Prompt 首页';
    if (rightButtonsContainer) rightButtonsContainer.style.display = 'flex';
  }
}

// 消息监听器
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "promptAddedRefresh") {
      console.log('ImmersivePrompt: Received promptAddedRefresh, newPromptId:', request.newPromptId);
      if (currentView !== 'home') {
        // If not on home, switch to home. This will trigger loadPromptData.
        togglePromptView('home'); 
      } else {
        // If already on home, just reload data for the current tab.
        const activeTabElement = document.querySelector('.tab-button.font-semibold');
        let currentTab = 'popular';
        if (activeTabElement && activeTabElement.id) {
          currentTab = activeTabElement.id.replace('tab-', '');
        }
        loadPromptData(currentTab, currentTab);
      }

      if (request.newPromptId) {
        showToast(`ID: ${request.newPromptId} 的Prompt操作成功！列表已刷新。`);
        // Future: Implement scrollToPrompt(request.newPromptId) if needed
      } else {
        showToast('列表已刷新。');
      }
      
      sendResponse({ status: "首页已收到刷新请求并处理完毕" });
      return true; // Indicate async response if needed, though for notifications often not strictly required to return true.
    }
  });
}