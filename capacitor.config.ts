import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kancheking.app',
  appName: 'Kanche King',
  webDir: 'dist/public',
  server: {
    url: 'https://kancheking.com',
    cleartext: true
  }
};

export default config;