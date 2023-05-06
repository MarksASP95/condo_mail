import { defineConfig } from "vite";
import path, { resolve } from "path";

const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      console.log(resolve(__dirname))
      return html.replace(
        /<title>(.*?)<\/title>/,
        `<title>Condo Mail</title>`,
      )
    },
  }
}

const rewriteSlashToIndexHtml = () => {
  return {
    name: 'rewrite-slash-to-index-html',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      // rewrite / as index.html
      server.middlewares.use('/form', (req, res, next) => {
        if (req.url === '/') {
          req.url = '/index.html'
        }
        next()
      })
    },
  }
}

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