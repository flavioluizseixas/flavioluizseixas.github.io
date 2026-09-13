import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'registration.spec.ts',
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
    env: {
      PUBLIC_REGISTRATION_WEB_APP_URL:
        'https://script.google.com/macros/s/registration-test/exec'
    }
  },
  use: { baseURL: 'http://127.0.0.1:4322' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
});
