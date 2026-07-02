import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Supabase integration provides NEXT_PUBLIC_ prefixed vars. Expose them to the client.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
