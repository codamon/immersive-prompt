/**
 * Chrome Storage API 的 Mock 实现
 * 用于在非 Chrome 环境（如开发/测试环境）中模拟 Chrome Storage API
 */

// 初始化存储数据
let mockStorageData: Record<string, any> = {};

// 如果不存在chrome对象，创建一个mock版本
if (typeof window !== 'undefined') {
  if (!window.chrome) {
    // @ts-ignore
    window.chrome = {};
  }

  // @ts-ignore
  if (!window.chrome.storage) {
    // @ts-ignore
    window.chrome.storage = {};
  }

  // @ts-ignore
  if (!window.chrome.storage.local) {
    // @ts-ignore
    window.chrome.storage.local = {
      get: (...args: any[]): Promise<Record<string, any>> => { // ALWAYS returns a Promise
        console.log('[Mock Chrome Storage] get called with args:', args);
        let keys: string | string[] | Record<string, any> | null | undefined = null;
        let callback: ((items: Record<string, any>) => void) | undefined = undefined;

        if (args.length === 1) {
          if (typeof args[0] === 'function') {
            callback = args[0];
            keys = null; 
          } else {
            keys = args[0];
          }
        } else if (args.length >= 2) {
          keys = args[0];
          callback = args[1];
        }

        return new Promise<Record<string, any>>((resolve, reject) => { // reject isn't used in this simple get mock but good practice
          try {
            let result: Record<string, any> = {};
            if (keys === null || keys === undefined) {
              result = { ...mockStorageData };
            } else {
              const keyList = typeof keys === 'string' ? [keys] : (Array.isArray(keys) ? keys : Object.keys(keys));
              keyList.forEach(key => {
                if (mockStorageData.hasOwnProperty(key)) {
                  result[key] = mockStorageData[key];
                } else if (typeof keys === 'object' && !Array.isArray(keys) && keys !== null && keys.hasOwnProperty(key)) {
                  result[key] = (keys as Record<string, any>)[key];
                }
              });
            }
            
            console.log('[Mock Chrome Storage] Returning data:', result);
            if (callback) {
              callback(result); // Call the callback with the result
            }
            resolve(result); // Always resolve the promise
          } catch (error) {
            console.error('[Mock Chrome Storage] Error in get:', error);
            if (callback) {
              // How chrome.storage.local.get handles errors with callbacks is tricky,
              // often it sets chrome.runtime.lastError. For a mock, just logging might be enough.
              // Or, if the callback could accept an error: callback(undefined, error);
            }
            reject(error); // Reject the promise on error
          }
        });
      },

      set: (items: Record<string, any>, callback?: () => void): Promise<void> => { // ALWAYS returns a Promise
        console.log('[Mock Chrome Storage] set called with items:', items, 'callback:', callback);

        return new Promise<void>((resolve, reject) => {
          try {
            mockStorageData = { ...mockStorageData, ...items };
            localStorage.setItem('mockChromeStorage', JSON.stringify(mockStorageData));
            
            if (callback) {
              callback(); // Call the callback
            }
            resolve(); // Always resolve the promise on success
          } catch (error) {
            console.warn('[Mock Chrome Storage] Failed to persist to localStorage:', error);
            if (callback) {
              // Similar to 'get', chrome.runtime.lastError might be set.
              // Or if callback accepted error: callback(error);
            }
            reject(error); // Reject the promise on error
          }
        });
      }
    };

    // Load initial data from localStorage
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
}

export function clearMockChromeStorage(): void {
  if (typeof window !== 'undefined' && window.chrome?.storage?.local) {
    // 'set' now always returns a Promise
    (window.chrome.storage.local.set({}) as Promise<void>)
      .then(() => {
        console.log('[Mock Chrome Storage] Storage cleared');
      })
      .catch(error => {
        console.warn('[Mock Chrome Storage] Error clearing storage via mock set:', error);
      });
    
    try {
      localStorage.removeItem('mockChromeStorage');
    } catch (error) {
      console.warn('[Mock Chrome Storage] Failed to clear localStorage:', error);
    }
  }
}