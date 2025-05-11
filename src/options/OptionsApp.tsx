import React, { useState, useEffect } from 'react';
// 假设 ChromeStorage 和 Prompt 类型是从你的 storage 文件中导入的
// 你需要确保路径正确
import ChromeStorage from '../storage/chromeStorage'; 
// 如果在非插件环境测试，确保 mockStorage 被加载
import enableMockChromeStorage from '../storage/mockChromeStorage';
if (process.env.NODE_ENV === 'development' && typeof chrome.runtime === 'undefined') {
  enableMockChromeStorage();
}


function AddPromptForm({ onPromptAdded }: { onPromptAdded: (newPromptId: string) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); // 以逗号分隔的字符串
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [category, setCategory] = useState('内容创作');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空！');
      return;
    }

    try {
      // 准备 Prompt 数据对象
      // 注意：这里的 authorId, authorName, rating, downloads, source, status 等字段
      // 需要根据你的应用逻辑来设定初始值或从用户/系统获取。
      // ChromeStorage.addPrompt 期望的参数不包含id, createdAt, updatedAt, version, isDeleted
      const newPromptData = {
        title: title.trim(),
        content: content.trim(),
        description: description.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        language,
        category,
        // --- 以下字段需要根据你的逻辑设置默认值 ---
        authorId: "local-user-options-page", // 或更复杂的用户系统
        authorName: "用户",
        rating: 0,
        downloads: 0,
        isFavorite: false,
        source: 'local' as 'local' | 'remote',
        status: 'published' as 'draft' | 'published',
        lastUsedAt: null,
        syncedAt: null,
        remoteId: null,
        // -----------------------------------------
      };
      
      const savedPrompt = await ChromeStorage.addPrompt(newPromptData);
      alert('Prompt 添加成功!');
      onPromptAdded(savedPrompt.id); // 将新 Prompt ID 传递回去

      // 清空表单
      setTitle('');
      setContent('');
      setDescription('');
      setTags('');
      // 可选：关闭当前标签页
      // chrome.tabs.getCurrent(tab => {
      //   if (tab && tab.id) chrome.tabs.remove(tab.id);
      // });
    } catch (error) {
      console.error('添加Prompt失败:', error);
      alert('添加Prompt失败，请查看控制台获取更多信息。');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">添加新提示</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">标题</label>
          <input type="text" id="prompt-title" value={title} onChange={e => setTitle(e.target.value)} required 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label htmlFor="prompt-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">内容</label>
          <textarea id="prompt-content" value={content} onChange={e => setContent(e.target.value)} required rows={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"></textarea>
        </div>
        <div>
          <label htmlFor="prompt-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">描述 (可选)</label>
          <input type="text" id="prompt-description" value={description} onChange={e => setDescription(e.target.value)}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label htmlFor="prompt-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">标签 (逗号分隔, 可选)</label>
          <input type="text" id="prompt-tags" value={tags} onChange={e => setTags(e.target.value)}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="prompt-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">语言</label>
                <select id="prompt-language" value={language} onChange={e => setLanguage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                    {/* 添加更多语言选项 */}
                </select>
            </div>
            <div>
                <label htmlFor="prompt-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
                <input type="text" id="prompt-category" value={category} onChange={e => setCategory(e.target.value)}
                        placeholder="例如：内容创作"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
            </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" 
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
            保存 Prompt
          </button>
        </div>
      </form>
    </div>
  );
}


function OptionsApp() {
  const [showAddPromptForm, setShowAddPromptForm] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#add-prompt") {
        setShowAddPromptForm(true);
      } else {
        setShowAddPromptForm(false); // 如果有其他视图，在这里处理
      }
    };

    handleHashChange(); // 初始检查
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handlePromptAdded = (newPromptId: string) => {
    // 通知 background script，Prompt 已成功添加
    chrome.runtime.sendMessage({ action: "promptAddedSuccessfully", newPromptId: newPromptId }, response => {
      if (chrome.runtime.lastError) {
        console.warn("Error sending promptAddedSuccessfully message:", chrome.runtime.lastError.message);
      } else {
        console.log("OptionsApp: Sent promptAddedSuccessfully message, background response:", response);
      }
    });
    
    // 可以在这里决定是否关闭当前标签页，或导航回 options 主视图
    // window.location.hash = ""; // 返回 Options 主视图 (如果 #add-prompt 是唯一特殊hash)
    // setShowAddPromptForm(false); // 或者直接隐藏表单
    
    // 尝试关闭当前标签页
    chrome.tabs.getCurrent(tab => {
      if (tab && tab.id && !tab.pinned) { // 不关闭固定的标签页
          chrome.tabs.remove(tab.id, () => {
              if (chrome.runtime.lastError) {
                  console.warn("Error closing tab:", chrome.runtime.lastError.message, "This might happen if the tab was not opened by the extension or is protected.");
              } else {
                  console.log("Add prompt tab closed.");
              }
          });
      } else {
          // 如果无法获取当前tab或tab是固定的，则导航回 options 主页 (无hash)
          window.location.href = chrome.runtime.getURL("src/options/options.html");
      }
    });
  };

  if (showAddPromptForm) {
    return <AddPromptForm onPromptAdded={handlePromptAdded} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Immersive Prompt 设置</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">在这里管理你的Immersive Prompt扩展程序的常规设置。</p>
      {/* 在这里放置其他 Options 内容 */}
      <div className="mt-6">
        <a href="#add-prompt" 
           onClick={() => setShowAddPromptForm(true)}
           className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            或手动导航到添加提示表单
        </a>
      </div>
    </div>
  );
}

export default OptionsApp;

// ReactDOM.createRoot 应该在 main-options.tsx 中