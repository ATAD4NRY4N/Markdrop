import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { loadLocalEnvFiles, repoRoot } from "./loadLocalEnv.mjs";
import { runSupabaseSync } from "./supabase-sync.mjs";

loadLocalEnvFiles();

const runtimeDir = path.join(repoRoot, ".markdrop-local");
const logsDir = path.join(runtimeDir, "logs");
const stateFile = path.join(runtimeDir, "stack-state.json");
const workerHost = process.env.MARKDROP_VIDEO_WORKER_HOST || "127.0.0.1";
const workerPort = process.env.MARKDROP_VIDEO_WORKER_PORT || "43110";
const appUrl = "http://127.0.0.1:3000";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const services = [
  {
    name: "app",
    command: process.platform === "win32" ? "npm run dev" : "npm",
    args: process.platform === "win32" ? [] : ["run", "dev"],
    shell: process.platform === "win32",
    url: appUrl,
  },
  {
    name: "worker",
    command: process.platform === "win32" ? "npm run video:worker" : "npm",
    args: process.platform === "win32" ? [] : ["run", "video:worker"],
    shell: process.platform === "win32",
    url: `http://${workerHost}:${workerPort}`,
  },
];

function ensureRuntimeDir() {
  mkdirSync(logsDir, { recursive: true });
}

function readState() {
  if (!existsSync(stateFile)) return null;

  try {
    return JSON.parse(readFileSync(stateFile, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  ensureRuntimeDir();
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function clearState() {
  rmSync(stateFile, { force: true });
}

function isProcessRunning(pid) {
  if (!pid) return false;

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function getServiceStatus(service) {
  return isProcessRunning(service.pid) ? "running" : "stopped";
}

function killService(pid) {
  if (!pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      shell: false,
    });
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Ignore missing processes during cleanup.
    }
  }
}

function printStatus(state) {
  console.log("[local-stack] Markdrop local stack status:");

  for (const service of state.services) {
    const status = getServiceStatus(service);
    console.log(
      `[local-stack] ${service.name}: ${status} (pid ${service.pid}) ${service.url} log=${path.relative(repoRoot, service.logFile)}`
    );
  }
}

async function startStack() {
  const existingState = readState();
  if (existingState) {
    const hasRunningService = existingState.services.some((service) => isProcessRunning(service.pid));
    if (hasRunningService) {
      console.log("[local-stack] The local stack is already running.");
      printStatus(existingState);
      return;
    }

    clearState();
  }

  const syncResult = await runSupabaseSync();
  if (syncResult.status === "failed") {
    console.error("[local-stack] Supabase migration sync failed. Stack startup aborted.");
    process.exit(syncResult.code || 1);
  }

  ensureRuntimeDir();

  const state = {
    startedAt: new Date().toISOString(),
    services: [],
  };

  for (const service of services) {
    const logFile = path.join(logsDir, `${service.name}.log`);
    appendFileSync(logFile, `\n[${new Date().toISOString()}] Starting ${service.name}\n`);
    const logFd = openSync(logFile, "a");
    const child = spawn(service.command, service.args, {
      cwd: repoRoot,
      env: process.env,
      shell: service.shell,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", logFd, logFd],
    });

    closeSync(logFd);
    child.unref();

    state.services.push({
      name: service.name,
      pid: child.pid,
      url: service.url,
      logFile,
    });
  }

  writeState(state);
  await sleep(1200);

  const failedServices = state.services.filter((service) => !isProcessRunning(service.pid));
  if (failedServices.length) {
    console.error("[local-stack] One or more services exited during startup.");
    for (const service of state.services) {
      if (isProcessRunning(service.pid)) {
        killService(service.pid);
      }
    }
    clearState();
    printStatus(state);
    process.exit(1);
  }

  console.log("[local-stack] Markdrop local stack started.");
  printStatus(state);
  console.log(`[local-stack] Logs directory: ${path.relative(repoRoot, logsDir)}`);
}

function stopStack() {
  const state = readState();
  if (!state) {
    console.log("[local-stack] No local stack state file was found.");
    return;
  }

  for (const service of state.services) {
    killService(service.pid);
  }

  clearState();
  console.log("[local-stack] Markdrop local stack stopped.");
}

function showStatus() {
  const state = readState();
  if (!state) {
    console.log("[local-stack] Markdrop local stack is not running.");
    return;
  }

  printStatus(state);
}

const command = process.argv[2] || "status";

switch (command) {
  case "up":
    await startStack();
    break;
  case "down":
    stopStack();
    break;
  case "status":
    showStatus();
    break;
  default:
    console.error(`[local-stack] Unknown command: ${command}`);
    process.exit(1);
}