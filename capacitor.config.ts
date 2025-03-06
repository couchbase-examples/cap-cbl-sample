import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cap-cbl-sample',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  "plugins": {
    "cbl-ionic": {}
  }
};

export default config;
