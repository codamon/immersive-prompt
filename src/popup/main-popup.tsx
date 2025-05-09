import React from 'react';
import ReactDOM from 'react-dom/client';
import PopupApp from './PopupApp';
// import '../../src/assets/global.css'; // If you have global styles for popup

ReactDOM.createRoot(document.getElementById('root-popup')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);
