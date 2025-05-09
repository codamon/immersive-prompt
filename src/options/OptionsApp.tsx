// src/options/OptionsApp.tsx
// import { useState } from 'react' // 如果有用到
// import reactLogo from './assets/react.svg' // <--- 删除这一行
// import viteLogo from '/vite.svg' // <--- 如果有这一行也删除，因为 vite.svg 也被移除了
// import './App.css' // <--- 如果有这一行，并且 App.css 已删除或移动，也需要处理

import React from 'react';
import ReactDOM from 'react-dom/client';

function OptionsApp() {
  // const [count, setCount] = useState(0) // 如果有用到

  return (
    <>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" /> // <--- 删除这部分
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" /> // <--- 删除这部分
        </a>
      </div> */}
      <h1>Immersive Prompt Options</h1> {/* 这是您 Options 页面的主要内容 */}
      {/* <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
      {/* Options 页面的 UI 会在这里 */}
    </>
  )
}

export default OptionsApp

ReactDOM.createRoot(document.getElementById('root-options')!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>,
);