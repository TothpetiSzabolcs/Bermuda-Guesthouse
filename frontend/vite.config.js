import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const apiUrl = mode === "development" ? "" : (env.VITE_API_URL || "");
  const withCreds = mode === "development" ? "false" : (env.VITE_WITH_CREDENTIALS || "true");

  console.log(`\n  ⚡ Vite mode: ${mode}`);
  console.log(`  📡 VITE_API_URL: ${apiUrl ? apiUrl : "(empty → proxy)"}`);
  console.log(`  🍪 VITE_WITH_CREDENTIALS: ${withCreds}\n`);

  return {
    plugins: [react(), tailwindcss()],

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