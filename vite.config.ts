import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build produksi membuang console.log/info/debug (log debug yang bisa mencetak data form,
  // profil user, dsb. ke console browser). console.warn dan console.error tetap ada.
  esbuild: mode === 'production'
    ? { pure: ['console.log', 'console.info', 'console.debug'] }
    : undefined,
}));
