import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.fm619tech.paperphoneplus',
  appName: 'PaperPhone',
  webDir: 'dist',
  server: {
    // HTTPS scheme is required for WebRTC getUserMedia() and crypto.subtle
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#1a1a2e',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: false,
  },
}

export default config
