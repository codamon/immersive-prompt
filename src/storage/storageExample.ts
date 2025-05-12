/**
 * ChromeStorage API 使用示例
 * 本文件展示了如何使用 ChromeStorage 类进行常见操作
 */

import ChromeStorage from './chromeStorage';

/**
 * 示例1: 添加新提示
 */
async function addNewPrompt(): Promise<void> {
  try {
    const newPrompt = await ChromeStorage.addPrompt({
      title: "GPT-4 高级写作提示",
      content: "请帮我写一篇关于{{topic}}的文章，包含以下要点：{{points}}。风格要{{style}}，字数在{{length}}字左右。",
      description: "用于生成高质量自定义文章的模板",
      tags: ["写作", "文章", "内容创作"],
      language: "zh",
      category: "内容创作",
      authorId: "local-user",
      authorName: "本地用户",
      rating: 0,
      downloads: 0,
      isFavorite: false,
      source: "local",
      status: "published",
      lastUsedAt: null,
      syncedAt: null,
      remoteId: null
    });
    
    console.log('成功创建新提示:', newPrompt);
  } catch (error) {
    console.error('创建提示失败:', error);
  }
}

/**
 * 示例2: 获取所有提示
 */
async function getAllPrompts(): Promise<void> {
  try {
    const prompts = await ChromeStorage.getPrompts();
    console.log(`获取到 ${prompts.length} 个提示:`);
    prompts.forEach(prompt => {
      console.log(`- ${prompt.title} (${prompt.language}): ${prompt.description.substring(0, 30)}...`);
    });
  } catch (error) {
    console.error('获取提示失败:', error);
  }
}

/**
 * 示例3: 创建文件夹并添加提示
 */
async function createFolderAndAddPrompt(): Promise<void> {
  try {
    // 创建文件夹
    const newFolder = await ChromeStorage.addFolder({
      name: "写作提示集",
      description: "用于各种写作场景的提示",
      promptIds: [],
      parentId: null,
      icon: "edit",
      color: "#4834d4",
      isExpanded: true,
      position: 2
    });
    
    console.log('成功创建文件夹:', newFolder);
    
    // 获取所有提示
    const prompts = await ChromeStorage.getPrompts();
    if (prompts.length === 0) {
      console.log('没有可用的提示，先创建一个提示');
      await addNewPrompt();
      return;
    }
    
    // 获取第一个提示
    const firstPrompt = prompts[0];
    
    // 更新文件夹，添加提示到文件夹中
    const updatedFolder = await ChromeStorage.updateFolder(newFolder.id, {
      promptIds: [firstPrompt.id]
    });
    
    console.log('成功将提示添加到文件夹:', updatedFolder);
  } catch (error) {
    console.error('创建文件夹或添加提示失败:', error);
  }
}

/**
 * 示例4: 搜索提示
 */
async function searchPrompts(query: string): Promise<void> {
  try {
    const results = await ChromeStorage.searchPrompts(query);
    console.log(`搜索 "${query}" 找到 ${results.length} 个结果:`);
    results.forEach(prompt => {
      console.log(`- ${prompt.title} (${prompt.category})`);
    });
  } catch (error) {
    console.error('搜索提示失败:', error);
  }
}

/**
 * 示例5: 使用提示并更新状态
 */
async function usePromptExample(): Promise<void> {
  try {
    const prompts = await ChromeStorage.getPrompts();
    if (prompts.length === 0) {
      console.log('没有可用的提示，先创建一个提示');
      await addNewPrompt();
      return;
    }
    
    const targetPrompt = prompts[0];
    console.log(`使用提示前的下载次数: ${targetPrompt.downloads}`);
    
    const updatedPrompt = await ChromeStorage.usePrompt(targetPrompt.id);
    if (updatedPrompt) {
      console.log(`使用提示后的下载次数: ${updatedPrompt.downloads}`);
      console.log(`最后使用时间: ${updatedPrompt.lastUsedAt}`);
    }
    
    // 获取历史记录
    const history = await ChromeStorage.getHistory(5);
    console.log('最近的历史记录:');
    history.forEach(item => {
      console.log(`- ${new Date(item.timestamp).toLocaleString()}: ${item.action} "${item.title}"`);
    });
  } catch (error) {
    console.error('使用提示失败:', error);
  }
}

/**
 * 示例6: 导出和导入数据
 */
async function exportAndImportData(): Promise<void> {
  try {
    // 导出数据
    const exportedData = await ChromeStorage.exportData();
    console.log('导出的数据大小:', exportedData.length, '字节');
    
    // 清除所有数据
    await ChromeStorage.clearAll();
    console.log('已清除所有数据');
    
    // 验证数据已清除
    const promptsAfterClear = await ChromeStorage.getPrompts();
    console.log('清除后的提示数量:', promptsAfterClear.length);
    
    // 导入之前导出的数据
    const importSuccess = await ChromeStorage.importData(exportedData);
    console.log('导入数据结果:', importSuccess ? '成功' : '失败');
    
    // 验证数据已恢复
    const promptsAfterImport = await ChromeStorage.getPrompts();
    console.log('导入后的提示数量:', promptsAfterImport.length);
  } catch (error) {
    console.error('导出或导入数据失败:', error);
  }
}

/**
 * 示例7: 更新用户设置
 */
async function updateUserSettings(): Promise<void> {
  try {
    // 获取当前设置
    const currentSettings = await ChromeStorage.getSettings();
    console.log('当前设置:', currentSettings);
    
    // 更新设置
    const updatedSettings = await ChromeStorage.updateSettings({
      theme: currentSettings.theme === 'light' ? 'dark' : 'light',
      defaultPromptLanguage: 'en'
    });
    
    console.log('更新后的设置:', updatedSettings);
  } catch (error) {
    console.error('更新设置失败:', error);
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples(): Promise<void> {
  console.log('=== 运行 ChromeStorage API 示例 ===');
  
  console.log('\n示例1: 添加新提示');
  await addNewPrompt();
  
  console.log('\n示例2: 获取所有提示');
  await getAllPrompts();
  
  console.log('\n示例3: 创建文件夹并添加提示');
  await createFolderAndAddPrompt();
  
  console.log('\n示例4: 搜索提示');
  await searchPrompts('写作');
  
  console.log('\n示例5: 使用提示并更新状态');
  await usePromptExample();
  
  console.log('\n示例6: 导出和导入数据');
  await exportAndImportData();
  
  console.log('\n示例7: 更新用户设置');
  await updateUserSettings();
  
  console.log('\n=== 所有示例运行完成 ===');
}

// 如果想在浏览器控制台中测试，可以将此对象附加到全局 window 对象
export const StorageExamples = {
  addNewPrompt,
  getAllPrompts,
  createFolderAndAddPrompt,
  searchPrompts,
  usePromptExample,
  exportAndImportData,
  updateUserSettings,
  runAllExamples
};

export default StorageExamples; 