import '../styles/tailwind.css';

console.log('Immersive Prompt Content Script Loaded!');

// 导入或定义提示词类型接口
interface MarketplacePrompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  language: string;
  category: string;
  author: string;
  rating: number;
  downloads: number;
  createdAt: Date;
}

// 示例提示词数据
const mockPrompts: MarketplacePrompt[] = [
  {
    id: "1",
    title: "Advanced SEO Content Writer",
    content:
      "Write an SEO-optimized blog post about {{topic}} that targets the keyword {{keyword}}. Include an introduction, at least 3 subheadings, and a conclusion.",
    description: "Creates SEO-friendly blog content with proper structure",
    tags: ["writing", "seo", "blog"],
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
    tags: ["coding", "review", "security"],
    language: "zh",
    category: "Development",
    author: "codereviewer",
    rating: 4.9,
    downloads: 3200,
    createdAt: new Date(2023, 2, 10),
  },
  {
    id: "3",
    title: "Meeting Summarizer Pro",
    content:
      "Summarize the following meeting transcript into key points, action items, and decisions made:\n\n{{transcript}}",
    description: "Extracts important information from meeting transcripts with advanced NLP",
    tags: ["productivity", "business", "summary"],
    language: "en",
    category: "Productivity",
    author: "meetingmaster",
    rating: 4.7,
    downloads: 980,
    createdAt: new Date(2023, 4, 5),
  },
];

// 将页面内容包装在一个容器中
function wrapPageContent() {
  // 检查是否已经包装过
  if (document.getElementById('immersive-page-content-wrapper')) {
    return;
  }

  // 创建页面内容包装容器
  const wrapper = document.createElement('div');
  wrapper.id = 'immersive-page-content-wrapper';
  wrapper.className = 'overflow-auto h-screen w-full';
  wrapper.style.gridColumn = '1';
  wrapper.style.minWidth = '0'; // 防止溢出

  // 移动body的所有子元素到包装容器
  // 先做一个拷贝以避免集合在迭代过程中变化
  const childNodes = Array.from(document.body.childNodes);
  
  childNodes.forEach(node => {
    // 跳过我们的按钮和Marketplace容器
    if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as Element;
      if (elem.id === 'immersive-prompt-btn' || 
          elem.id === 'immersive-prompt-marketplace' ||
          elem.id === 'immersive-page-content-wrapper') {
        return;
      }
    }
    wrapper.appendChild(node);
  });

  // 将包装容器添加到body
  document.body.appendChild(wrapper);
  
  // 添加必要的body样式
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  document.body.style.overflow = 'hidden'; // 防止外部滚动
  
  return wrapper;
}

// 应用Grid布局
function applyGridLayout(isOpen: boolean) {
  if (isOpen) {
    // 确保内容已包装
    wrapPageContent();
    
    // 设置Grid布局
    document.body.style.display = 'grid';
    document.body.style.gridTemplateColumns = 'auto 420px';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    document.body.style.transition = 'grid-template-columns 0.3s ease';
    
    // 重置任何可能的滚动位置
    window.scrollTo(0, 0);
  } else {
    // 恢复正常布局
    document.body.style.display = '';
    document.body.style.gridTemplateColumns = '';
    document.body.style.height = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
  }
}

function addOpenPromptButton() {
  // 检查按钮是否已存在，避免重复添加
  if (document.getElementById('immersive-prompt-btn')) {
    return;
  }

  // 创建按钮
  const button = document.createElement('button');
  button.id = 'immersive-prompt-btn';
  button.className = 'fixed w-[60px] h-[60px] right-[10px] top-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-full flex items-center justify-center cursor-pointer z-[9999] p-0 text-[10px] transition-colors duration-300 shadow-sm hover:bg-gray-700 select-none';
  
  // 创建SVG图标 - IP的变形字
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-[30px] h-[30px] fill-white">
      <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,16c-0.55,0-1-0.45-1-1 c0-0.55,0.45-1,1-1s1,0.45,1,1C13,15.55,12.55,16,12,16z M13,12h-2V7h2V12z"/>
    </svg>
  `;

  // 创建 Marketplace 容器
  const marketplaceContainer = document.createElement('div');
  marketplaceContainer.id = 'immersive-prompt-marketplace';
  marketplaceContainer.className = 'bg-white shadow-xl border-l border-gray-200 z-[9998] overflow-hidden flex flex-col font-sans text-gray-800';
  marketplaceContainer.style.display = 'none';
  marketplaceContainer.style.gridColumn = '2';
  marketplaceContainer.style.height = '100vh';
  marketplaceContainer.style.position = 'relative';
  marketplaceContainer.style.top = '0';
  marketplaceContainer.style.right = '0';
  marketplaceContainer.style.transform = 'none';
  
  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.id = 'marketplace-close-btn';
  closeButton.className = 'absolute top-[10px] right-[10px] w-6 h-6 rounded-full bg-gray-100 text-gray-800 border-none flex items-center justify-center text-lg cursor-pointer z-[10000] hover:bg-gray-200';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => {
    marketplaceContainer.style.display = 'none';
    button.classList.remove('bg-gray-600');
    button.classList.add('bg-gray-800');
    applyGridLayout(false);
    console.log('Marketplace UI closed');
  };
  
  // 创建 Marketplace UI 结构
  const marketplaceUI = document.createElement('div');
  marketplaceUI.className = 'flex-1 flex flex-col overflow-hidden';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'p-4 border-b border-gray-200';
  header.innerHTML = `
    <h1 class="m-0 mb-4 text-lg font-semibold">Prompt Marketplace</h1>
    <div class="mb-3">
      <input type="text" id="prompt-search" placeholder="Search marketplace..." class="w-full p-2 border border-gray-200 rounded text-sm">
    </div>
    <div class="flex gap-2">
      <select id="category-filter" class="flex-1 py-1.5 px-2 border border-gray-200 rounded text-sm bg-white">
        <option value="all">All Categories</option>
        <option value="Content Creation">Content Creation</option>
        <option value="Development">Development</option>
        <option value="Productivity">Productivity</option>
      </select>
      <select id="language-filter" class="flex-1 py-1.5 px-2 border border-gray-200 rounded text-sm bg-white">
        <option value="all">All Languages</option>
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  `;
  
  // 标签页
  const tabs = document.createElement('div');
  tabs.className = 'px-4 border-b border-gray-200';
  tabs.innerHTML = `
    <div class="flex gap-2">
      <button class="tab-button py-2 px-4 bg-transparent border-0 border-b-2 border-transparent cursor-pointer text-sm text-gray-500 active:text-blue-500 active:border-blue-500 active:font-medium" data-tab="popular">Popular</button>
      <button class="tab-button py-2 px-4 bg-transparent border-0 border-b-2 border-transparent cursor-pointer text-sm text-gray-500" data-tab="recent">Recent</button>
      <button class="tab-button py-2 px-4 bg-transparent border-0 border-b-2 border-transparent cursor-pointer text-sm text-gray-500" data-tab="top-rated">Top Rated</button>
    </div>
  `;
  
  // 内容区域
  const content = document.createElement('div');
  content.className = 'flex-1 overflow-y-auto p-4';
  content.id = 'marketplace-prompts';
  
  // 添加提示词卡片
  populatePrompts(content, mockPrompts);
  
  // 组装 UI
  marketplaceUI.appendChild(header);
  marketplaceUI.appendChild(tabs);
  marketplaceUI.appendChild(content);
  
  marketplaceContainer.appendChild(closeButton);
  marketplaceContainer.appendChild(marketplaceUI);
  
  // 添加事件处理
  const searchInput = marketplaceUI.querySelector('#prompt-search') as HTMLInputElement;
  const categoryFilter = marketplaceUI.querySelector('#category-filter') as HTMLSelectElement;
  const languageFilter = marketplaceUI.querySelector('#language-filter') as HTMLSelectElement;
  const tabButtons = marketplaceUI.querySelectorAll('.tab-button');
  
  // 搜索和过滤功能
  function filterPrompts() {
    const searchQuery = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const language = languageFilter.value;
    const activeTab = marketplaceUI.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'popular';
    
    let filtered = [...mockPrompts];
    
    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(searchQuery) ||
        prompt.description.toLowerCase().includes(searchQuery) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // 分类过滤
    if (category !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === category);
    }
    
    // 语言过滤
    if (language !== 'all') {
      filtered = filtered.filter(prompt => prompt.language === language);
    }
    
    // 排序
    if (activeTab === 'popular') {
      filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (activeTab === 'recent') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (activeTab === 'top-rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    
    // 更新 UI
    populatePrompts(content, filtered);
  }
  
  searchInput.addEventListener('input', filterPrompts);
  categoryFilter.addEventListener('change', filterPrompts);
  languageFilter.addEventListener('change', filterPrompts);
  
  // 标签页切换
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('text-blue-500');
        btn.classList.remove('border-blue-500');
        btn.classList.remove('font-medium');
      });
      button.classList.add('active');
      button.classList.add('text-blue-500');
      button.classList.add('border-blue-500');
      button.classList.add('font-medium');
      filterPrompts();
    });
  });
  
  // 设置第一个标签为激活状态
  const firstTabButton = tabButtons[0];
  if (firstTabButton) {
    firstTabButton.classList.add('active');
    firstTabButton.classList.add('text-blue-500');
    firstTabButton.classList.add('border-blue-500');
    firstTabButton.classList.add('font-medium');
  }

  // UI状态标志
  let isUIOpen = false;

  // 按钮点击事件处理
  button.onclick = (e) => {
    // 防止拖动结束时触发点击
    if (isDragging) {
      e.stopPropagation();
      isDragging = false;
      return;
    }
    
    isUIOpen = !isUIOpen; // 切换状态
    
    if (isUIOpen) {
      // 打开UI
      marketplaceContainer.style.display = 'block';
      button.classList.remove('bg-gray-800');
      button.classList.add('bg-gray-600');
      
      // 应用Grid布局
      applyGridLayout(true);
      
      console.log('Marketplace UI opened');
    } else {
      // 关闭UI
      marketplaceContainer.style.display = 'none';
      button.classList.remove('bg-gray-600');
      button.classList.add('bg-gray-800');
      
      // 恢复正常布局
      applyGridLayout(false);
      
      console.log('Marketplace UI closed');
    }
  };

  // 添加拖动功能
  let isDragging = false;
  let offsetY = 0;
  
  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    offsetY = e.clientY - button.getBoundingClientRect().top;
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // 防止默认行为和冒泡
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // 只计算Y轴位置
    const y = e.clientY - offsetY;
    
    // 设置按钮位置，保持固定在右侧
    button.style.top = `${y}px`;
    button.style.transform = 'translateY(0)'; // 移除Y轴的transform
    
    e.preventDefault();
  };
  
  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  button.addEventListener('mousedown', onMouseDown);

  // 将按钮和面板添加到页面
  document.body.appendChild(button);
  document.body.appendChild(marketplaceContainer);
  console.log('Open Prompt button and Marketplace UI added to page.');
}

// 辅助函数：填充提示词列表
function populatePrompts(container: HTMLElement, prompts: MarketplacePrompt[]) {
  // 清空现有内容
  container.innerHTML = '';
  
  if (prompts.length === 0) {
    container.innerHTML = '<div class="text-center py-5 text-gray-500 text-sm">No prompts found matching your criteria.</div>';
    return;
  }
  
  // 为每个提示词创建卡片
  prompts.forEach(prompt => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 rounded-lg p-3 mb-3';
    
    // 格式化日期
    const date = prompt.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    
    // 格式化标签
    const tags = prompt.tags.map(tag => 
      `<span class="text-xs py-0.5 px-1.5 rounded bg-gray-100 text-gray-600">${tag}</span>`
    ).join('');
    
    // 填充卡片内容
    card.innerHTML = `
      <div class="flex justify-between mb-2">
        <div>
          <h3 class="text-base font-medium m-0 mb-1">${prompt.title}</h3>
          <div class="flex items-center gap-1">
            <span class="text-xs py-0.5 px-1.5 rounded bg-gray-100 text-gray-600">${prompt.category}</span>
            <span class="text-xs py-0.5 px-1.5 rounded bg-blue-50 text-blue-800">${prompt.language === 'en' ? 'English' : '中文'}</span>
          </div>
        </div>
        <div class="flex items-center gap-0.5 text-sm font-medium">
          <span class="text-amber-500">★</span>
          <span>${prompt.rating.toFixed(1)}</span>
        </div>
      </div>
      <div class="text-sm text-gray-500 mb-2 line-clamp-2">${prompt.description}</div>
      <div class="flex flex-wrap gap-1 mb-2">${tags}</div>
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          <span class="font-medium">@${prompt.author}</span> · ${date}
        </div>
        <button class="bg-blue-500 text-white border-none rounded px-2.5 py-1.5 text-xs cursor-pointer flex items-center hover:bg-blue-600">
          <svg class="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 21H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Import (${prompt.downloads})
        </button>
      </div>
    `;
    
    // 添加导入功能
    const importButton = card.querySelector('button');
    if (importButton) {
      importButton.addEventListener('click', () => {
        console.log(`Importing prompt ${prompt.id}`);
        // 这里实现实际的导入功能
      });
    }
    
    container.appendChild(card);
  });
}

// 确保在 DOM 加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addOpenPromptButton);
} else {
  addOpenPromptButton();
}