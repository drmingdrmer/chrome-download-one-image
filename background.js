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
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'download-image') {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            try {
                // 注入鼠标跟踪脚本（如果还没有注入）
                await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: initializeHoverTracking
                });

                // 获取当前悬停的图片并下载
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: getCurrentHoveredImage
                });

                if (results[0].result) {
                    downloadImageFromUrl(results[0].result);
                } else {
                    console.log('没有找到悬停的图片');
                }
            } catch (error) {
                console.error('脚本执行失败:', error);
            }
        }
    }
});

// 初始化鼠标悬停跟踪（注入到页面中）
function initializeHoverTracking() {
    // 避免重复初始化
    if (window.imageHoverTracker) return;

    window.imageHoverTracker = {
        currentHoveredImage: null,

        init() {
            document.addEventListener('mouseover', (event) => {
                if (event.target.tagName === 'IMG') {
                    this.currentHoveredImage = event.target;
                }
            });

            document.addEventListener('mouseout', (event) => {
                if (event.target.tagName === 'IMG') {
                    setTimeout(() => {
                        if (this.currentHoveredImage === event.target) {
                            this.currentHoveredImage = null;
                        }
                    }, 100);
                }
            });
        }
    };

    window.imageHoverTracker.init();
}

// 获取当前悬停的图片（注入到页面中）
function getCurrentHoveredImage() {
    if (window.imageHoverTracker && window.imageHoverTracker.currentHoveredImage) {
        return window.imageHoverTracker.currentHoveredImage.src;
    }

    // Fallback: 找第一个可见的图片
    const images = document.querySelectorAll('img');
    for (let img of images) {
        if (img.offsetWidth > 0 && img.offsetHeight > 0 && img.src) {
            return img.src;
        }
    }

    return null;
}

// 不再需要监听来自内容脚本的消息，因为我们使用动态注入

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