import { defineConfig } from "vite";
import path, { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // appType: "mpa",
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