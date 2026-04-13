import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toPort = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const repoRoot = path.resolve(__dirname, "..");

export function getWorkerConfig() {
  const host = process.env.MARKDROP_VIDEO_WORKER_HOST || "127.0.0.1";
  const port = toPort(process.env.MARKDROP_VIDEO_WORKER_PORT, 43110);
  const workDir = path.resolve(
    process.env.MARKDROP_VIDEO_WORKDIR || path.join(repoRoot, ".markdrop-video-worker")
  );

  return {
    host,
    port,
    baseUrl: `http://${host}:${port}`,
    workDir,
    ollamaBaseUrl: (process.env.MARKDROP_OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, ""),
    binaries: {
      ffmpeg: process.env.MARKDROP_FFMPEG_BIN || "ffmpeg",
      ffprobe: process.env.MARKDROP_FFPROBE_BIN || "ffprobe",
      marp: process.env.MARKDROP_MARP_BIN || "marp",
      python: process.env.MARKDROP_PYTHON_BIN || "python",
      uv: process.env.MARKDROP_UV_BIN || "uv",
    },
    features: {
      artifactPreparation: true,
      finalVideo: false,
      subtitles: false,
    },
  };
}