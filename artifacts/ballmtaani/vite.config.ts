import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { answerMchambuzi } from "./api/_mchambuzi-core";
import newsHandler from "./api/news";
import sitemapHandler from "./api/sitemap";

const port = Number(process.env.PORT || 5173);

// Port is already set above

const basePath = process.env.BASE_PATH || '/';
const serverEnv = {
  ...loadEnv(process.env.NODE_ENV || "development", path.resolve(import.meta.dirname), ""),
  ...process.env,
};

export default defineConfig({
  base: basePath,
  plugins: [
    {
      name: "ballmtaani-football-api-proxy",
      configureServer(server) {
        server.middlewares.use("/api/football", async (req, res) => {
          const key = serverEnv.VITE_API_FOOTBALL_KEY || serverEnv.API_FOOTBALL_KEY;
          if (!key) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing API-Football key." }));
            return;
          }

          try {
            const incoming = new URL(req.url || "", "http://localhost");
            const upstreamUrl = `https://v3.football.api-sports.io${incoming.pathname.replace(/^\/api\/football/, "")}${incoming.search}`;
            const upstream = await fetch(upstreamUrl, {
              headers: { "x-apisports-key": String(key) },
            });

            const text = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
            res.setHeader("Cache-Control", "no-store");
            res.end(text);
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Football proxy failed.", detail: String(error) }));
          }
        });
      },
    },
    {
      name: "ballmtaani-news-api",
      configureServer(server) {
        server.middlewares.use("/api/news", async (req, res) => newsHandler(req, res));
      },
    },
    {
      name: "ballmtaani-sitemap",
      configureServer(server) {
        server.middlewares.use("/sitemap.xml", async (req, res) => sitemapHandler(req, res));
      },
    },
    {
      name: "ballmtaani-mchambuzi-api",
      configureServer(server) {
        server.middlewares.use("/api/mchambuzi", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          let rawBody = "";
          req.on("data", (chunk) => {
            rawBody += chunk;
          });
          req.on("end", async () => {
            try {
              const body = rawBody ? JSON.parse(rawBody) : {};
              const question = String(body.question || "").trim();
              if (question.length < 3) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Ask a football question first." }));
                return;
              }

              const requestedProvider = String(body.provider || "").trim().toLowerCase();
              const providerPreference =
                requestedProvider === "gemini" ? "gemini-only" :
                requestedProvider === "openai" ? "openai-only" :
                requestedProvider === "openai-first" ? "openai-first" :
                requestedProvider === "gemini-first" ? "gemini-first" :
                undefined;
              const debug = body.debug === true || serverEnv.MCHAMBUZI_DEBUG === "true";
              const result = await answerMchambuzi(question, serverEnv, { debug, providerPreference });
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Cache-Control", "no-store");
              res.end(JSON.stringify(result));
            } catch {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Mchambuzi failed to answer." }));
            }
          });
        });
      },
    },
    react(),
    tailwindcss(),

  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";
          if (id.includes("/react/") || id.includes("/react-dom/")) return "vendor-react";
          if (id.includes("@supabase")) return "vendor-supabase";
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
