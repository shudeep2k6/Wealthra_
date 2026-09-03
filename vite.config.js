import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true,
    watch: {
      ignored: [
        '**/backend/**',
        '**/monthly_income_manager_bundle/**',
        '**/loan_terms_detector_bundle/**',
        '**/.git/**',
        '**/*.mp4',
        '**/A_premium_cinematic_fintech_AI.mp4'
      ]
    }
  }
});
