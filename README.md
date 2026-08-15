# PaperPhone+ iOS 客户端

**ppp-ios** — PaperPhone+ 的 iOS 原生客户端分支，基于 Capacitor 将 React Web 应用打包为 iOS 原生 App。

[![React](https://img.shields.io/badge/React-19-blue)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](#) [![Capacitor](https://img.shields.io/badge/Capacitor-8-green)](#) [![Vite](https://img.shields.io/badge/Vite-6-purple)](#) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

🌐 **English Version:** [README_EN.md](README_EN.md)

---

## 2.4.4 更新说明

- 修复额外加密锁定状态下错误显示“设置密码”的问题；现在显示“输入解锁密码”，并同步全部 8 种语言。

- 修复关闭额外文本外观加密时未验证密码的安全问题；现在即使已解锁，也必须重新输入正确的额外密码才能关闭。
- 文本外观现已隐藏协议元数据，发送中的本地缓存不再保留消息原文。
- 额外聊天记录加密已移至个人信息 > 消息隐私，并全局应用于所有聊天。

- 加密发送改为失败即停止，不再因加密或密钥分发错误回退为明文；消息会显示实际采用的 `PQ v2`、`X25519 ↓` 或 `SK vN`。
- 新增可选聊天记录额外密码、8 种文本外观编码，以及应用离开前台 5/15/30/60 分钟后的自动锁定。
- 未解锁或密码错误时仅显示文本外观密文；身份私钥与 Sender Key 继续由 iOS Keychain 保护，并补齐 8 种语言界面。

## 2.4.0 更新说明

- 新增 iOS 系统分享扩展，可从“文件”、照片及其他应用将文件发送给 PaperPhonePlus 联系人。

## 2.3.9 更新说明

- 修复历史单向好友记录导致“已是好友”但联系人列表不可见、无法聊天的问题；再次添加时会自动补齐双向关系并立即刷新好友列表。

## 2.3.8 更新说明

- 修复在相机权限弹窗期间关闭扫码器后，摄像头仍可能保持运行的问题。
- 修复扫码页返回按钮的触控层级，确保 iOS 上可以可靠关闭扫码器。
- 好友搜索结果会标记并禁用已经是好友的用户，避免重复发送好友申请。

## 2.3.7 更新说明

- 修复新安装或保留登录态升级后，本机缺少身份私钥时应用无法启动的问题。
- 启动时会安全恢复或初始化身份密钥，并清理迁移过程中遗留的无效 Keychain 数据。
- 服务端暂时不可用时不再阻塞本地安全状态初始化，恢复联网后可继续完成密钥同步。

---

## 项目简介

本仓库是 [PaperPhone+](https://github.com/619dev/Paperphone-plus) 的 **iOS 原生客户端**分支。PaperPhone+ 是一款仿微信 UI 的端对端加密即时通讯软件，采用无状态 ECDH + XSalsa20-Poly1305 逐消息加密，具备前向保密特性。

本项目使用 [Capacitor](https://capacitorjs.com/) 将 React + TypeScript 前端封装为 iOS 原生应用，支持 APNS 推送通知，并已上架 [App Store](https://apps.apple.com/us/app/paperphoneplus/id6769265178)。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🔐 端对端加密 | 无状态 ECDH + XSalsa20-Poly1305，逐消息临时密钥，前向保密 |
| 🛡️ 抗量子加密 | 集成 CRYSTALS-Kyber 后量子密钥封装 |
| 🗝️ 安全本地密钥 | 身份私钥和群聊 Sender Keys 保存在 iOS Keychain，聊天缓存使用设备专属 AES-256-GCM 密钥加密 |
| 📹 视频/语音通话 | 基于 LiveKit SFU 的私聊与群组语音/视频通话 |
| 🧑‍🏫 会议管理 | 主持人全员静音、自由讨论/讲课模式切换、参会者列表与发言状态 |
| 🎙️ 实时变声 | 3 档可选 (0.8x / 1.0x / 1.2x)，基于 Web Audio API |
| 👥 群聊 | 最多 2000 人，支持加密/未加密两种模式 |
| 💬 消息 | 文字、图片、视频、文档、语音消息、Emoji 面板、Telegram 贴纸包 |
| 📴 离线浏览 | 缓存联系人、群组、聊天记录、朋友圈、时间线及媒体，并支持一键清理 |
| 📷 扫一扫 | 支持原生 `BarcodeDetector`，并使用 `jsQR` 兼容 iOS WKWebView |
| 🌐 朋友圈 | 发动态、点赞、评论、标签可见性控制 |
| 📰 时间线 | 小红书风格双列瀑布流，支持匿名发帖 |
| 🔔 APNS 推送 | Apple Push Notification Service 原生推送 |
| 🔴 应用角标 | iOS 主屏角标与应用内未读消息数自动同步 |
| 🌍 多语言 | 中/英/日/韩/法/德/俄/西，8 种语言 |
| 🔑 两步验证 | TOTP (Google Authenticator 兼容) + 恢复码 |
| 📱 会话保持 | 网络中断、代理或 IP 变化时保留登录，仅在服务端明确撤销后退出 |

---

## 技术栈

```
前端
  React 19 + TypeScript 5.7 + Vite 6
  Zustand — 状态管理
  libsodium-wrappers-sumo — Curve25519 / XSalsa20-Poly1305 (WebAssembly)
  crystals-kyber-js — 后量子密钥封装
  LiveKit Client — 基于 SFU 的私聊与群组语音/视频通话
  Web Audio API — 实时变声
  jsQR — iOS WKWebView 二维码识别回退

原生层 (Capacitor 8)
  @capacitor/ios — iOS 原生桥接
  @capacitor/push-notifications — APNS 推送
  @capacitor/local-notifications — 本地通知
  @capacitor/splash-screen — 启动屏
  @capacitor/status-bar — 状态栏控制
  @capacitor/app — App 生命周期
  @capawesome/capacitor-badge — iOS 应用角标同步
```

---

## 项目结构

```
ppp-ios/
├── index.html                  # HTML 入口
├── capacitor.config.ts         # Capacitor 配置（appId、HTTPS scheme 等）
├── vite.config.ts              # Vite 构建配置
├── package.json                # 依赖管理
├── tsconfig.json               # TypeScript 配置
├── ios/                        # Xcode 原生工程目录
├── src/
│   ├── main.tsx                # React 入口
│   ├── App.tsx                 # 路由 + 鉴权守卫
│   ├── index.css               # 设计系统（暗色/亮色，玻璃拟态）
│   ├── api/                    # HTTP + WebSocket 客户端
│   ├── crypto/
│   │   ├── ratchet.ts          # ECDH + XSalsa20-Poly1305 加密
│   │   ├── keystore.ts         # 四层私钥持久化
│   │   └── groupCrypto.ts      # 群聊加密 (Sender Key)
│   ├── hooks/                  # React Hooks
│   ├── i18n/                   # 多语言 (8 种语言)
│   ├── store/                  # Zustand 状态管理
│   ├── components/             # 共享组件
│   ├── contexts/               # React Context
│   ├── utils/                  # 工具函数
│   └── pages/
│       ├── Login.tsx           # 登录/注册
│       ├── Chats.tsx           # 会话列表
│       ├── Chat.tsx            # 聊天窗口
│       ├── Contacts.tsx        # 通讯录
│       ├── Discover.tsx        # 发现页
│       ├── Profile.tsx         # 设置
│       ├── UserProfile.tsx     # 联系人资料
│       ├── GroupInfo.tsx        # 群信息
│       ├── Moments.tsx         # 朋友圈
│       └── Timeline.tsx        # 时间线
├── public/                     # 静态资源
├── assets/                     # 应用资源
├── dist/                       # 构建输出
└── build/                      # 构建产物
```

---

## 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Xcode** ≥ 15（含 iOS 17+ SDK）
- **CocoaPods**（用于 iOS 原生依赖）
- macOS（iOS 开发必需）

---

## 快速开始

### 1. 克隆仓库

```bash
git clone <repo-url> && cd ppp-ios
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发（Web 预览）

```bash
npm run dev
# 打开 http://localhost:5173
```

### 4. 构建并同步到 iOS

```bash
# 构建前端
npm run build

# 同步到 Capacitor iOS 项目
npx cap sync ios

# 打开 Xcode
npx cap open ios
```

### 5. 在 Xcode 中运行

1. 在 Xcode 中选择目标设备或模拟器
2. 配置签名（Signing & Capabilities）
3. 点击 Run (⌘R)

---

## APNS 推送配置

本项目使用 APNS (Apple Push Notification Service) 进行原生推送通知。

### 前提条件

1. 有效的 Apple Developer 账号
2. 在 Apple Developer Portal 创建 APNS Key (.p8 文件)
3. 在 Xcode 中启用 Push Notifications capability

### 后端配置

在后端 `server/.env` 中配置：

```env
APNS_TEAM_ID=你的Team_ID
APNS_KEY_ID=你的Key_ID
APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APNS_BUNDLE_ID=com.fm619tech.paperphoneplus
APNS_SANDBOX=false    # TestFlight 用 true，App Store 用 false
```

或使用官方推送中继（无需 Apple 凭据）：

```env
APNS_RELAY_URL=https://619.chat
APNS_RELAY_KEY=EzmpqftbsENaRUO6BTABxLV96q7RuEDyokXJr1DWdDjL54cLg7yXVUQqydCQvxrX
```

应用收到推送、接收新消息或将会话标记为已读时，会重新计算未读消息总数并同步 iOS 主屏角标。

---

## 群会议说明

群语音和群视频会议使用 LiveKit SFU，每台设备只需维持一条上行连接，更适合多人会议。会议令牌和人数上限由后端的 `/api/calls/meeting-token` 接口返回，因此部署时需要同时配置后端的 LiveKit 服务。

- 发起人自动成为主持人，可执行全员静音。
- 自由讨论模式允许参会者自行开麦；切换到讲课模式后，非主持人会被静音且不能自行解除。
- 客户端启用了 adaptive stream 和 dynacast，以减少多人视频会议中的带宽消耗。

---

## 登录会话行为

普通网络中断、WebSocket 重连、代理切换、IP 变化或单次 HTTP 401 不会立即清除本地登录状态。客户端仅在收到服务端明确的会话撤销、强制退出、账号停用或删除信号后退出登录。

---

## 上游项目

本项目是 [619dev/PaperPhonePlus](https://github.com/619dev/Paperphone-plus) 的 iOS 客户端分支。上游项目包含完整的后端（Rust/Axum）和前端源码。

如需部署完整系统（含后端服务器），请参阅上游项目文档：
- 🚀 [Zeabur 一键云部署](https://zeabur.com/templates/SK6T93?referralCode=619dev)
- 🐳 Docker Compose 一键部署
- ▲ Vercel 前端部署
- 📡 视频通话 TURN 配置
- 🔔 推送通知（APNS / FCM / OneSignal / ntfy / Web Push）

---

## 许可证

本项目基于 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) 开源，与上游项目 [619dev/PaperPhonePlus](https://github.com/619dev/Paperphone-plus) 保持一致。

简而言之：
- ✅ 个人和企业均可自由部署和使用
- ✅ 允许修改代码
- ⚠️ 修改后通过网络提供服务时，**必须公开修改后的源代码**
- ⚠️ 衍生作品**必须使用相同协议**（AGPL-3.0）

完整协议文本请参阅 [LICENSE](LICENSE) 文件。

---

## 致谢

- [PaperPhone+](https://github.com/619dev/Paperphone-plus) — 上游项目
- [Capacitor](https://capacitorjs.com/) — 跨平台原生运行时
- [libsodium](https://doc.libsodium.org/) — 加密库
- [CRYSTALS-Kyber](https://pq-crystals.org/kyber/) — 后量子密码学
