import React from 'react';
import { createRoot } from 'react-dom/client';
import PromptFormView from './PromptFormView';
import type { MarketplacePrompt } from '../types/prompt';

// 用于在指定容器中渲染PromptFormView组件
export function renderPromptForm(containerId: string, isEditing: boolean, promptData?: MarketplacePrompt) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`无法找到ID为${containerId}的容器元素`);
    return;
  }

  // 清空容器
  container.innerHTML = '';

  // 创建React根节点
  const root = createRoot(container);

  // 处理返回操作
  const handleBack = () => {
    // 触发自定义事件，通知原生代码处理返回操作
    const event = new CustomEvent('prompt-form-back', { 
      detail: { action: 'back' } 
    });
    document.dispatchEvent(event);
  };

  // 渲染PromptFormView组件
  root.render(
    React.createElement(PromptFormView, {
      isEditing: isEditing,
      promptToEdit: promptData,
      onBack: handleBack
    })
  );
}

// 监听消息，当收到renderPromptForm请求时执行渲染
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'renderPromptForm') {
      renderPromptForm(
        request.targetElementId,
        request.isEditing || false,
        request.promptData
      );
      sendResponse({ success: true });
      return true;
    }
    return false;
  });
}

// 监听自定义事件
document.addEventListener('prompt-form-back', (e: Event) => {
  const customEvent = e as CustomEvent;
  if (customEvent.detail?.action === 'back') {
    // 这里可以调用content.ts中的函数切换回主视图
    // 因为没有直接的引用，所以通过消息传递或触发另一个事件
    const event = new CustomEvent('toggle-prompt-view', { 
      detail: { view: 'home' } 
    });
    document.dispatchEvent(event);
  }
}); 