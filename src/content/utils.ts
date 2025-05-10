// src/content/utils.ts

export function showToast(message: string) {
    const toastId = 'ai-prompt-toast';
    let toast = document.getElementById(toastId);
    if (toast) toast.remove();
  
    toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-[10001]';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast?.remove();
    }, 3000);
  }