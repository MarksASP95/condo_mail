import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path, { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // appType: "mpa",
  plugins: [
    VitePWA({ registerType: 'autoUpdate' })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        form: resolve(__dirname, 'form/index.html'),
      },
    },
  },
  server: {
    port: 8000,
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
});