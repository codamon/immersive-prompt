import { StrictMode } from 'react'; // 确保导入 React
import { createRoot } from 'react-dom/client';
import '../../src/assets/global.css'; // 调整路径以匹配你的项目结构
import '../../src/styles/tailwind.css'; // 调整路径
import OptionsApp from './OptionsApp';   // OptionsApp 现在是默认导出

const rootElement = document.getElementById('root-options'); // 确保 ID 是 root-options
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <OptionsApp />
    </StrictMode>,
  );
} else {
  console.error("找不到ID为 'root-options' 的根元素。");
}