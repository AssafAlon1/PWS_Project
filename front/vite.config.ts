import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/PWS_Project/",
  // Copy also the 404.html file when building
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        notFound: "./404.html",
      }
    }
  }
})
