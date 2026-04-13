import { createServer } from "node:http";
import { getWorkerConfig } from "./config.mjs";
import { createDoctorReport } from "./health.mjs";
import { createPreparationJob, getJob, readJobArtifact } from "./jobs.mjs";

const config = getWorkerConfig();

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
};

const sendFile = (res, statusCode, contentType, content) => {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": contentType,
  });
  res.end(content);
};

const readJsonBody = async (req) => {
  let buffer = "";
  for await (const chunk of req) {
    buffer += chunk.toString();
  }
  return buffer ? JSON.parse(buffer) : {};
};

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", config.baseUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      json(res, 200, {
        status: "ok",
        service: "markdrop-video-worker",
        features: config.features,
        baseUrl: config.baseUrl,
        workDir: config.workDir,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/doctor") {
      json(res, 200, await createDoctorReport(config));
      return;
    }

    if (req.method === "POST" && url.pathname === "/jobs") {
      const payload = await readJsonBody(req);
      const job = createPreparationJob(payload, config);
      json(res, 202, job);
      return;
    }

    if (req.method === "GET" && parts[0] === "jobs" && parts.length === 2) {
      const job = getJob(parts[1]);
      if (!job) {
        json(res, 404, { error: "Job not found" });
        return;
      }
      json(res, 200, job);
      return;
    }

    if (req.method === "GET" && parts[0] === "jobs" && parts[2] === "artifacts" && parts.length === 4) {
      const artifactResult = await readJobArtifact(parts[1], parts[3]);
      if (!artifactResult) {
        json(res, 404, { error: "Artifact not found" });
        return;
      }
      sendFile(res, 200, artifactResult.artifact.contentType, artifactResult.content);
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    json(res, 500, { error: error.message || "Unexpected worker error" });
  }
}).listen(config.port, config.host, () => {
  console.log(`markdrop-video-worker listening on ${config.baseUrl}`);
});