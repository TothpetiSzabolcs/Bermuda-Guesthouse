import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files (.env, .env.local, .env.[mode], etc.)
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // ─── DEV: force empty API URL so Vite proxy handles /api ───
  // ─── PROD: use whatever is in .env / .env.production ───────
  const apiUrl = mode === "development" ? "" : (env.VITE_API_URL || "");
  const withCreds = mode === "development" ? "false" : (env.VITE_WITH_CREDENTIALS || "true");

  console.log(`\n  ⚡ Vite mode: ${mode}`);
  console.log(`  📡 VITE_API_URL: ${apiUrl ? apiUrl : "(empty → proxy)"}`);
  console.log(`  🍪 VITE_WITH_CREDENTIALS: ${withCreds}\n`);

  return {
    plugins: [react(), tailwindcss()],

    // Override env vars regardless of what .env files say
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
      "import.meta.env.VITE_WITH_CREDENTIALS": JSON.stringify(withCreds),
    },

    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://localhost:5555",
          changeOrigin: true,
        },
      },
    },
  };
});