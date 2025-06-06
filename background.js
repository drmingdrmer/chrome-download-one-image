// 当扩展安装或启动时，创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    // 创建右键菜单项，只在图片上显示
    chrome.contextMenus.create({
        id: "downloadImage",
        title: "&Download Image",
        contexts: ["image"]
    });
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "downloadImage" && info.srcUrl) {
        downloadImageFromUrl(info.srcUrl);
    }
});

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
    if (command === 'download-image') {
        // 获取当前活动标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                // 发送消息给内容脚本，请求下载悬停的图片
                chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadHoveredImage' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('发送消息失败:', chrome.runtime.lastError);
                    } else if (response && !response.success) {
                        console.log('没有找到可下载的图片');
                    } else if (response && response.fallback) {
                        console.log('下载页面中的第一个图片');
                    }
                });
            }
        });
    }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadImage' && request.imageUrl) {
        downloadImageFromUrl(request.imageUrl);
        sendResponse({ success: true });
    }
    return true;
});

// 提取下载逻辑为独立函数
function downloadImageFromUrl(imageUrl) {
    // 从URL中提取文件名
    const url = new URL(imageUrl);
    let filename = url.pathname.split('/').pop();

    // 如果没有文件扩展名，尝试从URL参数或添加默认扩展名
    if (!filename || !filename.includes('.')) {
        const urlParams = new URLSearchParams(url.search);
        filename = urlParams.get('filename') || `image_${Date.now()}.jpg`;
    }

    // 清理文件名，移除特殊字符
    filename = filename.replace(/[<>:"/\\|?*]/g, '_');

    // 下载图片
    chrome.downloads.download({
        url: imageUrl,
        filename: filename,
        conflictAction: 'uniquify' // 如果文件名重复，自动重命名
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error('下载失败:', chrome.runtime.lastError);
        } else {
            console.log('开始下载，ID:', downloadId);
        }
    });
}

// 监听下载完成事件（可选，用于调试）
chrome.downloads.onChanged.addListener((delta) => {
    if (delta.state && delta.state.current === 'complete') {
        console.log('下载完成:', delta.id);
    }
}); 