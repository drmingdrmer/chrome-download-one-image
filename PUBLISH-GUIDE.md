# 🚀 Chrome Extension Publishing Guide

## 1. Create Package
```bash
./publish.sh
```
或手动：
```bash
zip -r alt-d-image-downloader-v1.0.zip manifest.json background.js content.js icons/ -x "*.DS_Store"
```

## 2. Developer Account
1. 访问：https://chrome.google.com/webstore/devconsole/
2. Google账号登录
3. 支付 $5 注册费（一次性）

## 3. Upload & Fill Info
1. 点击 "Add new item"
2. 上传 ZIP 文件
3. 填写商店信息（从 `store-listing.txt` 复制）
4. 添加 2-3 张截图展示功能
5. 选择 "Public" 可见性

## 4. Submit & Wait
1. 点击 "Submit for review"
2. 等待 1-3 工作日审核
3. 收到邮件通知结果

## 📋 Checklist
- [ ] 运行 `./publish.sh` 
- [ ] 开发者账号注册
- [ ] 上传ZIP文件
- [ ] 填写商店信息
- [ ] 添加截图
- [ ] 提交审核

✅ Done! 