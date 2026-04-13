import { spawn } from "node:child_process";
import readline from "node:readline";
import { loadLocalEnvFiles, repoRoot } from "./loadLocalEnv.mjs";
import { runSupabaseSync } from "./supabase-sync.mjs";

loadLocalEnvFiles();

const supabaseSync = await runSupabaseSync();
if (supabaseSync.status === "failed") {
  console.error("[local-watch] Supabase migration sync failed. Startup aborted.");
  process.exit(supabaseSync.code || 1);
}

const npmCommand = process.platform === "win32" ? "npm" : "npm";
const colors = {
  app: "\x1b[36m",
  worker: "\x1b[35m",
  reset: "\x1b[0m",
};

const appUrl = "http://127.0.0.1:3000";
const workerHost = process.env.MARKDROP_VIDEO_WORKER_HOST || "127.0.0.1";
const workerPort = process.env.MARKDROP_VIDEO_WORKER_PORT || "43110";

const services = [
  {
    name: "app",
    label: "app",
    command: npmCommand,
    args: ["run", "dev"],
  },
  {
    name: "worker",
    label: "worker",
    command: npmCommand,
    args: ["run", "video:worker"],
  },
];

let shuttingDown = false;
let exitCode = 0;

const printLine = (name, line, isError = false) => {
  const color = colors[name] || "";
  const prefix = `${color}[${name}]${colors.reset}`;
  const output = `${prefix} ${line}`;
  if (isError) {
    console.error(output);
    return;
  }
  console.log(output);
};

const wireOutput = (child, name) => {
  const stdout = readline.createInterface({ input: child.stdout });
  const stderr = readline.createInterface({ input: child.stderr });

  stdout.on("line", (line) => printLine(name, line));
  stderr.on("line", (line) => printLine(name, line, true));
};

const children = services.map((service) => {
  const child = spawn(
    process.platform === "win32"
      ? `${service.command} ${service.args.join(" ")}`
      : service.command,
    process.platform === "win32" ? [] : service.args,
    {
    cwd: repoRoot,
    env: process.env,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
    }
  );

  wireOutput(child, service.label);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    if (signal) {
      exitCode = exitCode || 1;
      console.error(`[local-watch] ${service.label} stopped because of signal ${signal}.`);
      shutdown();
      return;
    }

    if ((code || 0) !== 0) {
      exitCode = code || 1;
      console.error(`[local-watch] ${service.label} exited with code ${code}.`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 150);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[local-watch] Starting Markdrop local development environment.");
console.log(`[local-watch] App: ${appUrl}`);
console.log(`[local-watch] Narrated video worker: http://${workerHost}:${workerPort}`);
console.log("[local-watch] Press Ctrl+C to stop both processes.");