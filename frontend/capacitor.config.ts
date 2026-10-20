import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:    'com.madrasa.qasmia',
  appName:  'Qasmia',
  webDir:   'dist',
  server: {
    url: 'http://192.168.100.13:5173',   // same WiFi pe backend
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#26346F',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#26346F',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
}

export default config
