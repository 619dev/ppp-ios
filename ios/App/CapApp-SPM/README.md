# CapApp-SPM

This package is used to host SPM dependencies for your Capacitor project

Do not modify the contents of it or there may be unintended consequences.

App release 2.6.6 (build 52) supports adaptive iPhone Duo layouts on iOS 27.1 and iPhone 17 family layouts on iOS 27. Build the containing App project with Xcode 27.1 or newer; the minimum deployment target remains iOS 16. See the [main README](../../../README_EN.md) and [device validation record](../../../tests/ios-device-compatibility.md). This note does not change the generated Swift package configuration.

2.6.6 adds shared-client media caching and Timeline improvements without adding Swift package dependencies.

On 2026-11-19, a clean Release archive and IPA export completed with `CODE_SIGNING_ALLOWED=YES`; the app and Share Extension both report 2.6.6 (52), and signature verification passed. Upload to App Store Connect completed successfully; Apple processing was pending at upload completion. Local distribution artifacts are in `release/2.6.6/` and are excluded from Git.
