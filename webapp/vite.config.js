import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Use modern JS to avoid legacy polyfills using eval
    sourcemap: false, // Disable source maps in production to avoid eval usage
    minify: 'esbuild', // Ensure esbuild minification
  }
})
