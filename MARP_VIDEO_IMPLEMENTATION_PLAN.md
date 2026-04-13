# MARP Narrated Video Implementation Plan

This file tracks the Windows/Linux narrated video pipeline work for Markdrop/CourseForge.

## Scope Decisions

- Delivery model: local sidecar worker inside this repo.
- Platforms: Windows and Linux only.
- Phase 1 shipping target: Marp slides to narrated MP4.
- Current implementation slice: shared data model, authoring UI, worker scaffold, artifact preparation, and builder integration.
- TTS provider: KugelAudio Open.
- Local LLM integration: Ollama on localhost for transcript cleanup and segmentation assistance only.
- Subtitle strategy: timing-derived subtitles from source transcript plus measured audio duration.
- Non-goals for this first slice: macOS support, Deepgram, ElevenLabs, cloud rendering, browser-only ffmpeg, true STT.

## Current Status

### Completed in this repo

- [x] Added a `marp-voiceover` metadata block stored in existing `blocks_json`.
- [x] Added a dedicated authoring UI for slide voiceovers, segment overrides, pause metadata, KugelAudio settings, and Ollama cleanup toggles.
- [x] Added shared pure Marp and narration helpers for pause parsing, slide grouping, transcript manifest generation, and Marp markdown serialization.
- [x] Updated the Marp preview and Marp markdown export path to understand the new voiceover metadata.
- [x] Added a local worker scaffold with `GET /health`, `GET /doctor`, `POST /jobs`, `GET /jobs/:id`, and artifact download endpoints.
- [x] Added dependency doctor checks for `ffmpeg`, `ffprobe`, `marp`, `python`, `uv`, and `ollama`.
- [x] Added a builder dialog that talks to the local worker and prepares narrated render jobs for the current module.
- [x] Added npm scripts for the worker and doctor checks.
- [x] Added unit tests for the shared narration utilities.

### In progress

- [-] The worker currently materializes normalized job artifacts (`presentation.md`, `transcript.json`, `request.json`, `job.json`) but does not yet synthesize audio or compose MP4 output.

### Next major milestone

- [ ] Implement Marp PNG rendering, KugelAudio synthesis, duration measurement, and ffmpeg clip composition so the prepared worker jobs become final narrated MP4 exports.

## Detailed Action Plan

### Phase 0: lock boundaries

- [x] Keep the existing Vite app as the controller UI only.
- [x] Keep the narrated video flow local-only instead of forcing it through Vercel.
- [x] Treat Ollama as local LLM assistance only, not STT.
- [x] Keep transcript timing derived from source narration rather than audio transcription.

### Phase 1: authoring data model

- [x] Add `marp-voiceover` as a new metadata-only MARP block type.
- [x] Persist narration inside `blocks_json` rather than adding a new database table.
- [x] Keep voiceover blocks slide-scoped by leaving them in the normal block order.
- [x] Support raw script authoring with `[PAUSE:ms]` directives.
- [x] Support structured segment overrides with per-segment pause values.
- [x] Store provider, voice, model, language, subtitle mode, and Ollama flags on the block.
- [x] Keep the schema future-safe for multi-language expansion.
- [x] Detect duplicate voiceover blocks per slide and emit warnings in the normalized manifest.

### Phase 2: editor integration

- [x] Add the voiceover block to the sidebar MARP section.
- [x] Add the dedicated `MarpVoiceoverBlock` editor component.
- [x] Wire the new block into the generic block renderer.
- [x] Keep voiceover metadata out of the visible slide preview content.
- [ ] Add slide-level narration indicators to the structure panel.
- [ ] Add bulk slide narration editing across modules.

### Phase 3: shared Marp helpers

- [x] Centralize pause parsing, script normalization, and segment stringification.
- [x] Centralize slide splitting for preview, export, tests, and worker use.
- [x] Centralize transcript manifest generation.
- [x] Serialize voiceover metadata into HTML comments inside exported Marp markdown.
- [x] Keep non-rendered metadata blocks out of the visible slide markdown.
- [ ] Extract any remaining duplicated Marp utility logic from legacy paths.

### Phase 4: local worker scaffold

- [x] Add a dedicated `worker/` area in the repo.
- [x] Add environment-driven worker configuration and path overrides.
- [x] Add dependency probing for core binaries and Ollama connectivity.
- [x] Add in-memory job orchestration and artifact download routes.
- [x] Add artifact preparation that writes normalized job assets to `.markdrop-video-worker`.
- [ ] Add persistent job storage beyond in-memory process state.
- [ ] Add job cancelation and cleanup endpoints.
- [ ] Add structured worker logs per job.

### Phase 5: audio and video pipeline

- [ ] Add Marp CLI PNG export for each slide.
- [ ] Add a KugelAudio adapter script and worker-side invocation contract.
- [ ] Normalize generated audio into the ffmpeg pipeline format.
- [ ] Measure actual audio durations with `ffprobe`.
- [ ] Create an audio manifest with per-slide durations.
- [ ] Loop each slide PNG into a timed clip with the matching narration track.
- [ ] Concatenate per-slide clips into a final H.264/AAC MP4.
- [ ] Return the MP4 as a downloadable artifact from the worker.
- [ ] Add worker error handling for ffmpeg, Marp CLI, and TTS failures.

### Phase 6: frontend export flow

- [x] Add a builder dialog that talks to the local worker.
- [x] Show worker health and dependency doctor results in the dialog.
- [x] Allow the user to submit a narrated render preparation job from the current module.
- [x] Poll job status and expose artifact downloads.
- [ ] Switch the dialog from artifact-preparation language to full MP4-export language once video composition is live.
- [ ] Add resolution, FPS, output directory, overwrite behavior, and per-run subtitle options.
- [ ] Offer a clear fallback path to the legacy browser recorder if needed.

### Phase 7: subtitles

- [ ] Generate SRT from the normalized transcript manifest plus measured durations.
- [ ] Generate VTT from the same timing data.
- [ ] Add subtitle artifacts to the worker job output.
- [ ] Expose subtitle downloads in the builder dialog.
- [ ] Optionally support burned-in subtitles in a later ffmpeg phase.

### Phase 8: developer ergonomics

- [x] Add `npm run video:worker`.
- [x] Add `npm run video:doctor`.
- [x] Add worker-related environment variables to `.env.example`.
- [ ] Add a helper script that boots the app and worker together for local development.
- [ ] Add Windows and Linux setup notes for KugelAudio installation and model download.
- [ ] Add a documented fallback when Ollama is unavailable.

### Phase 9: testing

- [x] Add unit tests for shared Marp narration helpers.
- [ ] Add worker unit tests for job creation and doctor report generation.
- [ ] Add fixture-based integration tests for artifact preparation.
- [ ] Add mocked ffmpeg and KugelAudio orchestration tests.
- [ ] Add end-to-end smoke coverage for MP4 output once video composition lands.

### Phase 10: documentation

- [x] Persist this detailed plan in the repo.
- [x] Add a README pointer to the narrated video beta path.
- [ ] Add a dedicated worker usage guide with setup steps and troubleshooting.
- [ ] Document KugelAudio expectations and likely hardware constraints.
- [ ] Document the difference between transcript-derived subtitles and future STT support.

### Phase 11: future parity work

- [ ] Multi-language transcript import/export.
- [ ] Per-language voice configuration.
- [ ] TTS audio caching keyed by normalized text and voice settings.
- [ ] Individual slide MP4 output for Udemy-style workflows.
- [ ] Optional transitions between slides.
- [ ] Browser demo recording with narrated automation.
- [ ] Windows and Linux hardware acceleration options.

## Files Touched So Far

- `src/lib/marp.js`
- `src/lib/exportUtils.js`
- `src/components/blocks/BuilderPage/MarpPreview.jsx`
- `src/components/blocks/BuilderPage/blocks/MarpVoiceoverBlock.jsx`
- `src/components/blocks/BuilderPage/MarkdownBlock.jsx`
- `src/components/blocks/BuilderPage/AppSidebar.jsx`
- `src/components/blocks/CourseBuilderPage/NarratedVideoExportDialog.jsx`
- `src/lib/narratedVideoWorker.js`
- `src/pages/CourseBuilder.jsx`
- `worker/config.mjs`
- `worker/health.mjs`
- `worker/jobs.mjs`
- `worker/server.mjs`
- `worker/doctor.mjs`
- `.env.example`
- `package.json`
- `src/lib/__tests__/marp.test.js`

## Verification Performed

- [x] Unit tests for shared Marp narration helpers passed.
- [x] The worker boots successfully on `http://127.0.0.1:43110`.
- [x] `GET /health` returns the expected service metadata.
- [x] `GET /doctor` returns valid dependency results and reports this machine as ready.
- [x] A smoke `POST /jobs` request completed and wrote normalized artifacts under `.markdrop-video-worker`.
- [x] The frontend production build completed successfully.

## Current Run Commands

```bash
npm run video:worker
npm run video:doctor
npm run test -- src/lib/__tests__/marp.test.js
```