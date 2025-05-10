import type { MarketplacePrompt } from '../types/prompt';

let currentPrompts: MarketplacePrompt[] = [];
let originalPrompts: MarketplacePrompt[] = [];
let homePageIsDarkMode: boolean = false;

// 主题切换的回调函数类型
type ThemeToggleCallback = () => void;
let externalThemeToggleCallback: ThemeToggleCallback | null = null;


// Function to create a single prompt card
function createPromptCard(prompt: MarketplacePrompt): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'prompt-card p-4 border rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between';
  // 根据 homePageIsDarkMode 设置卡片初始主题色
  if (homePageIsDarkMode) {
    card.classList.add('dark-theme-card');
  } else {
    card.classList.add('light-theme-card');
  }

  let tagsHTML = '';
  if (prompt.tags && prompt.tags.length > 0) {
    tagsHTML = prompt.tags.map(tag => `<span class="tag-item text-xs px-2 py-1 border rounded-full">${tag}</span>`).join(' ');
  }

  card.innerHTML = `
    <div>
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold">${prompt.title}</h3>
        <div class="flex items-center gap-2">
          <button title="收藏" class="favorite-prompt-btn p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
          </button>
          <button title="更多选项" class="more-options-btn p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
      <p class="prompt-description text-sm mb-3 min-h-[40px]">${prompt.description}</p>
      <div class="flex flex-wrap gap-2 mb-3">
        <span class="tag-item text-xs px-2 py-1 border rounded-full">${prompt.category}</span>
        <span class="tag-item text-xs px-2 py-1 border rounded-full">${prompt.language === 'en' ? 'English' : '中文'}</span>
      </div>
      <div class="flex flex-wrap gap-2 mb-3">
        ${tagsHTML}
      </div>
    </div>
    <div class="flex justify-between items-center mt-auto">
      <p class="text-xs text-gray-500 dark:text-gray-400">Used ${prompt.downloads} times · Last: ${prompt.createdAt.toLocaleDateString()}</p>
      <button class="use-prompt-btn bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Use
      </button>
    </div>
  `;

  // Event listener for the "Use" button
  const useButton = card.querySelector('.use-prompt-btn');
  useButton?.addEventListener('click', () => {
    // Logic to insert prompt.content into the chat input
    // This needs to be implemented based on how you identify the chat input on the page
    console.log('Using prompt:', prompt.title, prompt.content);
    alert(`Prompt content:\n${prompt.content}\n\n(Implement insertion logic here)`);
    // Optionally close the marketplace after use
    // toggleMarketplaceUI(); // This function is in content.ts, need a way to call it
  });

  return card;
}

// Function to render prompts in the grid
function renderPrompts(promptsToRender: MarketplacePrompt[]) {
  const promptsGrid = document.getElementById('prompts-grid-home');
  if (!promptsGrid) return;

  promptsGrid.innerHTML = ''; // Clear existing prompts
  promptsToRender.forEach(prompt => {
    const promptCard = createPromptCard(prompt);
    promptsGrid.appendChild(promptCard);
  });
  updateThemeForCards(); // Ensure new cards get correct theme
}

// Filter and sort prompts
function filterAndSortPrompts() {
  const searchInput = document.getElementById('marketplace-search-home') as HTMLInputElement;
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  let filtered = [...originalPrompts];

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get active tab for sorting
  const popularTab = document.getElementById('tab-popular-home');
  const recentTab = document.getElementById('tab-recent-home');
  // const favoritesTab = document.getElementById('tab-favorites-home'); // For future use

  if (popularTab?.classList.contains('active-tab')) {
    filtered.sort((a, b) => b.downloads - a.downloads);
  } else if (recentTab?.classList.contains('active-tab')) {
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  // Add sorting for "All" (default or by creation date desc) and "Favorites" later

  currentPrompts = filtered;
  renderPrompts(currentPrompts);
}

function switchHomePageTab(tabName: 'all' | 'favorites' | 'recent' | 'popular') {
  const tabElements = {
    all: document.getElementById('tab-all-home'),
    favorites: document.getElementById('tab-favorites-home'),
    recent: document.getElementById('tab-recent-home'),
    popular: document.getElementById('tab-popular-home'),
  };

  for (const key in tabElements) {
    tabElements[key as keyof typeof tabElements]?.classList.remove('active-tab', 'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    tabElements[key as keyof typeof tabElements]?.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
  }

  const selectedTab = tabElements[tabName];
  if (selectedTab) {
    selectedTab.classList.add('active-tab', 'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
    selectedTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
  }
  filterAndSortPrompts(); // Re-filter/sort based on new tab
}

function updateThemeForHomePage(isDark: boolean) {
    homePageIsDarkMode = isDark;
    const marketplaceHomePage = document.getElementById('marketplace-home-page-content');
    const themeIcon = document.getElementById('theme-toggle-icon-home');

    if (marketplaceHomePage) {
        if (isDark) {
            marketplaceHomePage.classList.add('dark');
        } else {
            marketplaceHomePage.classList.remove('dark');
        }
    }
    
    if (themeIcon) {
        themeIcon.innerHTML = isDark ? `
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
        `;
    }
    updateThemeForCards();
}

function updateThemeForCards() {
    const cards = document.querySelectorAll('.prompt-card');
    cards.forEach(card => {
        if (homePageIsDarkMode) {
            card.classList.add('dark-theme-card');
            card.classList.remove('light-theme-card');
        } else {
            card.classList.add('light-theme-card');
            card.classList.remove('dark-theme-card');
        }
    });
}


function addHomePageThemeStyles() {
  const styleElement = document.getElementById('marketplace-home-page-styles') || document.createElement('style');
  styleElement.id = 'marketplace-home-page-styles';
  styleElement.textContent = `
    /* Light theme for home page content */
    #marketplace-home-page-content {
      background-color: #f9fafb; /* Tailwind gray-50 */
      color: #1f2937; /* Tailwind gray-800 */
    }
    #marketplace-home-page-content.dark {
      background-color: #111827; /* Tailwind gray-900 */
      color: #f3f4f6; /* Tailwind gray-100 */
    }
    #marketplace-home-page-content .search-input {
        background-color: #ffffff;
        border-color: #d1d5db; /* Tailwind gray-300 */
        color: #1f2937;
    }
    #marketplace-home-page-content.dark .search-input {
        background-color: #1f2937; /* Tailwind gray-800 */
        border-color: #374151; /* Tailwind gray-700 */
        color: #f3f4f6;
    }
    #marketplace-home-page-content .tab-button {
        color: #6b7280; /* Tailwind gray-500 */
        border-color: transparent;
    }
    #marketplace-home-page-content.dark .tab-button {
        color: #9ca3af; /* Tailwind gray-400 */
    }
    #marketplace-home-page-content .tab-button.active-tab {
        color: #3b82f6; /* Tailwind blue-500 */
        border-color: #3b82f6;
    }
    #marketplace-home-page-content.dark .tab-button.active-tab {
        color: #60a5fa; /* Tailwind blue-400 */
        border-color: #60a5fa;
    }
    /* Prompt Card Theming */
    .prompt-card.light-theme-card {
        background-color: #ffffff;
        border-color: #e5e7eb; /* Tailwind gray-200 */
        color: #1f2937;
    }
    .prompt-card.light-theme-card .prompt-description { color: #4b5563; /* Tailwind gray-600 */ }
    .prompt-card.light-theme-card .tag-item { background-color: #f3f4f6; border-color: #e5e7eb; color: #4b5563; }
    .prompt-card.light-theme-card .favorite-prompt-btn,
    .prompt-card.light-theme-card .more-options-btn { color: #6b7280; }
    .prompt-card.light-theme-card .text-gray-500 { color: #6b7280; }


    .prompt-card.dark-theme-card {
        background-color: #1f2937; /* Tailwind gray-800 */
        border-color: #374151; /* Tailwind gray-700 */
        color: #f3f4f6;
    }
    .prompt-card.dark-theme-card .prompt-description { color: #d1d5db; /* Tailwind gray-300 */ }
    .prompt-card.dark-theme-card .tag-item { background-color: #374151; border-color: #4b5563; color: #d1d5db; }
    .prompt-card.dark-theme-card .favorite-prompt-btn,
    .prompt-card.dark-theme-card .more-options-btn { color: #9ca3af; }
    .prompt-card.dark-theme-card .text-gray-400 { color: #9ca3af; }
    
    .use-prompt-btn { /* Ensure this button has consistent styling regardless of card theme */ }
  `;
  document.head.appendChild(styleElement);
}


export function createMarketplaceHomePage(
    container: HTMLElement, 
    initialIsDarkMode: boolean, 
    promptsData: MarketplacePrompt[],
    themeToggleCb: ThemeToggleCallback
) {
  homePageIsDarkMode = initialIsDarkMode;
  originalPrompts = promptsData;
  currentPrompts = [...originalPrompts];
  externalThemeToggleCallback = themeToggleCb;

  container.innerHTML = `
    <div id="marketplace-home-page-content" class="flex flex-col h-full ${initialIsDarkMode ? 'dark' : ''}">
      <!-- Header -->
      <header class="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-xl font-bold">Immersive Prompt 2</h1>
        <div class="flex items-center gap-3">
          <button title="收藏夹" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button id="theme-toggle-home" title="切换主题" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <span id="theme-toggle-icon-home">
              <!-- SVG will be inserted by updateThemeForHomePage -->
            </span>
          </button>
          <button title="设置" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- Search and Filters -->
      <div class="p-4 space-y-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <input id="marketplace-search-home" type="text" placeholder="Search prompts..." class="search-input w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400">
        </div>
        
        <div class="flex border-b border-gray-200 dark:border-gray-700">
          <button id="tab-all-home" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2 active-tab">All</button>
          <button id="tab-favorites-home" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2">Favorites</button>
          <button id="tab-recent-home" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2">Recent</button>
          <button id="tab-popular-home" class="tab-button flex-1 py-2 px-1 text-sm font-medium border-b-2">Popular</button>
        </div>
      </div>
      
      <!-- Prompts Grid -->
      <div id="prompts-container-home" class="flex-1 overflow-y-auto p-4">
        <div id="prompts-grid-home" class="grid grid-cols-1 gap-4">
          <!-- Prompt cards will be inserted here by renderPrompts -->
        </div>
      </div>
    </div>
  `;

  addHomePageThemeStyles(); // Add specific styles for the home page
  updateThemeForHomePage(homePageIsDarkMode); // Set initial theme icon

  // Event Listeners
  document.getElementById('marketplace-search-home')?.addEventListener('input', filterAndSortPrompts);
  document.getElementById('tab-all-home')?.addEventListener('click', () => switchHomePageTab('all'));
  document.getElementById('tab-favorites-home')?.addEventListener('click', () => switchHomePageTab('favorites'));
  document.getElementById('tab-recent-home')?.addEventListener('click', () => switchHomePageTab('recent'));
  document.getElementById('tab-popular-home')?.addEventListener('click', () => switchHomePageTab('popular'));
  
  document.getElementById('theme-toggle-home')?.addEventListener('click', () => {
      if(externalThemeToggleCallback) {
          externalThemeToggleCallback(); 
          // The actual update of homePageIsDarkMode and UI will be handled by the callback via updateThemeForHomePage
      }
  });


  // Initial rendering
  filterAndSortPrompts(); // Render with default "All" tab
  switchHomePageTab('all'); // Explicitly set "All" as active and trigger sort/render
}

// This function will be called by content.ts when the global theme changes
export function updateHomePageTheme(isDark: boolean) {
    updateThemeForHomePage(isDark);
}