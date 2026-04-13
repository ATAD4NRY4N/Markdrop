import { loadLocalEnvFiles } from "./loadLocalEnv.mjs";

loadLocalEnvFiles();
await import("../worker/doctor.mjs");