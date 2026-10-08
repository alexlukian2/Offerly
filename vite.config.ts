import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
// defineConfig з vitest/config — той самий, що з vite, але ще знає про секцію test
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // jsdom — "браузер" на Node.js: DOM, localStorage, події. Без вікна й без малювання
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Тести дат не мають залежати від того, в якому поясі їх запускають
    env: { TZ: 'Europe/Kyiv' },
    // Після кожного тесту прибрати всі vi.spyOn / vi.fn-заміни
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/index.ts', 'src/main.tsx'],
    },
  },
})
