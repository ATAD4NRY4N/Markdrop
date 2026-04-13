import { getWorkerConfig } from "./config.mjs";
import { createDoctorReport } from "./health.mjs";

const config = getWorkerConfig();
const report = await createDoctorReport(config);

console.log(JSON.stringify(report, null, 2));

if (!report.summary.ready) {
  process.exitCode = 1;
}