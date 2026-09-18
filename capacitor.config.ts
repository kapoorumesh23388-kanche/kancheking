import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kancheking.app',
  appName: 'Kanche King',
  webDir: 'dist/public',
  server: {
    // Loads the live site directly — required because this game needs the
    // live Express/WebSocket backend (multiplayer, auth, tournaments, etc).
    // Bundling only the static frontend would break all of that.
    url: 'https://kancheking.com',
    cleartext: false
  }
};

export default config;
