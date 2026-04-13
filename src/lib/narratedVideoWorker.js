const WORKER_BASE_URL = (
  import.meta.env.VITE_MARP_VIDEO_WORKER_URL || "http://127.0.0.1:43110"
).replace(/\/$/, "");

async function workerRequest(path, options = {}) {
  const response = await fetch(`${WORKER_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error || payload?.message || `Worker request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export const getNarratedVideoWorkerBaseUrl = () => WORKER_BASE_URL;

export const getNarratedVideoWorkerHealth = () => workerRequest("/health");

export const getNarratedVideoWorkerDoctor = () => workerRequest("/doctor");

export const createNarratedVideoJob = (payload) =>
  workerRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getNarratedVideoJob = (jobId) => workerRequest(`/jobs/${jobId}`);

export const getNarratedVideoArtifactUrl = (jobId, artifactKey) =>
  `${WORKER_BASE_URL}/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(artifactKey)}`;