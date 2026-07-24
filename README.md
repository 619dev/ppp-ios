# PaperPhone+ iOS 客户端

**ppp-ios** — PaperPhone+ 的 iOS 原生客户端分支，基于 Capacitor 将 React Web 应用打包为 iOS 原生 App。

[![React](https://img.shields.io/badge/React-19-blue)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](#) [![Capacitor](https://img.shields.io/badge/Capacitor-8-green)](#) [![Vite](https://img.shields.io/badge/Vite-6-purple)](#) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

🌐 **English Version:** [README_EN.md](README_EN.md)

---

## 2.2.4 更新说明

- 好友搜索在没有匹配用户时会给出明确提示，搜索请求失败时会显示错误原因。
- 修复添加好友时中文用户名无法搜索的问题：避免中文输入法确认候选词时提前触发搜索。
- 搜索关键词现会进行 Unicode NFC 归一化，并使用规范的 UTF-8 查询参数编码。
- 修复 iOS WKWebView 不支持 `BarcodeDetector` 时“扫一扫”无法识别二维码的问题，新增基于 `jsQR` 的摄像头画面解码回退。
- 完善离线缓存：联系人、群组、聊天记录、朋友圈、时间线及相关媒体可在断网时继续查看。
- 单个会话的本地消息缓存上限由 200 条提升至 2000 条，并支持在“设置”中一键清理本地缓存。
- 群视频和群语音会议界面完整支持中、英、日、韩、法、德、俄、西 8 种语言。
- 本地化会议邀请、连接状态、参会者、主持人控制、错误提示及系统通知。
- 优化 iOS 会议界面的无障碍标签和本地视频静音识别。
- 保留服务端下发的动态会议人数上限，并完善 iOS 构建适配。

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
| 🗝️ 零知识服务器 | 私钥仅在设备本地，四层持久化（内存 → localStorage → sessionStorage → IndexedDB） |
| 📹 视频/语音通话 | WebRTC P2P（1:1）+ LiveKit SFU（群会议），支持语音与视频会议 |
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
  WebRTC API — 1:1 视频/语音通话
  LiveKit Client — 基于 SFU 的可扩展群会议
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
