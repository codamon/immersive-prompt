console.log("背景脚本已启动");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('sender: ', sender);
    if (request.action === "openAddPromptPage") {
        // 打开 options 页面，并带一个 hash 或 query 参数来指示打开“添加”视图
        // 例如: options.html#add-prompt
        let url = chrome.runtime.getURL("src/options/options.html#add-prompt");

        // 检查是否已经有一个tab打开了这个URL（避免重复打开）
        chrome.tabs.query({ url: chrome.runtime.getURL("src/options/options.html") + "*" }, (tabs) => {
            const addPromptTab = tabs.find(tab => tab.url && tab.url.includes("#add-prompt"));
            if (addPromptTab && addPromptTab.id) {
                // 如果已存在，则激活该标签页
                chrome.tabs.update(addPromptTab.id, { active: true });
                if (addPromptTab.windowId) {
                    chrome.windows.update(addPromptTab.windowId, { focused: true });
                }
            } else {
                // 否则，创建新标签页
                chrome.tabs.create({ url });
            }
        });
        sendResponse({ status: "请求已收到，正在打开添加提示页面" });
        return true; // 异步响应
    }
    else if (request.action === "promptAddedSuccessfully") {
        console.log("Background: 收到 promptAddedSuccessfully 消息");
        // 通知所有 content scripts 刷新它们的列表
        chrome.tabs.query({}, (tabs) => { // 查询所有标签页
            tabs.forEach((tab) => {
                if (tab.id) { // 确保 tab.id 存在
                    // 只向可能运行 content script 的页面发送消息
                    // 你可以根据 host_permissions 进一步筛选
                    if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                        chrome.tabs.sendMessage(tab.id, { action: "promptAddedRefresh", newPromptId: request.newPromptId })
                            .then(response => console.log("Background: content script 响应:", response))
                            .catch(error => console.warn("Background: 发送消息到 tab " + tab.id + " 失败:", error.message)); // 捕获并记录错误
                    }
                }
            });
        });
        sendResponse({ status: "刷新通知已发送" });
        return true; // 异步响应
    }
});