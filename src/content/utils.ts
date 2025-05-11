// src/content/utils.ts

/**
 * 在界面上显示一个临时消息通知
 * @param message 要显示的消息内容
 * @param duration 通知显示的持续时间（毫秒）
 */
export function showToast(message: string, duration: number = 3000): void {
  // 检查是否已存在toast容器
  let toastContainer = document.getElementById('immersive-toast-container');
  
  if (!toastContainer) {
    // 创建toast容器
    toastContainer = document.createElement('div');
    toastContainer.id = 'immersive-toast-container';
    
    // 设置样式
    Object.assign(toastContainer.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '10000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      pointerEvents: 'none',
    });
    
    document.body.appendChild(toastContainer);
  }
  
  // 创建单个toast元素
  const toast = document.createElement('div');
  
  // 设置样式
  Object.assign(toast.style, {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '4px',
    maxWidth: '300px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    opacity: '0',
    transition: 'opacity 0.3s ease-in-out',
    fontSize: '14px',
    textAlign: 'center',
  });
  
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  // 显示toast
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // 设置定时器，在指定时间后隐藏并移除toast
  setTimeout(() => {
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
      
      // 如果没有更多toast，移除容器
      if (toastContainer.childNodes.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, duration);
}