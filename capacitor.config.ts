import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sexylove.app",
  appName: "Ñaaam",
  webDir: "dist",
  // Enable deep linking for OAuth callbacks
  server: {
    // For development: uncomment below to use local server
    // url: "http://192.168.x.x:5173",
    // cleartext: true,
  },
  plugins: {
    // App plugin handles deep links automatically
    App: {
      // The callback URL scheme (com.sexylove.app://)
    },
  },
};

export default config;
