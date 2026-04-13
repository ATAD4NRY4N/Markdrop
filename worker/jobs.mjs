import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildMarpArtifactBundle } from "../src/lib/marp.js";

const jobs = new Map();

const snapshot = (job) => JSON.parse(JSON.stringify(job));

const setJobState = (job, updates) => {
  Object.assign(job, updates, { updatedAt: new Date().toISOString() });
};

const createArtifactRecord = (jobId, key, label, absolutePath, contentType) => ({
  key,
  label,
  absolutePath,
  contentType,
  downloadPath: `/jobs/${jobId}/artifacts/${key}`,
});

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function runPreparationJob(job, payload, config) {
  setJobState(job, { status: "running", stage: "validating" });

  if (!payload || !Array.isArray(payload.blocks)) {
    throw new Error("Request body must include a blocks array.");
  }

  if (payload.blocks.length === 0) {
    throw new Error("Nothing to export. Add MARP blocks before starting a narrated render job.");
  }

  setJobState(job, { stage: "normalizing" });
  const bundle = buildMarpArtifactBundle(payload.blocks, {
    title: payload.title,
    language: payload.language,
    voice: payload.voice,
    model: payload.model,
  });

  const outputDir = path.join(config.workDir, job.id);
  await mkdir(outputDir, { recursive: true });

  setJobState(job, {
    stage: "materializing",
    outputDir,
    warnings: bundle.warnings,
  });

  const presentationMarkdownPath = path.join(outputDir, "presentation.md");
  const transcriptManifestPath = path.join(outputDir, "transcript.json");
  const narrationSsmlPath = path.join(outputDir, "narration.ssml");
  const backgroundTaskManifestPath = path.join(outputDir, "background-tasks.json");
  const requestPayloadPath = path.join(outputDir, "request.json");

  await Promise.all([
    writeFile(presentationMarkdownPath, bundle.presentationMarkdown, "utf8"),
    writeJson(transcriptManifestPath, bundle.transcriptManifest),
    writeFile(narrationSsmlPath, bundle.narrationSsml || "", "utf8"),
    writeJson(backgroundTaskManifestPath, bundle.backgroundTaskManifest),
    writeJson(requestPayloadPath, payload),
  ]);

  const artifacts = {
    presentationMarkdown: createArtifactRecord(
      job.id,
      "presentationMarkdown",
      "presentation.md",
      presentationMarkdownPath,
      "text/markdown; charset=utf-8"
    ),
    transcriptManifest: createArtifactRecord(
      job.id,
      "transcriptManifest",
      "transcript.json",
      transcriptManifestPath,
      "application/json; charset=utf-8"
    ),
    narrationSsml: createArtifactRecord(
      job.id,
      "narrationSsml",
      "narration.ssml",
      narrationSsmlPath,
      "application/ssml+xml; charset=utf-8"
    ),
    backgroundTasks: createArtifactRecord(
      job.id,
      "backgroundTasks",
      "background-tasks.json",
      backgroundTaskManifestPath,
      "application/json; charset=utf-8"
    ),
    requestPayload: createArtifactRecord(
      job.id,
      "requestPayload",
      "request.json",
      requestPayloadPath,
      "application/json; charset=utf-8"
    ),
  };

  const jobRecordPath = path.join(outputDir, "job.json");
  await writeJson(jobRecordPath, {
    ...snapshot(job),
    stage: "finalizing",
    artifacts,
  });
  artifacts.jobRecord = createArtifactRecord(
    job.id,
    "jobRecord",
    "job.json",
    jobRecordPath,
    "application/json; charset=utf-8"
  );

  setJobState(job, {
    status: "completed",
    stage: "completed",
    artifacts,
  });
}

export function createPreparationJob(payload, config) {
  const job = {
    id: randomUUID(),
    status: "queued",
    stage: "queued",
    title: payload?.title || "Untitled Presentation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    outputDir: null,
    warnings: [],
    error: null,
    artifacts: null,
  };

  jobs.set(job.id, job);

  queueMicrotask(async () => {
    try {
      await runPreparationJob(job, payload, config);
    } catch (error) {
      setJobState(job, {
        status: "failed",
        stage: "failed",
        error: error.message,
      });
    }
  });

  return snapshot(job);
}

export function getJob(jobId) {
  const job = jobs.get(jobId);
  return job ? snapshot(job) : null;
}

export async function readJobArtifact(jobId, artifactKey) {
  const job = jobs.get(jobId);
  if (!job?.artifacts?.[artifactKey]) return null;

  const artifact = job.artifacts[artifactKey];
  const content = await readFile(artifact.absolutePath);
  return {
    artifact,
    content,
  };
}