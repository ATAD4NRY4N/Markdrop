import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";

const LOOKUP_COMMAND = process.platform === "win32" ? "where" : "which";

const isExplicitPath = (command) => path.isAbsolute(command) || /[\\/]/.test(command);

const runLookup = (command, args) =>
  new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (error) => {
      resolve({ ok: false, stdout, stderr: stderr || error.message });
    });

    proc.on("close", (code) => {
      resolve({ ok: code === 0, stdout, stderr, code });
    });
  });

async function resolveCommand(command) {
  if (!command) {
    return { available: false, resolvedPath: null, error: "No command configured" };
  }

  if (isExplicitPath(command)) {
    try {
      await access(command, constants.F_OK);
      return { available: true, resolvedPath: command, error: null };
    } catch (error) {
      return { available: false, resolvedPath: null, error: error.message };
    }
  }

  const result = await runLookup(LOOKUP_COMMAND, [command]);
  if (!result.ok) {
    return {
      available: false,
      resolvedPath: null,
      error: result.stderr?.trim() || `${command} not found`,
    };
  }

  const resolvedPath = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return {
    available: !!resolvedPath,
    resolvedPath: resolvedPath || null,
    error: resolvedPath ? null : `${command} not found`,
  };
}

async function checkBinary(name, command, required = true) {
  const result = await resolveCommand(command);
  return {
    name,
    command,
    required,
    available: result.available,
    resolvedPath: result.resolvedPath,
    error: result.error,
  };
}

async function checkOllama(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    return {
      name: "ollama",
      command: `${baseUrl}/api/tags`,
      required: false,
      available: response.ok,
      resolvedPath: baseUrl,
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      name: "ollama",
      command: `${baseUrl}/api/tags`,
      required: false,
      available: false,
      resolvedPath: baseUrl,
      status: null,
      error: error.message,
    };
  }
}

export async function createDoctorReport(config) {
  const checks = await Promise.all([
    checkBinary("ffmpeg", config.binaries.ffmpeg),
    checkBinary("ffprobe", config.binaries.ffprobe),
    checkBinary("marp", config.binaries.marp),
    checkBinary("python", config.binaries.python),
    checkBinary("uv", config.binaries.uv),
    checkOllama(config.ollamaBaseUrl),
  ]);

  const dependencies = Object.fromEntries(checks.map((check) => [check.name, check]));
  const missingRequired = checks.filter((check) => check.required && !check.available).map((check) => check.name);

  return {
    generatedAt: new Date().toISOString(),
    service: "markdrop-video-worker",
    config: {
      baseUrl: config.baseUrl,
      workDir: config.workDir,
      features: config.features,
    },
    dependencies,
    summary: {
      ready: missingRequired.length === 0,
      missingRequired,
      ollamaAvailable: !!dependencies.ollama?.available,
    },
  };
}