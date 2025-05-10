/**
 * Chrome Storage API 的 Mock 实现
 * 用于在非 Chrome 环境（如开发/测试环境）中模拟 Chrome Storage API
 */

// 确保全局对象中有 chrome.storage.local
if (typeof window !== 'undefined') {
  // 为 window 添加 chrome 对象类型
  declare global {
    interface Window {
      chrome?: {
        storage?: {
          local?: {
            get: (keys: any, callback: (items: any) => void) => void;
            set: (items: any, callback?: () => void) => void;
          };
        };
      };
    }
  }
  
  // 初始化存储数据
  let mockStorageData: Record<string, any> = {};
  
  // 如果不存在chrome对象，创建一个mock版本
  if (!window.chrome) {
    window.chrome = {};
  }
  
  if (!window.chrome.storage) {
    window.chrome.storage = {};
  }
  
  if (!window.chrome.storage.local) {
    window.chrome.storage.local = {
      get: (keys: any, callback: (items: any) => void) => {
        console.log('[Mock Chrome Storage] get called with keys:', keys);
        
        // 如果keys是null，返回所有数据
        if (keys === null) {
          callback({ ...mockStorageData });
          return;
        }
        
        // 如果keys是字符串，将其转换为数组
        const keyList = typeof keys === 'string' ? [keys] : (Array.isArray(keys) ? keys : Object.keys(keys));
        
        // 构建返回对象
        const result: Record<string, any> = {};
        keyList.forEach(key => {
          if (mockStorageData.hasOwnProperty(key)) {
            result[key] = mockStorageData[key];
          } else if (typeof keys === 'object' && !Array.isArray(keys) && keys.hasOwnProperty(key)) {
            // 如果key不存在但在传入的对象中有默认值
            result[key] = keys[key];
          }
        });
        
        console.log('[Mock Chrome Storage] Returning data:', result);
        callback(result);
      },
      
      set: (items: any, callback?: () => void) => {
        console.log('[Mock Chrome Storage] set called with items:', items);
        
        // 更新存储数据
        mockStorageData = { ...mockStorageData, ...items };
        
        // 将数据保存到localStorage以便持久化
        try {
          localStorage.setItem('mockChromeStorage', JSON.stringify(mockStorageData));
        } catch (error) {
          console.warn('[Mock Chrome Storage] Failed to persist to localStorage:', error);
        }
        
        if (callback) {
          callback();
        }
      }
    };
    
    // 尝试从localStorage恢复之前的数据
    try {
      const savedData = localStorage.getItem('mockChromeStorage');
      if (savedData) {
        mockStorageData = JSON.parse(savedData);
        console.log('[Mock Chrome Storage] Restored data from localStorage:', mockStorageData);
      }
    } catch (error) {
      console.warn('[Mock Chrome Storage] Failed to restore from localStorage:', error);
    }
    
    console.log('[Mock Chrome Storage] Initialized Mock Chrome Storage API');
  }
}

export default function enableMockChromeStorage(): void {
  console.log('[Mock Chrome Storage] Mock Chrome Storage is now enabled');
  // 这个函数仅用于导入模块，确保mock实现被加载
}

// 添加一个清理函数，用于测试场景
export function clearMockChromeStorage(): void {
  if (typeof window !== 'undefined' && window.chrome?.storage?.local) {
    window.chrome.storage.local.set({}, () => {
      console.log('[Mock Chrome Storage] Storage cleared');
    });
    
    try {
      localStorage.removeItem('mockChromeStorage');
    } catch (error) {
      console.warn('[Mock Chrome Storage] Failed to clear localStorage:', error);
    }
  }
} 