/**
 * Chrome Storage API 本地存储方案
 * 考虑与 Strapi 后端兼容的数据结构
 */

import { v4 as uuidv4 } from 'uuid';

// 提示数据结构
export interface Prompt {
  id: string;               // 唯一标识符
  title: string;            // 标题
  content: string;          // 提示内容
  description: string;      // 描述
  tags: string[];           // 标签数组
  language: string;         // 语言 (zh, en, etc.)
  category: string;         // 分类
  authorId: string;         // 作者ID（本地用户或远程用户）
  authorName: string;       // 作者名称
  rating: number;           // 评分
  downloads: number;        // 下载/使用次数
  isFavorite: boolean;      // 是否收藏
  source: 'local' | 'remote'; // 来源（本地创建或远程同步）
  status: 'draft' | 'published'; // 状态 (对应 Strapi 的状态)
  createdAt: string;        // 创建时间 (ISO 格式)
  updatedAt: string;        // 更新时间 (ISO 格式)
  lastUsedAt: string | null; // 最后使用时间 (ISO 格式)
  syncedAt: string | null;  // 最后同步时间 (ISO 格式)
  version: number;          // 版本号，用于处理冲突
  remoteId: string | null;  // 远程 ID，用于与 Strapi 同步
  isDeleted: boolean;       // 软删除标记
}

// 用户设置
export interface Settings {
  theme: 'light' | 'dark' | 'system'; // 主题
  language: string;                  // 界面语言
  defaultPromptLanguage: string;     // 默认提示语言
  categories: string[];              // 用户自定义分类
  syncEnabled: boolean;              // 是否启用同步
  syncInterval: number;              // 同步间隔（分钟）
  lastSyncAt: string | null;         // 最后同步时间
}

// 用户信息
export interface User {
  id: string;                    // 本地用户ID
  name: string;                  // 用户名
  email: string | null;          // 电子邮件
  avatarUrl: string | null;      // 头像URL
  isLoggedIn: boolean;           // 是否已登录远程账户
  remoteId: string | null;       // 远程账户ID
  authToken: string | null;      // 认证令牌
  tokenExpiry: string | null;    // 令牌过期时间
  role: 'anonymous' | 'user' | 'admin'; // 用户角色
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 收藏夹/文件夹
export interface Folder {
  id: string;                   // 文件夹ID
  name: string;                 // 文件夹名称
  description: string;          // 描述
  promptIds: string[];          // 包含的提示ID
  parentId: string | null;      // 父文件夹ID，null表示根文件夹
  icon: string | null;          // 图标
  color: string | null;         // 颜色
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  isExpanded: boolean;          // 是否展开显示
  position: number;             // 显示位置
}

// 历史记录项
export interface HistoryItem {
  id: string;                   // 历史记录ID
  promptId: string;             // 相关提示ID
  title: string;                // 操作时提示的标题
  content: string;              // 操作时提示的内容
  action: 'used' | 'created' | 'edited' | 'deleted'; // 动作类型
  timestamp: string;            // 时间戳
  metadata: Record<string, any>; // 额外元数据
}

// 同步状态
export interface SyncState {
  lastSyncAt: string | null;     // 最后同步时间
  inProgress: boolean;           // 是否正在同步
  error: string | null;          // 同步错误
  pendingChanges: number;        // 待同步的变更数量
  version: number;               // 数据版本
}

// 完整存储结构
export interface StorageData {
  prompts: { [id: string]: Prompt };    // 提示集合，使用ID作为键
  folders: { [id: string]: Folder };    // 文件夹集合
  settings: Settings;                   // 用户设置
  user: User;                           // 用户信息
  history: HistoryItem[];               // 历史记录
  sync: SyncState;                      // 同步状态
  version: number;                      // 存储版本，用于迁移
}

// 初始数据
const initialData: StorageData = {
  prompts: {},
  folders: {
    'root': {
      id: 'root',
      name: '全部提示',
      description: '所有提示',
      promptIds: [],
      parentId: null,
      icon: null,
      color: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isExpanded: true,
      position: 0
    },
    'favorites': {
      id: 'favorites',
      name: '收藏',
      description: '收藏的提示',
      promptIds: [],
      parentId: null,
      icon: 'heart',
      color: '#ff4757',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isExpanded: true,
      position: 1
    }
  },
  settings: {
    theme: 'system',
    language: 'zh',
    defaultPromptLanguage: 'zh',
    categories: ['内容创作', '开发', '效率', '教育', '商业', '创意'],
    syncEnabled: false,
    syncInterval: 60,
    lastSyncAt: null
  },
  user: {
    id: uuidv4(),
    name: '本地用户',
    email: null,
    avatarUrl: null,
    isLoggedIn: false,
    remoteId: null,
    authToken: null,
    tokenExpiry: null,
    role: 'anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  history: [],
  sync: {
    lastSyncAt: null,
    inProgress: false,
    error: null,
    pendingChanges: 0,
    version: 1
  },
  version: 1
};

// 存储操作类
export class ChromeStorage {
  /**
   * 获取完整存储数据
   */
  static async getAll(): Promise<StorageData> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        // 如果是空存储，返回初始数据
        if (Object.keys(result).length === 0) {
          resolve(initialData);
          return;
        }
        
        // 确保返回的数据包含所有必要的字段
        const data: StorageData = {
          prompts: result.prompts || {},
          folders: result.folders || initialData.folders,
          settings: result.settings || initialData.settings,
          user: result.user || initialData.user,
          history: result.history || [],
          sync: result.sync || initialData.sync,
          version: result.version || 1
        };
        
        resolve(data);
      });
    });
  }
  
  /**
   * 保存完整存储数据
   */
  static async setAll(data: StorageData): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  }
  
  /**
   * 获取所有提示
   */
  static async getPrompts(): Promise<Prompt[]> {
    const data = await this.getAll();
    return Object.values(data.prompts).filter(p => !p.isDeleted);
  }
  
  /**
   * 获取指定ID的提示
   */
  static async getPrompt(id: string): Promise<Prompt | null> {
    const data = await this.getAll();
    const prompt = data.prompts[id];
    return prompt && !prompt.isDeleted ? prompt : null;
  }
  
  /**
   * 添加新提示
   */
  static async addPrompt(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'isDeleted'>): Promise<Prompt> {
    const data = await this.getAll();
    
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const newPrompt: Prompt = {
      ...promptData,
      id,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDeleted: false
    };
    
    data.prompts[id] = newPrompt;
    
    // 添加到根文件夹
    const rootFolder = data.folders['root'];
    rootFolder.promptIds.push(id);
    rootFolder.updatedAt = now;
    data.folders['root'] = rootFolder;
    
    // 如果标记为收藏，添加到收藏夹
    if (newPrompt.isFavorite) {
      const favFolder = data.folders['favorites'];
      favFolder.promptIds.push(id);
      favFolder.updatedAt = now;
      data.folders['favorites'] = favFolder;
    }
    
    // 添加历史记录
    data.history.unshift({
      id: uuidv4(),
      promptId: id,
      title: newPrompt.title,
      content: newPrompt.content,
      action: 'created',
      timestamp: now,
      metadata: {}
    });
    
    // 只保留最近的100条历史记录
    if (data.history.length > 100) {
      data.history = data.history.slice(0, 100);
    }
    
    // 更新同步状态
    data.sync.pendingChanges += 1;
    
    await this.setAll(data);
    return newPrompt;
  }
  
  /**
   * 更新提示
   */
  static async updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt | null> {
    const data = await this.getAll();
    
    if (!data.prompts[id] || data.prompts[id].isDeleted) {
      return null;
    }
    
    const now = new Date().toISOString();
    const oldPrompt = data.prompts[id];
    
    const updatedPrompt: Prompt = {
      ...oldPrompt,
      ...updates,
      updatedAt: now,
      version: oldPrompt.version + 1
    };
    
    data.prompts[id] = updatedPrompt;
    
    // 处理收藏夹变化
    if (oldPrompt.isFavorite !== updatedPrompt.isFavorite) {
      const favFolder = data.folders['favorites'];
      
      if (updatedPrompt.isFavorite) {
        // 添加到收藏夹
        if (!favFolder.promptIds.includes(id)) {
          favFolder.promptIds.push(id);
          favFolder.updatedAt = now;
        }
      } else {
        // 从收藏夹移除
        favFolder.promptIds = favFolder.promptIds.filter(pid => pid !== id);
        favFolder.updatedAt = now;
      }
      
      data.folders['favorites'] = favFolder;
    }
    
    // 添加历史记录
    data.history.unshift({
      id: uuidv4(),
      promptId: id,
      title: updatedPrompt.title,
      content: updatedPrompt.content,
      action: 'edited',
      timestamp: now,
      metadata: {}
    });
    
    // 更新同步状态
    data.sync.pendingChanges += 1;
    
    await this.setAll(data);
    return updatedPrompt;
  }
  
  /**
   * 删除提示（软删除）
   */
  static async deletePrompt(id: string): Promise<boolean> {
    const data = await this.getAll();
    
    if (!data.prompts[id] || data.prompts[id].isDeleted) {
      return false;
    }
    
    const now = new Date().toISOString();
    const prompt = data.prompts[id];
    
    // 软删除
    prompt.isDeleted = true;
    prompt.updatedAt = now;
    prompt.version += 1;
    data.prompts[id] = prompt;
    
    // 从所有文件夹中移除
    Object.values(data.folders).forEach(folder => {
      if (folder.promptIds.includes(id)) {
        folder.promptIds = folder.promptIds.filter(pid => pid !== id);
        folder.updatedAt = now;
        data.folders[folder.id] = folder;
      }
    });
    
    // 添加历史记录
    data.history.unshift({
      id: uuidv4(),
      promptId: id,
      title: prompt.title,
      content: prompt.content,
      action: 'deleted',
      timestamp: now,
      metadata: {}
    });
    
    // 更新同步状态
    data.sync.pendingChanges += 1;
    
    await this.setAll(data);
    return true;
  }
  
  /**
   * 记录提示使用
   */
  static async usePrompt(id: string): Promise<Prompt | null> {
    const data = await this.getAll();
    
    if (!data.prompts[id] || data.prompts[id].isDeleted) {
      return null;
    }
    
    const now = new Date().toISOString();
    const prompt = data.prompts[id];
    
    // 更新使用统计
    prompt.downloads += 1;
    prompt.lastUsedAt = now;
    prompt.updatedAt = now;
    data.prompts[id] = prompt;
    
    // 添加历史记录
    data.history.unshift({
      id: uuidv4(),
      promptId: id,
      title: prompt.title,
      content: prompt.content,
      action: 'used',
      timestamp: now,
      metadata: {}
    });
    
    await this.setAll(data);
    return prompt;
  }
  
  /**
   * 获取用户设置
   */
  static async getSettings(): Promise<Settings> {
    const data = await this.getAll();
    return data.settings;
  }
  
  /**
   * 更新用户设置
   */
  static async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const data = await this.getAll();
    
    const updatedSettings: Settings = {
      ...data.settings,
      ...updates
    };
    
    data.settings = updatedSettings;
    await this.setAll(data);
    
    return updatedSettings;
  }
  
  /**
   * 获取所有文件夹
   */
  static async getFolders(): Promise<Folder[]> {
    const data = await this.getAll();
    return Object.values(data.folders);
  }
  
  /**
   * 获取文件夹内容
   */
  static async getFolderPrompts(folderId: string): Promise<Prompt[]> {
    const data = await this.getAll();
    
    const folder = data.folders[folderId];
    if (!folder) {
      return [];
    }
    
    return folder.promptIds
      .map(id => data.prompts[id])
      .filter(p => p && !p.isDeleted);
  }
  
  /**
   * 添加文件夹
   */
  static async addFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
    const data = await this.getAll();
    
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const newFolder: Folder = {
      ...folderData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    data.folders[id] = newFolder;
    await this.setAll(data);
    
    return newFolder;
  }
  
  /**
   * 更新文件夹
   */
  static async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const data = await this.getAll();
    
    if (!data.folders[id]) {
      return null;
    }
    
    // 防止更新特殊文件夹
    if ((id === 'root' || id === 'favorites') && (updates.name || updates.parentId)) {
      throw new Error('无法修改系统文件夹的名称或位置');
    }
    
    const now = new Date().toISOString();
    const oldFolder = data.folders[id];
    
    const updatedFolder: Folder = {
      ...oldFolder,
      ...updates,
      updatedAt: now
    };
    
    data.folders[id] = updatedFolder;
    await this.setAll(data);
    
    return updatedFolder;
  }
  
  /**
   * 删除文件夹
   */
  static async deleteFolder(id: string): Promise<boolean> {
    const data = await this.getAll();
    
    if (!data.folders[id]) {
      return false;
    }
    
    // 防止删除特殊文件夹
    if (id === 'root' || id === 'favorites') {
      throw new Error('无法删除系统文件夹');
    }
    
    // 将提示移到根文件夹
    const folder = data.folders[id];
    if (folder.promptIds.length > 0) {
      const rootFolder = data.folders['root'];
      folder.promptIds.forEach(promptId => {
        if (!rootFolder.promptIds.includes(promptId)) {
          rootFolder.promptIds.push(promptId);
        }
      });
      rootFolder.updatedAt = new Date().toISOString();
      data.folders['root'] = rootFolder;
    }
    
    // 删除文件夹
    delete data.folders[id];
    await this.setAll(data);
    
    return true;
  }
  
  /**
   * 清除所有数据（重置）
   */
  static async clearAll(): Promise<void> {
    await this.setAll(initialData);
  }
  
  /**
   * 获取历史记录
   */
  static async getHistory(limit: number = 20): Promise<HistoryItem[]> {
    const data = await this.getAll();
    return data.history.slice(0, limit);
  }
  
  /**
   * 搜索提示
   */
  static async searchPrompts(query: string): Promise<Prompt[]> {
    const data = await this.getAll();
    const queryLower = query.toLowerCase();
    
    return Object.values(data.prompts)
      .filter(prompt => {
        if (prompt.isDeleted) return false;
        
        return (
          prompt.title.toLowerCase().includes(queryLower) ||
          prompt.content.toLowerCase().includes(queryLower) ||
          prompt.description.toLowerCase().includes(queryLower) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(queryLower))
        );
      });
  }
  
  /**
   * 导出数据
   */
  static async exportData(): Promise<string> {
    const data = await this.getAll();
    return JSON.stringify(data);
  }
  
  /**
   * 导入数据
   */
  static async importData(jsonData: string): Promise<boolean> {
    try {
      const parsedData = JSON.parse(jsonData) as StorageData;
      
      // 验证基本结构
      if (!parsedData.prompts || !parsedData.folders || !parsedData.settings) {
        throw new Error('数据格式无效');
      }
      
      // 确保有根文件夹和收藏夹
      if (!parsedData.folders['root'] || !parsedData.folders['favorites']) {
        parsedData.folders = {
          ...parsedData.folders,
          ...initialData.folders
        };
      }
      
      await this.setAll(parsedData);
      return true;
    } catch (error) {
      console.error('导入数据失败', error);
      return false;
    }
  }
}

export default ChromeStorage; 