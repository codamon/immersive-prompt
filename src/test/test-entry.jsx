import { useState, useEffect } from 'react';

function StorageTest() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // 确保页面已加载
    setIsLoaded(true);
  }, []);
  
  const openTestPage = () => {
    // 打开测试页面
    window.open('/src/test/storage-test.html', '_blank');
  };
  
  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'PingFang SC, Helvetica Neue, Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1a237e' }}>存储测试工具</h1>
      <p>点击下面的按钮打开存储测试页面：</p>
      <button 
        onClick={openTestPage}
        style={{
          background: '#3f51b5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        打开存储测试页面
      </button>
      
      {isLoaded && (
        <div style={{ marginTop: '20px' }}>
          <h2>或者直接访问:</h2>
          <a 
            href="/src/test/storage-test.html"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#3f51b5' }}
          >
            存储测试页面链接
          </a>
        </div>
      )}
    </div>
  );
}

export default StorageTest; 