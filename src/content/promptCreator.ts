import type { MarketplacePrompt } from '../types/prompt';
import { showToast } from './utils';

// togglePromptView函数的类型定义
type TogglePromptViewFunction = (view: 'home' | 'promptForm', promptToEdit?: MarketplacePrompt) => void;

// 保存对togglePromptView函数的引用
let togglePromptViewRef: TogglePromptViewFunction | null = null;

// 初始化函数，接收togglePromptView函数的引用
export function initPromptCreator(togglePromptView: TogglePromptViewFunction) {
  togglePromptViewRef = togglePromptView;
}

// 创建或编辑Prompt
export function createOrEditPrompt(isEditing: boolean = false, promptToEdit?: MarketplacePrompt) {
  if (!togglePromptViewRef) {
    console.error("ImmersivePrompt: togglePromptView not initialized");
    return;
  }

  console.log(`${isEditing ? '编辑' : '创建新'} Prompt`);
  togglePromptViewRef('promptForm', promptToEdit);
}

// 保存Prompt后的回调处理
export function handlePromptSaved(promptId: string) {
  console.log(`ID: ${promptId} 的Prompt保存成功！`);
  
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: "promptAddedSuccessfully", newPromptId: promptId }, response => {
      if (chrome.runtime.lastError) {
        console.warn("ImmersivePrompt: Error sending promptAddedSuccessfully message:", chrome.runtime.lastError.message);
        // Fallback if message sending fails
        refreshPromptList(promptId);
      } else if (response) {
        console.log("ImmersivePrompt: Background response to promptAddedSuccessfully:", response);
      }
    });
  } else { 
    console.warn("ImmersivePrompt: chrome.runtime.sendMessage not available, refreshing locally.");
    refreshPromptList(promptId);
  }
}

// 刷新Prompt列表
function refreshPromptList(promptId?: string) {
  // 获取当前活动标签
  const activeTabElement = document.querySelector('.tab-button.font-semibold');
  let currentTab = 'popular';
  
  if (activeTabElement && activeTabElement.id) {
    currentTab = activeTabElement.id.replace('tab-', '');
  }
  
  // 触发列表刷新
  const event = new CustomEvent('refresh-prompts', { 
    detail: { 
      tab: currentTab,
      promptId: promptId
    } 
  });
  document.dispatchEvent(event);
  
  // 显示提示信息
  showToast(`ID: ${promptId} 的Prompt操作成功！列表已刷新。`);
} 