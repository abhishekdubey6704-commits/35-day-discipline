import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.discipline.thirtyfive',
  appName: 'Fitty Guy',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: { allowMixedContent: false }
}

export default config