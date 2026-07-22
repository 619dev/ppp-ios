# PaperPhone+ iOS Client

**ppp-ios** — The iOS native client fork of PaperPhone+, wrapping the React web app into a native iOS application using Capacitor.

[![React](https://img.shields.io/badge/React-19-blue)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](#) [![Capacitor](https://img.shields.io/badge/Capacitor-8-green)](#) [![Vite](https://img.shields.io/badge/Vite-6-purple)](#) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

🌐 **中文版：** [README.md](README.md)

---

## What's New in 2.2.0

- Added complete localization for group video and voice meetings in all eight supported languages.
- Localized meeting invitations, connection status, participant and host controls, errors, and system notifications.
- Improved accessibility labels and local-video mute detection on iOS.
- Preserved server-provided meeting capacity limits and refined the iOS build integration.

---

## About

This repository is the **iOS native client** fork of [PaperPhone+](https://github.com/619dev/Paperphone-plus). PaperPhone+ is a WeChat-style end-to-end encrypted instant messaging application featuring stateless ECDH + XSalsa20-Poly1305 per-message encryption with forward secrecy.

This project uses [Capacitor](https://capacitorjs.com/) to package the React + TypeScript frontend as a native iOS application, with APNS push notification support. It is available on the [App Store](https://apps.apple.com/us/app/paperphoneplus/id6769265178).

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 End-to-End Encryption | Stateless ECDH + XSalsa20-Poly1305, per-message ephemeral keys, forward secrecy |
| 🛡️ Post-Quantum Encryption | Integrated CRYSTALS-Kyber post-quantum key encapsulation |
| 🗝️ Zero-Knowledge Server | Private keys stored only on device, 4-layer persistence (Memory → localStorage → sessionStorage → IndexedDB) |
| 📹 Video/Voice Calls | WebRTC P2P (1:1) + LiveKit SFU (group meetings), with voice and video support |
| 🧑‍🏫 Meeting Controls | Host mute-all, discussion/lecture modes, participant list, and speaking status |
| 🎙️ Real-time Voice Changer | 3 modes (0.8x / 1.0x / 1.2x), powered by Web Audio API |
| 👥 Group Chat | Up to 2000 members, encrypted & unencrypted modes |
| 💬 Messaging | Text, images, videos, documents, voice messages, emoji panel, Telegram sticker packs |
| 🌐 Moments | Post updates, likes, comments, tag-based visibility control |
| 📰 Timeline | Xiaohongshu-style waterfall feed, anonymous posting supported |
| 🔔 APNS Push | Native Apple Push Notification Service |
| 🔴 App Badge | Keeps the iOS home-screen badge synchronized with the in-app unread count |
| 🌍 Multi-language | Chinese, English, Japanese, Korean, French, German, Russian, Spanish |
| 🔑 Two-Factor Auth | TOTP (Google Authenticator compatible) + recovery codes |
| 📱 Persistent Sessions | Keeps users signed in across network, proxy, or IP changes; signs out only on explicit server revocation |

---

## Tech Stack

```
Frontend
  React 19 + TypeScript 5.7 + Vite 6
  Zustand — State management
  libsodium-wrappers-sumo — Curve25519 / XSalsa20-Poly1305 (WebAssembly)
  crystals-kyber-js — Post-quantum key encapsulation
  WebRTC API — 1:1 video/voice calls
  LiveKit Client — Scalable SFU-based group meetings
  Web Audio API — Real-time voice modulation

Native Layer (Capacitor 8)
  @capacitor/ios — iOS native bridge
  @capacitor/push-notifications — APNS push
  @capacitor/local-notifications — Local notifications
  @capacitor/splash-screen — Splash screen
  @capacitor/status-bar — Status bar control
  @capacitor/app — App lifecycle
  @capawesome/capacitor-badge — iOS app badge synchronization
```

---

## Project Structure

```
ppp-ios/
├── index.html                  # HTML entry point
├── capacitor.config.ts         # Capacitor config (appId, HTTPS scheme, etc.)
├── vite.config.ts              # Vite build configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── ios/                        # Xcode native project directory
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Routing + auth guard
│   ├── index.css               # Design system (dark/light, glassmorphism)
│   ├── api/                    # HTTP + WebSocket clients
│   ├── crypto/
│   │   ├── ratchet.ts          # ECDH + XSalsa20-Poly1305 encryption
│   │   ├── keystore.ts         # 4-layer private key persistence
│   │   └── groupCrypto.ts      # Group encryption (Sender Key protocol)
│   ├── hooks/                  # React Hooks
│   ├── i18n/                   # Internationalization (8 languages)
│   ├── store/                  # Zustand state management
│   ├── components/             # Shared components
│   ├── contexts/               # React Contexts
│   ├── utils/                  # Utility functions
│   └── pages/
│       ├── Login.tsx           # Login / Registration
│       ├── Chats.tsx           # Conversation list
│       ├── Chat.tsx            # Chat window
│       ├── Contacts.tsx        # Contact list
│       ├── Discover.tsx        # Discovery page
│       ├── Profile.tsx         # Settings
│       ├── UserProfile.tsx     # Contact profile
│       ├── GroupInfo.tsx        # Group info
│       ├── Moments.tsx         # Moments (social feed)
│       └── Timeline.tsx        # Timeline (waterfall feed)
├── public/                     # Static assets
├── assets/                     # App assets
├── dist/                       # Build output
└── build/                      # Build artifacts
```

---

## Requirements

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Xcode** ≥ 15 (with iOS 17+ SDK)
- **CocoaPods** (for iOS native dependencies)
- macOS (required for iOS development)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url> && cd ppp-ios
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Local Development (Web Preview)

```bash
npm run dev
# Open http://localhost:5173
```

### 4. Build and Sync to iOS

```bash
# Build the frontend
npm run build

# Sync to Capacitor iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 5. Run in Xcode

1. Select your target device or simulator in Xcode
2. Configure signing (Signing & Capabilities)
3. Click Run (⌘R)

---

## APNS Push Notification Setup

This project uses APNS (Apple Push Notification Service) for native push notifications.

### Prerequisites

1. A valid Apple Developer account
2. Create an APNS Key (.p8 file) in the Apple Developer Portal
3. Enable Push Notifications capability in Xcode

### Backend Configuration

Configure in the backend `server/.env`:

```env
APNS_TEAM_ID=your_team_id
APNS_KEY_ID=your_key_id
APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APNS_BUNDLE_ID=com.fm619tech.paperphoneplus
APNS_SANDBOX=false    # Use true for TestFlight, false for App Store
```

Or use the official push relay (no Apple credentials needed):

```env
APNS_RELAY_URL=https://619.chat
APNS_RELAY_KEY=EzmpqftbsENaRUO6BTABxLV96q7RuEDyokXJr1DWdDjL54cLg7yXVUQqydCQvxrX
```

When a push or message arrives, or a conversation is marked as read, the app recalculates the total unread count and synchronizes the iOS home-screen badge.

---

## Group Meetings

Group voice and video meetings use a LiveKit SFU, so each device maintains only one upstream connection and can scale better for multi-party calls. The backend `/api/calls/meeting-token` endpoint supplies meeting credentials and participant limits; a full deployment therefore requires a LiveKit service configured on the backend.

- The meeting creator becomes the host and can mute everyone.
- In discussion mode, participants can unmute themselves. Switching to lecture mode mutes non-host participants and prevents them from unmuting.
- The client enables adaptive stream and dynacast to reduce bandwidth usage in multi-party video meetings.

---

## Login Session Behavior

Ordinary network loss, WebSocket reconnection, proxy changes, IP changes, or a single HTTP 401 response do not immediately clear local login state. The client signs out only after an explicit server signal for session revocation, forced logout, account disablement, or account deletion.

---

## Upstream Project

This project is the iOS client fork of [619dev/PaperPhonePlus](https://github.com/619dev/Paperphone-plus). The upstream project contains the full backend (Rust/Axum) and frontend source code.

For full system deployment (including backend server), please refer to the upstream documentation:
- 🚀 [Zeabur One-click Deployment](https://zeabur.com/templates/SK6T93?referralCode=619dev)
- 🐳 Docker Compose deployment
- ▲ Vercel frontend deployment
- 📡 Video call TURN configuration
- 🔔 Push notifications (APNS / FCM / OneSignal / ntfy / Web Push)

---

## License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE), consistent with the upstream project [619dev/PaperPhonePlus](https://github.com/619dev/Paperphone-plus).

In summary:
- ✅ Free to use and deploy for individuals and organizations
- ✅ Modification is permitted
- ⚠️ If you provide a modified version as a network service, you **must release the modified source code**
- ⚠️ Derivative works **must use the same license** (AGPL-3.0)

See the [LICENSE](LICENSE) file for the full license text.

---

## Acknowledgments

- [PaperPhone+](https://github.com/619dev/Paperphone-plus) — Upstream project
- [Capacitor](https://capacitorjs.com/) — Cross-platform native runtime
- [libsodium](https://doc.libsodium.org/) — Cryptographic library
- [CRYSTALS-Kyber](https://pq-crystals.org/kyber/) — Post-quantum cryptography
