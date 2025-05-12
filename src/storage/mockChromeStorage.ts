// @ts-nocheck
/**
 * Chrome Storage API 的 Mock 实现
 * 用于在非 Chrome 环境（如开发/测试环境）中模拟 Chrome Storage API
 */

// 类型引用，但不进行实际导入
type ChromeLocalStorageArea = chrome.storage.LocalStorageArea;

// 为 window 添加 chrome 对象类型
declare global {
  interface Window {
    chrome?: any; // 使用any类型简化声明
  }
}

// 确保全局对象中有 chrome.storage.local
if (typeof window !== 'undefined') {
  // 初始化存储数据
  let mockStorageData: Record<string, any> = {};
  
  // 如果不存在chrome对象，创建一个mock版本
  if (!window.chrome) {
    window.chrome = {} as any;
  }
  
  if (!window.chrome.storage) {
    window.chrome.storage = {} as any;
  }
  
  if (!window.chrome.storage.local) {
    const mockLocal = {
      // 模拟配额常量
      QUOTA_BYTES: 10485760, // 10 MB
      
      get(keysOrCallback: any, optCallback?: any): any {
        console.log('[Mock Chrome Storage] get called with:', keysOrCallback);
        
        // 如果第一个参数是回调函数
        if (typeof keysOrCallback === 'function') {
          const callback = keysOrCallback;
          callback({ ...mockStorageData });
          return;
        }
        
        const keys = keysOrCallback;
        const callback = optCallback;
        
        // 如果keys是null，返回所有数据
        if (keys === null) {
          if (callback) {
            callback({ ...mockStorageData });
          } else {
            return Promise.resolve({ ...mockStorageData });
          }
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
        
        if (callback) {
          callback(result);
        } else {
          return Promise.resolve(result);
        }
      },
      
      set(items: { [key: string]: any }, callback?: () => void): any {
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
          return;
        } else {
          return Promise.resolve();
        }
      },
      
      // 添加其他必要的方法
      remove(keys: string | string[], callback?: () => void): any {
        if (typeof keys === 'string') {
          delete mockStorageData[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach(key => delete mockStorageData[key]);
        }
        
        try {
          localStorage.setItem('mockChromeStorage', JSON.stringify(mockStorageData));
        } catch (error) {
          console.warn('[Mock Chrome Storage] Failed to persist to localStorage after remove:', error);
        }
        
        if (callback) {
          callback();
        } else {
          return Promise.resolve();
        }
      },
      
      clear(callback?: () => void): any {
        mockStorageData = {};
        try {
          localStorage.removeItem('mockChromeStorage');
        } catch (error) {
          console.warn('[Mock Chrome Storage] Failed to clear localStorage:', error);
        }
        
        if (callback) {
          callback();
        } else {
          return Promise.resolve();
        }
      },
      
      getBytesInUse(keysOrCallback: any, callback?: (bytesInUse: number) => void): any {
        // 简单实现：每个键占用的空间等同于其JSON字符串长度
        let bytesInUse = 0;
        
        // 如果第一个参数是回调函数
        if (typeof keysOrCallback === 'function') {
          const callback = keysOrCallback;
          bytesInUse = JSON.stringify(mockStorageData).length;
          callback(bytesInUse);
          return;
        }
        
        const keys = keysOrCallback;
        
        if (keys === null) {
          bytesInUse = JSON.stringify(mockStorageData).length;
        } else {
          const keysToCheck = typeof keys === 'string' ? [keys] : keys;
          const subset: Record<string, any> = {};
          keysToCheck.forEach(key => {
            if (mockStorageData.hasOwnProperty(key)) {
              subset[key] = mockStorageData[key];
            }
          });
          bytesInUse = JSON.stringify(subset).length;
        }
        
        if (callback) {
          callback(bytesInUse);
        } else {
          return Promise.resolve(bytesInUse);
        }
      }
    };
    
    // 使用类型断言绕过类型检查
    window.chrome.storage.local = mockLocal as unknown as ChromeLocalStorageArea;
    
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

/**
 * 启用模拟Chrome Storage API
 */
export default function enableMockChromeStorage(): void {
  console.log('[Mock Chrome Storage] Mock Chrome Storage is now enabled');
  // 这个函数仅用于导入模块，确保mock实现被加载
}

/**
 * 清除模拟存储中的数据
 */
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