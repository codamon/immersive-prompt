// src/content/promptFormView.ts

import ChromeStorage from '../storage/chromeStorage'; // 确保路径正确
import { showToast } from './utils'; // 假设你有一个 utils.ts 存放 showToast
import type { MarketplacePrompt } from '../types/prompt'; // 或你自己的 Prompt 类型

// 表单状态接口 (可选，但推荐)
interface PromptFormState {
  id?: string; // 用于编辑模式
  title: string;
  content: string;
  description: string;
  category: string;
  language: string;
  tagInput: string;
  tags: string[];
}

let formState: PromptFormState;

// 回调函数类型，当表单保存或取消时调用
type OnFormInteractionCallback = (action: 'saved' | 'cancelled', promptId?: string) => void;
let onFormComplete: OnFormInteractionCallback | null = null;
let currentIsDarkMode = false;


// 渲染标签的辅助函数
function renderTagsUI(tagsContainerElement: HTMLElement) {
  if (!tagsContainerElement) return;
  tagsContainerElement.innerHTML = formState.tags.map(tag => `
    <span class="flex items-center gap-1 px-2 py-1 text-xs rounded-full ${currentIsDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}">
      ${tag}
      <button type="button" class="remove-tag-button p-0.5 rounded-full hover:bg-red-500 hover:text-white ${currentIsDarkMode ? 'text-gray-400' : 'text-gray-500'}" data-tag="${tag}" title="移除标签">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </span>
  `).join('');

  tagsContainerElement.querySelectorAll('.remove-tag-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tagToRemove = (e.currentTarget as HTMLElement).dataset.tag;
      if (tagToRemove) {
        formState.tags = formState.tags.filter(t => t !== tagToRemove);
        renderTagsUI(tagsContainerElement); // 再次渲染以更新UI
      }
    });
  });
}

function attachFormEventListeners(formElement: HTMLElement, initialPrompt?: Partial<PromptFormState>) {
    const titleInput = formElement.querySelector('#form-prompt-title') as HTMLInputElement;
    const contentTextarea = formElement.querySelector('#form-prompt-content') as HTMLTextAreaElement;
    const descriptionTextarea = formElement.querySelector('#form-prompt-description') as HTMLTextAreaElement;
    const categorySelect = formElement.querySelector('#form-prompt-category') as HTMLSelectElement;
    const languageSelect = formElement.querySelector('#form-prompt-language') as HTMLSelectElement;
    const tagInputElement = formElement.querySelector('#form-prompt-tags-input') as HTMLInputElement;
    const addTagButton = formElement.querySelector('#form-add-tag-button');
    const saveButton = formElement.querySelector('#form-save-prompt-button');
    const cancelButton = formElement.querySelector('#form-cancel-button'); // 新增取消按钮
    const tagsContainer = formElement.querySelector('#form-tags-container') as HTMLElement;

    // 初始化表单值
    if (initialPrompt) {
        titleInput.value = initialPrompt.title || "";
        contentTextarea.value = initialPrompt.content || "";
        descriptionTextarea.value = initialPrompt.description || "";
        categorySelect.value = initialPrompt.category || "";
        languageSelect.value = initialPrompt.language || "en";
        formState.tags = initialPrompt.tags || []; // 确保 tags 也被初始化
    }
    renderTagsUI(tagsContainer);


    titleInput.oninput = (e) => formState.title = (e.target as HTMLInputElement).value;
    contentTextarea.oninput = (e) => formState.content = (e.target as HTMLTextAreaElement).value;
    descriptionTextarea.oninput = (e) => formState.description = (e.target as HTMLTextAreaElement).value;
    categorySelect.onchange = (e) => formState.category = (e.target as HTMLSelectElement).value;
    languageSelect.onchange = (e) => formState.language = (e.target as HTMLSelectElement).value;
    tagInputElement.oninput = (e) => formState.tagInput = (e.target as HTMLInputElement).value;
    
    const handleAddTagAction = () => {
        const newTag = formState.tagInput.trim();
        if (newTag && !formState.tags.includes(newTag)) {
            formState.tags.push(newTag);
            formState.tagInput = "";
            tagInputElement.value = "";
            renderTagsUI(tagsContainer);
        }
        tagInputElement.focus(); // 添加后重新聚焦输入框
    };

    addTagButton?.addEventListener('click', handleAddTagAction);
    tagInputElement.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTagAction();
        }
    };
    
    saveButton?.addEventListener('click', async () => {
        if (!formState.title.trim() || !formState.content.trim()) {
          showToast('标题和内容不能为空！');
          return;
        }
        try {
          const promptDataPayload = { // 这个对象符合 ChromeStorage.addPrompt 和 .updatePrompt 的期望
            title: formState.title.trim(),
            content: formState.content.trim(),
            description: formState.description.trim(),
            tags: formState.tags,
            language: formState.language,
            category: formState.category || 'Other',
            // 下面的字段在编辑时会被覆盖，添加时是新值
            authorId: "local-user-content-script", // 或者从更全局的地方获取
            authorName: "用户",
            rating: formState.id ? (await ChromeStorage.getPrompt(formState.id))?.rating || 0 : 0, // 编辑时保留原rating
            downloads: formState.id ? (await ChromeStorage.getPrompt(formState.id))?.downloads || 0 : 0, // 编辑时保留原downloads
            isFavorite: formState.id ? (await ChromeStorage.getPrompt(formState.id))?.isFavorite || false : false,
            source: 'local' as 'local' | 'remote',
            status: 'published' as 'draft' | 'published',
            lastUsedAt: formState.id ? (await ChromeStorage.getPrompt(formState.id))?.lastUsedAt || null : null,
            syncedAt: null, // 同步相关字段
            remoteId: null,
          };

          let savedPromptId: string | undefined;

          if (formState.id) { // 编辑模式
            const updatedPrompt = await ChromeStorage.updatePrompt(formState.id, promptDataPayload);
            savedPromptId = updatedPrompt?.id;
            showToast('Prompt 更新成功!');
          } else { // 添加模式
            const newPrompt = await ChromeStorage.addPrompt(promptDataPayload);
            savedPromptId = newPrompt.id;
            showToast('Prompt 添加成功!');
          }
          
          if (onFormComplete && savedPromptId) {
            onFormComplete('saved', savedPromptId);
          }
        } catch (error) {
          console.error('保存Prompt失败:', error);
          showToast('保存Prompt失败，请查看控制台。');
        }
    });

    cancelButton?.addEventListener('click', () => {
        if (onFormComplete) {
            onFormComplete('cancelled');
        }
    });
}


export function createPromptView(
    isDark: boolean, 
    callback: OnFormInteractionCallback,
    promptToEdit?: MarketplacePrompt // 可选参数，用于编辑模式
): HTMLElement {
  currentIsDarkMode = isDark;
  onFormComplete = callback;

  // 初始化/重置表单状态
  formState = {
    id: promptToEdit?.id,
    title: promptToEdit?.title || "",
    content: promptToEdit?.content || "",
    description: promptToEdit?.description || "",
    category: promptToEdit?.category || "",
    language: promptToEdit?.language || "en",
    tagInput: "",
    tags: promptToEdit?.tags ? [...promptToEdit.tags] : [], // 创建副本
  };

  const container = document.createElement('div');
  container.id = 'prompt-form-view-container'; // 改为更通用的名字
  container.className = `flex-1 overflow-auto p-4 space-y-4 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`;

  const formTitle = promptToEdit ? "编辑 Prompt" : "创建新 Prompt";

  // HTML 结构与之前类似，但会使用 formState 来预填值
  container.innerHTML = `
    {/* Header已经在content.ts中处理，这里只包含表单内容 */}
    {/* <h2 class="text-xl font-semibold mb-4">${formTitle}</h2> {/* 这个标题也可以在 content.ts 的 updateHeaderFor... 中设置 */}

    <div class="space-y-2">
      <label for="form-prompt-title" class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">标题 <span class="text-red-500">*</span></label>
      <input type="text" id="form-prompt-title" placeholder="输入提示标题" value="${formState.title}" 
             class="mt-1 block w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
    </div>

    <div class="space-y-2">
      <label for="form-prompt-content" class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">Prompt 内容 <span class="text-red-500">*</span></label>
      <textarea id="form-prompt-content" placeholder="输入你的Prompt内容。使用 {{variable}} 作为模板变量。" 
                class="min-h-[120px] mt-1 block w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >${formState.content}</textarea>
      <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}">
        使用 {{ variable_name }} 语法创建用户稍后会填写的模板变量。
      </p>
    </div>

    <div class="space-y-2">
      <label for="form-prompt-description" class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">描述</label>
      <textarea id="form-prompt-description" placeholder="简要描述这个Prompt的作用" 
                class="mt-1 block w-full h-20 px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >${formState.description}</textarea>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="form-prompt-category" class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">分类</label>
        <select id="form-prompt-category" value="${formState.category}" 
                class="mt-1 block w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
          <option value="">选择分类</option>
          <option value="Content Creation" ${formState.category === 'Content Creation' ? 'selected' : ''}>内容创作</option>
          <option value="Development" ${formState.category === 'Development' ? 'selected' : ''}>开发</option>
          <option value="Productivity" ${formState.category === 'Productivity' ? 'selected' : ''}>效率</option>
          <option value="Education" ${formState.category === 'Education' ? 'selected' : ''}>教育</option>
          <option value="Business" ${formState.category === 'Business' ? 'selected' : ''}>商业</option>
          <option value="Creative" ${formState.category === 'Creative' ? 'selected' : ''}>创意</option>
          <option value="Other" ${formState.category === 'Other' ? 'selected' : ''}>其他</option>
        </select>
      </div>
      <div class="space-y-2">
        <label for="form-prompt-language" class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">语言</label>
        <select id="form-prompt-language" value="${formState.language}"
                class="mt-1 block w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
          <option value="en" ${formState.language === 'en' ? 'selected' : ''}>English</option>
          <option value="zh" ${formState.language === 'zh' ? 'selected' : ''}>中文</option>
        </select>
      </div>
    </div>

    <div class="space-y-2">
      <label for="form-prompt-tags-input" class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">标签 (输入后按回车或点击+)</label>
      <div class="flex gap-2">
        <input type="text" id="form-prompt-tags-input" placeholder="添加标签"
               class="flex-1 mt-1 block w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <button type="button" id="form-add-tag-button" title="添加标签"
                class="p-2.5 mt-1 text-white ${isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <div id="form-tags-container" class="flex flex-wrap gap-2 mt-2 min-h-[30px]">
        {/* Tags will be rendered here by renderTagsUI */}
      </div>
    </div>
    <div class="pt-4 flex justify-end gap-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-auto">
      <button id="form-cancel-button" type="button" class="px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'text-gray-300 bg-gray-600 hover:bg-gray-500' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} transition-colors">
        取消
      </button>
      <button id="form-save-prompt-button" class="px-4 py-2 text-sm font-semibold text-white ${isDark ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} rounded-lg transition-colors">
        ${promptToEdit ? '更新 Prompt' : '保存 Prompt'}
      </button>
    </div>
  `;
  
  attachFormEventListeners(container, promptToEdit); // 绑定事件并传递初始值（如果是编辑）
  return container;
}