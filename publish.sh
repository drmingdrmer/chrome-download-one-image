#!/bin/bash

# Chrome Extension Publishing Script
# Alt+D Image Downloader

set -e  # Exit on any error

echo "🚀 Chrome Extension Publishing Script"
echo "====================================="
echo ""

# 1. 检查必要文件
echo "📋 Checking required files..."
required_files=("manifest.json" "background.js" "content.js" "icons/favicon-16x16.png" "icons/favicon-32x32.png")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# 2. 验证manifest.json
echo ""
echo "🔍 Validating manifest.json..."
if ! jq empty manifest.json 2>/dev/null; then
    echo "❌ Invalid JSON in manifest.json"
    exit 1
else
    echo "✅ manifest.json is valid JSON"
fi

# 获取版本号
VERSION=$(jq -r '.version' manifest.json)
NAME=$(jq -r '.name' manifest.json)
echo "📦 Extension: $NAME v$VERSION"

# 3. 清理旧的打包文件
echo ""
echo "🧹 Cleaning up old packages..."
rm -f *.zip
echo "✅ Cleaned up old ZIP files"

# 4. 创建扩展包
echo ""
echo "📦 Creating extension package..."
ZIP_NAME="alt-d-image-downloader-v${VERSION}.zip"

# 打包扩展（排除不需要的文件）
zip -r "$ZIP_NAME" \
    manifest.json \
    background.js \
    content.js \
    icons/ \
    -x "*.DS_Store" "*.git*" "*/.git/*" "store-assets/*" "test.html" "README.md" "publish.sh" "*.zip"

echo "✅ Created package: $ZIP_NAME"

# 5. 检查包大小
PACKAGE_SIZE=$(ls -lh "$ZIP_NAME" | awk '{print $5}')
echo "📏 Package size: $PACKAGE_SIZE"

# 6. 验证ZIP内容
echo ""
echo "🔍 Package contents:"
unzip -l "$ZIP_NAME"

# 7. 生成发布信息
echo ""
echo "📄 Generating store listing information..."

cat > store-listing.txt << EOF
==============================================
Chrome Web Store Listing Information
==============================================

Extension Name: $NAME
Version: $VERSION
Package: $ZIP_NAME
Category: Productivity

Short Description (132 chars max):
Download images instantly with Alt+D hotkey or right-click menu. No dialogs, direct to Downloads folder.

Detailed Description:
**Alt+D Image Downloader** - The fastest way to download images from any website!

🚀 **Lightning Fast**: Just hover over any image and press Alt+D to download instantly
📱 **Right-Click Option**: Traditional right-click menu with "Download Image" option  
⚡ **Zero Dialogs**: Direct download to your Chrome Downloads folder
🎯 **Smart Detection**: Automatically detects images under your cursor

## How to Use:
1. **Super Fast Method**: Hover over any image → Press Alt+D → Done!
2. **Traditional Method**: Right-click image → Select "Download Image"

## Perfect for:
- Web designers collecting references
- Students saving images for projects  
- Social media content creators
- Anyone who downloads lots of images

## Privacy & Security:
- No data collection
- Works entirely offline
- Minimal permissions required

Save time and clicks - Download images the smart way!

Keywords: image downloader, download images, alt+d, hotkey, fast download, right click, save image, web images, instant download

Permissions:
- contextMenus: Create right-click menu items
- downloads: Download files to user's computer
- Host permissions (*://*/*): Access images on all websites

==============================================
EOF

echo "✅ Created store-listing.txt with all the information you need"

# 8. 发布指导
echo ""
echo "🎯 Next Steps for Publishing:"
echo "=============================="
echo ""
echo "1. 📝 Developer Account:"
echo "   - Go to: https://chrome.google.com/webstore/devconsole/"
echo "   - Sign in with Google account"
echo "   - Pay \$5 one-time registration fee (if not done)"
echo ""
echo "2. 📤 Upload Extension:"
echo "   - Click 'Add new item'"
echo "   - Upload: $ZIP_NAME"
echo "   - Chrome will auto-fill some information"
echo ""
echo "3. 📋 Fill Store Listing:"
echo "   - Copy information from: store-listing.txt"
echo "   - Add screenshots (take 2-3 showing the extension in action)"
echo "   - Set visibility to 'Public'"
echo ""
echo "4. 🔍 Submit for Review:"
echo "   - Review all information"
echo "   - Click 'Submit for review'"
echo "   - Wait 1-3 business days for approval"
echo ""
echo "✅ Package ready: $ZIP_NAME"
echo "✅ Store listing ready: store-listing.txt"
echo ""
echo "🚀 Your extension is ready to publish!" 