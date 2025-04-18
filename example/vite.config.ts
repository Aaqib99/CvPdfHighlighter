import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

export default defineConfig({
  base: "/cv-pdf-highlighter/",
  build: {
    outDir: "dist",
  },
  plugins: [reactRefresh()],
  server: {
    port: 3000,
  },
});
