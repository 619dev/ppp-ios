# iPhone adaptive layout validation

Version **2.6.1**, build **50** includes iPhone Duo adaptation for folded, partially open and fully open displays.

Target: iPhone Duo on iOS 27.1, and iPhone 17 / 17 Pro / 17 Pro Max / 17e / Air on iOS 27 (including the 27.0.1 device update). Keep the deployment target at iOS 16; build with Xcode 27.1 or newer for Duo display support.

## Layout contract

- UIKit creates the Capacitor controller from the scene's `Main` storyboard. Scene URL callbacks forward both cold and warm links to Capacitor.
- The WebView paints edge to edge and follows the keyboard layout guide. On iOS 17+, `usesBottomSafeArea = false` prevents an unpainted strip below the WebView when the keyboard is hidden. Its current safe insets are published to CSS after navigation and on native layout changes.
- Native content inset adjustment is disabled. The HTML root paints its background across the full display, and applies native safe areas once around `app-shell`. The shell resets descendant inset variables to zero and establishes the containing block for fixed overlays. Context menu touch coordinates are converted into this coordinate system. Do not size from `UIScreen.main` or identify layouts by model name.
- Native pages fill the available width. Login cards scroll vertically on short screens and use two columns at 760pt of available content width. The authenticated workspace shows a Mac-style conversation sidebar at 760pt width and 460pt height; smaller bounds use single-column routing. The routed detail remains mounted when the sidebar appears or disappears. Browser layout keeps its existing maximum width.
- iPhone supports portrait and both landscape orientations. Remote call video uses aspect fit to avoid cropping when the window's aspect ratio changes.

## Validation record (2026-10-20)

Passed: frontend production build, signed arm64 simulator build with the iOS 27.1 SDK, property-list validation, security tests, attachment tests and localization tests.

Duo / iOS 27.1 (24A94425): final UI launched and visually inspected on outer, open inner and partially open inner displays. The former white trailing and bottom bands are now painted with the app background. On the wide inner display, the two-column login shows all fields, language choices and legal links together. This is layout smoke coverage, not a full signed-in functionality test.

iPhone 17 Pro Max / iOS 27.0 (24A434): after clearing build caches and old build directories, a clean signed 2.6.1 (50) build passed, the app and extension version fields were checked, and the app launched into an existing account's Discover page. Data and Keychain were preserved. The other four models have not completed final-build functional acceptance. Apple did not offer a downloadable 27.0.1 simulator; validate that exact patch on a physical device. The installed 27.1 runtime only advertises iPhone Duo as a compatible device.

## Manual release checks

1. On each phone, launch with and without an existing account. Verify the header, navigation, chat composer and home-indicator area.
2. Focus login fields and the chat composer with the software keyboard enabled. The viewport should shrink above a docked keyboard, and the focused field, submit/send controls and modal content should remain reachable by scrolling. Dismiss the keyboard and confirm the viewport expands again.
3. On Duo, repeat closed, open and partially open, in both rotations. Fold while typing and while a modal is open; preserve input and navigation state.
4. Open profile, attachment/export picker, QR scanner, notifications, privacy unlock and incoming/outgoing call UI. Verify long translated labels and large accessibility text.
5. Exercise camera, microphone, APNs, background/foreground and active calls on physical devices. Simulator launch screenshots do not establish those hardware and server-backed behaviors.

References: [Apple Duo preparation](https://developer.apple.com/iphone-duo/prepare/), [UIKit scene migration](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle).
