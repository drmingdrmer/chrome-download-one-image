// 跟踪当前鼠标悬停的图片
let currentHoveredImage = null;

// 监听鼠标移动，跟踪悬停的图片
document.addEventListener('mouseover', (event) => {
    if (event.target.tagName === 'IMG') {
        currentHoveredImage = event.target;
    }
});

// 监听鼠标离开
document.addEventListener('mouseout', (event) => {
    if (event.target.tagName === 'IMG') {
        // 小延迟以防快速移动鼠标
        setTimeout(() => {
            if (currentHoveredImage === event.target) {
                currentHoveredImage = null;
            }
        }, 100);
    }
});

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadHoveredImage') {
        if (currentHoveredImage && currentHoveredImage.src) {
            // 发送图片URL给background script进行下载
            chrome.runtime.sendMessage({
                action: 'downloadImage',
                imageUrl: currentHoveredImage.src,
                pageUrl: window.location.href
            });
            sendResponse({ success: true, found: true });
        } else {
            // 如果没有悬停图片，尝试下载页面中第一个图片
            const firstImage = document.querySelector('img');
            if (firstImage && firstImage.src) {
                chrome.runtime.sendMessage({
                    action: 'downloadImage',
                    imageUrl: firstImage.src,
                    pageUrl: window.location.href
                });
                sendResponse({ success: true, found: true, fallback: true });
            } else {
                sendResponse({ success: false, found: false });
            }
        }
    }
    return true; // 保持消息通道打开
}); 