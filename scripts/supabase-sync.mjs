import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { loadLocalEnvFiles, repoRoot } from "./loadLocalEnv.mjs";

loadLocalEnvFiles();

const migrationsDir = path.join(repoRoot, "supabase", "migrations");
const supabaseConfigPath = path.join(repoRoot, "supabase", "config.toml");
const truthyValues = new Set(["1", "true", "yes", "on"]);
const unlinkedProjectPatterns = [/cannot find project ref/i, /run supabase link/i];
const unauthenticatedPatterns = [
  /access token not provided/i,
  /authentication failed/i,
  /you need to be logged in/i,
  /run supabase login/i,
];

const isTruthy = (value) => truthyValues.has(String(value || "").trim().toLowerCase());

const getDbUrl = () => process.env.MARKDROP_SUPABASE_DB_URL || process.env.SUPABASE_DB_URL || "";

const resolveSupabaseCommand = () => {
  const customBinary = process.env.MARKDROP_SUPABASE_BIN?.trim();
  if (customBinary) {
    return {
      command: customBinary,
      args: [],
      shell: false,
    };
  }

  return {
    command: "npx",
    args: ["--yes", "supabase"],
    shell: process.platform === "win32",
  };
};

const runSupabaseCli = ({ cliArgs, stdio = "inherit", captureOutput = false } = {}) => {
  const command = resolveSupabaseCommand();
  const commandString = [command.command, ...command.args, ...cliArgs].join(" ");
  const childCommand = command.shell ? commandString : command.command;
  const childArgs = command.shell ? [] : [...command.args, ...cliArgs];

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    const child = spawn(childCommand, childArgs, {
      cwd: repoRoot,
      env: process.env,
      stdio: captureOutput ? ["ignore", "pipe", "pipe"] : stdio,
      shell: command.shell,
    });

    if (captureOutput) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", (error) => {
      resolve({
        code: 1,
        error,
        stdout,
        stderr,
      });
    });

    child.on("exit", (code, signal) => {
      resolve({
        code: signal ? 1 : code || 0,
        signal,
        stdout,
        stderr,
      });
    });
  });
};

const getCombinedOutput = (result) => `${result.stdout || ""}\n${result.stderr || ""}`.trim();

async function verifyLinkedProject() {
  const result = await runSupabaseCli({
    cliArgs: ["migration", "list"],
    captureOutput: true,
  });

  if ((result.code || 0) === 0) {
    return {
      status: "ok",
    };
  }

  const output = getCombinedOutput(result);

  if (unlinkedProjectPatterns.some((pattern) => pattern.test(output))) {
    return {
      status: "skipped",
      reason:
        "Skipping automatic Supabase migration sync because this repo is not linked to a hosted Supabase project yet. Run `npm run supabase:login` and `npm run supabase:link -- --project-ref <project-ref>` once on this machine.",
      code: 0,
    };
  }

  if (unauthenticatedPatterns.some((pattern) => pattern.test(output))) {
    return {
      status: "skipped",
      reason:
        "Skipping automatic Supabase migration sync because the Supabase CLI is not authenticated on this machine yet. Run `npm run supabase:login`, then retry.",
      code: 0,
    };
  }

  return {
    status: "failed",
    reason: output || `exit code ${result.code || 1}`,
    code: result.code || 1,
  };
}

export function getSupabaseSyncPlan() {
  if (isTruthy(process.env.MARKDROP_SKIP_SUPABASE_SYNC)) {
    return {
      status: "skipped",
      reason: "Skipping Supabase migration sync because MARKDROP_SKIP_SUPABASE_SYNC is enabled.",
    };
  }

  if (!existsSync(migrationsDir)) {
    return {
      status: "skipped",
      reason: "Skipping Supabase migration sync because no supabase/migrations directory was found.",
    };
  }

  const command = resolveSupabaseCommand();
  const dbUrl = getDbUrl();

  if (dbUrl) {
    return {
      status: "ready",
      mode: "db-url",
      reason: "Syncing Supabase migrations with MARKDROP_SUPABASE_DB_URL.",
      cliArgs: ["db", "push", "--db-url", dbUrl],
    };
  }

  if (existsSync(supabaseConfigPath)) {
    return {
      status: "ready",
      mode: "linked",
      reason: "Syncing Supabase migrations with the linked Supabase project from supabase/config.toml.",
      cliArgs: ["db", "push", "--linked"],
    };
  }

  return {
    status: "skipped",
    reason:
      "Skipping Supabase migration sync because neither MARKDROP_SUPABASE_DB_URL nor supabase/config.toml is configured.",
  };
}

export async function runSupabaseSync({
  log = console.log,
  errorLog = console.error,
  stdio = "inherit",
} = {}) {
  const plan = getSupabaseSyncPlan();

  if (plan.status !== "ready") {
    log(`[supabase-sync] ${plan.reason}`);
    return {
      status: "skipped",
      reason: plan.reason,
      code: 0,
    };
  }

  if (plan.mode === "linked") {
    const linkedProject = await verifyLinkedProject();
    if (linkedProject.status === "skipped") {
      log(`[supabase-sync] ${linkedProject.reason}`);
      return {
        status: "skipped",
        reason: linkedProject.reason,
        code: 0,
      };
    }

    if (linkedProject.status === "failed") {
      errorLog(`[supabase-sync] ${linkedProject.reason}`);
      return {
        status: "failed",
        reason: linkedProject.reason,
        code: linkedProject.code || 1,
      };
    }
  }

  log(`[supabase-sync] ${plan.reason}`);

  const result = await runSupabaseCli({
    cliArgs: plan.cliArgs,
    stdio,
  });

  if (result.error) {
    errorLog(`[supabase-sync] Failed to start Supabase CLI: ${result.error.message}`);
    return {
      status: "failed",
      reason: result.error.message,
      code: 1,
    };
  }

  if (result.signal) {
    errorLog(`[supabase-sync] Supabase sync stopped because of signal ${result.signal}.`);
    return {
      status: "failed",
      reason: result.signal,
      code: 1,
    };
  }

  if ((result.code || 0) !== 0) {
    errorLog(`[supabase-sync] Supabase sync exited with code ${result.code}.`);
    return {
      status: "failed",
      reason: `exit code ${result.code}`,
      code: result.code || 1,
    };
  }

  log("[supabase-sync] Supabase migrations are up to date.");
  return {
    status: "ok",
    code: 0,
  };
}

const isMainModule = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMainModule) {
  const result = await runSupabaseSync();
  process.exit(result.code || 0);
}