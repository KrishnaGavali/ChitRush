import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Expose to all network interfaces
    port: 5173, // Default Vite port, you can change this if needed
    open: true, // Automatically open browser when starting
    strictPort: true, // Exit if port is already in use
  },

})
