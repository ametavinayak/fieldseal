import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    proxy: {
      "/api": "http://127.0.0.1:8778",
      "/docs": "http://127.0.0.1:8778",
      "/openapi.json": "http://127.0.0.1:8778",
    },
  },
});
