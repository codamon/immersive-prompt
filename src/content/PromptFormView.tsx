"use client"

import type React from "react"
import type { MarketplacePrompt } from '../types/prompt';

import { useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { showToast } from './utils';

interface PromptFormViewProps {
  isEditing?: boolean;
  promptToEdit?: MarketplacePrompt;
  onBack: () => void;
}

export default function PromptFormView({ isEditing = false, promptToEdit, onBack }: PromptFormViewProps) {
  // 初始化状态，编辑模式下填充现有数据
  const [title, setTitle] = useState(promptToEdit?.title || "");
  const [content, setContent] = useState(promptToEdit?.content || "");
  const [description, setDescription] = useState(promptToEdit?.description || "");
  const [category, setCategory] = useState(promptToEdit?.category || "");
  const [language, setLanguage] = useState(promptToEdit?.language || "en");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(promptToEdit?.tags || []);
  const [promptId] = useState(promptToEdit?.id || "");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  const handleSave = async () => {
    if (!title || !content) {
      showToast("Title and content cannot be empty");
      return;
    }

    try {
      // 构建Prompt对象
      const promptData: Partial<MarketplacePrompt> = {
        title,
        content,
        description,
        category,
        language,
        tags,
      };
      
      if (isEditing && promptId) {
        promptData.id = promptId;
      }

      // 保存到存储
      const savedPrompt = await savePromptToStorage(promptData);
      
      // 显示成功消息
      console.log(`${isEditing ? 'Updated' : 'Created new'} prompt successfully:`, savedPrompt);
      
      // 处理保存后的回调
      if (savedPrompt.id) {
        handlePromptSaved(savedPrompt.id);
      }
      
      // 返回主视图
      onBack();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      showToast("Save failed, please try again");
    }
  }

  // 保存Prompt到存储
  const savePromptToStorage = async (promptData: Partial<MarketplacePrompt>): Promise<MarketplacePrompt> => {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ 
          action: isEditing ? "updatePrompt" : "addPrompt", 
          promptData 
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response && response.success) {
            resolve(response.prompt);
          } else {
            reject(new Error("Error occurred while saving prompt"));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  // 处理Prompt保存后的操作
  const handlePromptSaved = (savedPromptId: string) => {
    console.log(`Prompt with ID: ${savedPromptId} saved successfully!`);
    
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: "promptAddedSuccessfully", newPromptId: savedPromptId }, response => {
        if (chrome.runtime.lastError) {
          console.warn("ImmersivePrompt: Error sending promptAddedSuccessfully message:", chrome.runtime.lastError.message);
          // Fallback if message sending fails
          refreshPromptList(savedPromptId);
        } else if (response) {
          console.log("ImmersivePrompt: Background response to promptAddedSuccessfully:", response);
        }
      });
    } else { 
      console.warn("ImmersivePrompt: chrome.runtime.sendMessage not available, refreshing locally.");
      refreshPromptList(savedPromptId);
    }
  };

  // 刷新Prompt列表
  const refreshPromptList = (promptId?: string) => {
    // 获取当前活动标签
    const activeTabElement = document.querySelector('.tab-button.font-semibold');
    let currentTab = 'popular';
    
    if (activeTabElement && activeTabElement.id) {
      currentTab = activeTabElement.id.replace('tab-', '');
    }
    
    // 触发列表刷新
    const event = new CustomEvent('refresh-prompts', { 
      detail: { 
        tab: currentTab,
        promptId: promptId
      } 
    });
    document.dispatchEvent(event);
    
    // 显示提示信息
    showToast(`Prompt with ID: ${promptId} was processed successfully! List refreshed.`);
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-background text-foreground">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{isEditing ? 'Edit' : 'Create New'} Prompt</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Enter prompt title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Prompt Content</Label>
          <Textarea
            id="content"
            placeholder="Enter your prompt content. Use {{variable}} for template variables."
            className="min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Use {"{{"} variable_name {"}}"} syntax for template variables that users will fill in.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Briefly describe what this prompt does"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Content Creation">Content Creation</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="button" onClick={handleAddTag} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button className="w-full" onClick={handleSave}>
          Save Prompt
        </Button>
      </div>
    </div>
  )
} 