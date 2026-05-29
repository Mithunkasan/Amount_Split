import type { CapacitorConfig } from '@capacitor/cli';

// Determine the active target URL:
// - Dev / local debugging: 'http://localhost:3000' or local development IP
// - Production: the Vercel hosted domain URL (Prisma/Server Actions compatible)
const targetUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const config: CapacitorConfig = {
  appId: 'com.tripsplit.app',
  appName: 'TripSplit',
  webDir: 'out',
  server: {
    url: targetUrl,
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
