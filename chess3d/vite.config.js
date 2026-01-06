import { defineConfig } from 'vite'

export default defineConfig({
  // Set base to /chess3d/ for production builds
  // This ensures asset URLs resolve correctly when deployed to guyintheloop.com/chess3d/
  base: '/chess3d/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})


