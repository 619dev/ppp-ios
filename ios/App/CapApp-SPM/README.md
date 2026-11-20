# CapApp-SPM

This package is used to host SPM dependencies for your Capacitor project

Do not modify the contents of it or there may be unintended consequences.

App release 2.6.7 (build 53) supports adaptive iPhone Duo layouts on iOS 27.1 and iPhone 17 family layouts on iOS 27. Build the containing App project with Xcode 27.1 or newer; the minimum deployment target remains iOS 16. See the [main README](../../../README_EN.md) and [device validation record](../../../tests/ios-device-compatibility.md). This note does not change the generated Swift package configuration.

2.6.6 adds shared-client media caching and Timeline improvements without adding Swift package dependencies.

On 2026-11-19, a clean Release archive and IPA export completed with `CODE_SIGNING_ALLOWED=YES`; the app and Share Extension both report 2.6.6 (52), and signature verification passed. Upload to App Store Connect completed successfully; Apple processing was pending at upload completion. Local distribution artifacts are in `release/2.6.6/` and are excluded from Git.

## 2.6.7 update (2026-11-20)

Absorbs shared client `43cca72`: Profile account-deletion settings offer 3, 6, 12, 24 or 36 months without login, reset after each successful login. Immediate deletion verifies the current password. Password recovery requires an already enabled authenticator and its current six-digit TOTP code; the new password must contain 6–128 characters, and existing device sessions are revoked. Deploy the matching server supporting `/api/users/account-deletion`, `/api/users/delete`, `/api/auth/reset-password` and `account_deleted` events. Native Keychain, notifications, media caching and adaptive layouts are retained. Package, Profile footer, app and Share Extension use 2.6.7 (build 53).

For manual acceptance on iPhone 18 Pro Max / iOS 27.0, Check inactivity-period load/save/retry, password-confirmed deletion and account-deleted logout, recovery with valid/invalid TOTP, mismatched password confirmation and old-session revocation. Verify the Profile footer shows 2.6.7. Server integration and destructive account actions require disposable test accounts; client localization tests cover all eight languages.

2026-11-20: clean frontend build, Capacitor sync, security/sync, attachment, media-cache and eight-language checks passed. A fresh DerivedData Debug build with `CODE_SIGNING_ALLOWED=YES` passed, followed by the final resource build. App and Share Extension plists both report 2.6.7 (53); deep strict signature verification passed.

2026-11-20: Installed and launched on iPhone 18 Pro Max / iOS 27.0; the login screen and Forgot password entry were visually confirmed. The user confirmed manual feature testing passed.

On 2026-11-20, the signed 2.6.7 (53) Release archive and IPA were exported successfully. App Store Connect accepted the upload and reported that the build was processing.
