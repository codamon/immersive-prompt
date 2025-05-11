"use client"

import React, { useState, useEffect } from 'react';
import type { MarketplacePrompt } from '../types/prompt';
import PromptFormView from './PromptFormView';
import { initPromptCreator } from './promptCreator';

// 定义可能的视图状态
type ViewState = 'home' | 'promptForm';

interface MainContainerProps {
  // 可以根据需要添加更多props
}

export default function MainContainer(props: MainContainerProps) {
  // 当前视图状态
  const [currentView, setCurrentView] = useState<ViewState>('home');
  // 当前正在编辑的Prompt
  const [editingPrompt, setEditingPrompt] = useState<MarketplacePrompt | undefined>(undefined);
  // 是否处于编辑模式
  const [isEditing, setIsEditing] = useState(false);

  // 切换视图的函数
  const toggleView = (view: ViewState, promptToEdit?: MarketplacePrompt) => {
    setCurrentView(view);
    
    if (view === 'promptForm' && promptToEdit) {
      setEditingPrompt(promptToEdit);
      setIsEditing(true);
    } else if (view === 'promptForm') {
      // 新建模式
      setEditingPrompt(undefined);
      setIsEditing(false);
    }
  };

  // 返回主页
  const handleBack = () => {
    setCurrentView('home');
    setEditingPrompt(undefined);
    setIsEditing(false);
  };

  // 初始化promptCreator
  useEffect(() => {
    initPromptCreator(toggleView);
  }, []);

  // 根据当前视图渲染不同内容
  const renderContent = () => {
    switch (currentView) {
      case 'promptForm':
        return (
          <PromptFormView
            isEditing={isEditing}
            promptToEdit={editingPrompt}
            onBack={handleBack}
          />
        );
      case 'home':
      default:
        // 这里应该返回主页内容，例如Prompt列表
        return (
          <div className="p-4">
            {/* 主页内容将在这里实现 */}
            <h1>Prompt列表将在这里显示</h1>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px]">
      {renderContent()}
    </div>
  );
} 