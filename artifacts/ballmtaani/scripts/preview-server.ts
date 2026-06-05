import http from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import newsHandler from "../api/news";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const apiBase = "https://v3.football.api-sports.io";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

const apiKey = process.env.VITE_API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY || "";
const port = Number(process.env.PORT || 5173);

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function sendFile(res: http.ServerResponse, filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
  };
  res.setHeader("Content-Type", contentType[ext] || "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

async function proxyFootball(req: http.IncomingMessage, res: http.ServerResponse, requestUrl: URL) {
  if (!apiKey) return sendJson(res, 500, { error: "Missing VITE_API_FOOTBALL_KEY" });
  const upstreamUrl = `${apiBase}${requestUrl.pathname.replace(/^\/api\/football/, "")}${requestUrl.search}`;
  const upstream = await fetch(upstreamUrl, {
    headers: { "x-apisports-key": apiKey },
  });
  const body = await upstream.text();
  res.statusCode = upstream.status;
  res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

async function handleApiNews(req: http.IncomingMessage, res: http.ServerResponse) {
  const mockReq = { method: req.method };
  return newsHandler(mockReq, res);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (pathname.startsWith("/api/news")) {
    await handleApiNews(req, res);
    return;
  }

  if (pathname.startsWith("/api/football")) {
    try {
      await proxyFootball(req, res, requestUrl);
    } catch (error) {
      sendJson(res, 502, { error: "Football proxy failed", detail: String(error) });
    }
    return;
  }

  const publicFile = path.join(distDir, pathname === "/" ? "index.html" : pathname.replace(/^\/+/, ""));
  if (existsSync(publicFile) && !pathname.endsWith("/")) {
    sendFile(res, publicFile);
    return;
  }

  const indexHtml = path.join(distDir, "index.html");
  if (existsSync(indexHtml)) {
    sendFile(res, indexHtml);
    return;
  }

  sendJson(res, 404, { error: "Build not found. Run npm run build first." });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`BallMtaani preview server running at http://localhost:${port}/`);
});

