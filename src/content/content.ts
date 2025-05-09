import type { MarketplacePrompt } from '../types/prompt';

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
  // 注入按钮到页面
  injectMarketplaceButton();
  
  // 注入Tailwind CSS
  injectTailwindCSS();
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
  
  if (marketplace) {
    marketplace.remove();
  } else {
    createMarketplaceUI();
  }
}

// 创建Marketplace UI
function createMarketplaceUI() {
  // 创建Marketplace容器
  const marketplace = document.createElement('div');
  marketplace.id = 'ai-prompt-marketplace';
  marketplace.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col h-[600px] w-[400px] bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-2xl';
  
  // 添加标题栏
  marketplace.innerHTML = `
    <header class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button id="marketplace-back" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold">Prompt 市场</h1>
      </div>
    </header>
    
    <div class="p-4 space-y-4">
      <div class="relative">
        <svg class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input id="marketplace-search" type="text" placeholder="搜索市场..." class="w-full pl-8 pr-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
      </div>
      
      <div class="flex gap-2">
        <div class="relative inline-block w-1/2">
          <select id="marketplace-category-filter" class="w-full h-9 pl-6 pr-8 border rounded-md appearance-none dark:bg-gray-700 dark:border-gray-600">
            <option value="all">所有分类</option>
            <option value="Content Creation">内容创作</option>
            <option value="Development">开发</option>
            <option value="Productivity">效率</option>
            <option value="Education">教育</option>
            <option value="Business">商业</option>
            <option value="Creative">创意</option>
          </select>
          <svg class="absolute left-1.5 top-2.5 h-3.5 w-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
        
        <div class="relative inline-block w-1/2">
          <select id="marketplace-language-filter" class="w-full h-9 pl-6 pr-8 border rounded-md appearance-none dark:bg-gray-700 dark:border-gray-600">
            <option value="all">所有语言</option>
            <option value="en">英语</option>
            <option value="zh">中文</option>
          </select>
          <svg class="absolute left-1.5 top-2.5 h-3.5 w-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="flex-1 flex flex-col">
      <div class="px-4">
        <div class="flex w-full border-b">
          <button id="tab-popular" class="flex-1 py-2 border-b-2 border-blue-500 font-medium">热门</button>
          <button id="tab-recent" class="flex-1 py-2 border-b-0 text-gray-500">最新</button>
          <button id="tab-top-rated" class="flex-1 py-2 border-b-0 text-gray-500">高分</button>
        </div>
      </div>
      
      <div id="prompts-container" class="flex-1 overflow-auto p-4">
        <div id="prompts-grid" class="grid gap-3">
          <!-- Prompts will be inserted here -->
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(marketplace);
  
  // 初始化事件监听
  initMarketplaceEvents();
  
  // 加载提示数据
  loadPromptData();
}

// 初始化Marketplace事件监听
function initMarketplaceEvents() {
  // 关闭按钮
  document.getElementById('marketplace-back')?.addEventListener('click', toggleMarketplaceUI);
  
  // 搜索输入框
  document.getElementById('marketplace-search')?.addEventListener('input', filterPrompts);
  
  // 分类过滤器
  document.getElementById('marketplace-category-filter')?.addEventListener('change', filterPrompts);
  
  // 语言过滤器
  document.getElementById('marketplace-language-filter')?.addEventListener('change', filterPrompts);
  
  // 标签切换
  document.getElementById('tab-popular')?.addEventListener('click', () => switchTab('popular'));
  document.getElementById('tab-recent')?.addEventListener('click', () => switchTab('recent'));
  document.getElementById('tab-top-rated')?.addEventListener('click', () => switchTab('top-rated'));
}

// 切换标签
function switchTab(tab: string) {
  // 重置所有标签样式
  const tabs = ['tab-popular', 'tab-recent', 'tab-top-rated'];
  tabs.forEach(tabId => {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.className = 'flex-1 py-2 border-b-0 text-gray-500';
    }
  });
  
  // 设置当前标签样式
  const currentTab = document.getElementById(`tab-${tab}`);
  if (currentTab) {
    currentTab.className = 'flex-1 py-2 border-b-2 border-blue-500 font-medium';
  }
  
  // 重新加载并排序数据
  loadPromptData(tab);
}

// 加载Prompt数据
function loadPromptData(sortBy: string = 'popular') {
  const mockPrompts: MarketplacePrompt[] = [
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
  card.className = 'w-full border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-700 dark:border-gray-600 flex flex-col';
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };
  
  card.innerHTML = `
    <div class="pb-2 p-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-base font-medium">${prompt.title}</h3>
          <div class="flex items-center gap-1 mt-1">
            <span class="px-2 py-0.5 text-xs border rounded-full">${prompt.category}</span>
            <span class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 rounded-full">${prompt.language === "en" ? "英语" : "中文"}</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <svg class="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span class="text-sm font-medium">${prompt.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
    <div class="py-2 px-4">
      <p class="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">${prompt.description}</p>
      <div class="mt-2 flex flex-wrap gap-1">
        ${prompt.tags.map((tag: string) => `<span class="px-2 py-0.5 text-xs border rounded-full">${tag}</span>`).join('')}
      </div>
    </div>
    <div class="pt-2 p-4 flex justify-between items-center border-t">
      <div class="text-xs text-gray-500">
        <span class="font-medium">@${prompt.author}</span> · ${formatDate(prompt.createdAt)}
      </div>
      <button class="import-prompt-btn px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1" data-prompt-id="${prompt.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        导入 (${prompt.downloads})
      </button>
    </div>
  `;
  
  // 添加导入按钮点击事件
  card.querySelector('.import-prompt-btn')?.addEventListener('click', (e) => {
    const promptId = (e.currentTarget as HTMLElement).getAttribute('data-prompt-id');
    if (promptId) {
      importPrompt(promptId);
    }
  });
  
  return card;
}

// 导入Prompt
function importPrompt(promptId: string) {
  // 实际实现中，这里应该将prompt添加到用户的个人库中
  console.log(`导入提示 ${promptId}`);
  
  // 模拟导入成功消息
  showToast('提示已成功导入到您的个人库');
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
  const searchInput = document.getElementById('marketplace-search') as HTMLInputElement;
  const categoryFilter = document.getElementById('marketplace-category-filter') as HTMLSelectElement;
  const languageFilter = document.getElementById('marketplace-language-filter') as HTMLSelectElement;
  
  const searchQuery = searchInput?.value.toLowerCase() || '';
  const categoryValue = categoryFilter?.value || 'all';
  const languageValue = languageFilter?.value || 'all';
  
  // 获取当前激活的标签
  const activeTab = document.querySelector('[id^="tab-"][class*="border-blue-500"]')?.id.replace('tab-', '') || 'popular';
  
  // 重新加载数据并应用过滤器
  loadPromptData(activeTab);
  
  // 应用过滤器到DOM元素
  const promptCards = document.querySelectorAll('#prompts-grid > div');
  promptCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const description = card.querySelector('p')?.textContent?.toLowerCase() || '';
    const category = card.querySelector('.flex.items-center.gap-1.mt-1 > span:first-child')?.textContent || '';
    const language = card.querySelector('.flex.items-center.gap-1.mt-1 > span:last-child')?.textContent === '中文' ? 'zh' : 'en';
    const tags = Array.from(card.querySelectorAll('.mt-2.flex.flex-wrap.gap-1 > span')).map(tag => tag.textContent?.toLowerCase() || '');
    
    const matchesSearch = searchQuery === '' || 
                          title.includes(searchQuery) || 
                          description.includes(searchQuery) || 
                          tags.some(tag => tag.includes(searchQuery));
    
    const matchesCategory = categoryValue === 'all' || category === categoryValue;
    const matchesLanguage = languageValue === 'all' || language === languageValue;
    
    if (matchesSearch && matchesCategory && matchesLanguage) {
      (card as HTMLElement).style.display = '';
    } else {
      (card as HTMLElement).style.display = 'none';
    }
  });
}
