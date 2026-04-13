<p align="center">
  <img width="300" height="177" alt="markdrop_repo" src="https://github.com/user-attachments/assets/c8b043ef-c392-4b4c-bd21-65bcc30b7c77" />
</p>

<p align="center">
  <strong>Free Online Markdown Editor | Visual Markdown Creator</strong>
</p>

<p align="center">
  The best free online markdown editor with drag-and-drop visual editing, real-time preview, cloud sync, and offline support. Create professional README files, documentation, and markdown content with our intuitive visual markdown generator.
</p>

<p align="center">
  <a href="https://markdrop.vercel.app/">Website</a> •
  <a href=".github/CONTRIBUTING.md">Contributing</a> •
  <a href=".github/CODE_OF_CONDUCT.md">Code of Conduct</a> •
  <a href=".github/PRIVACY_POLICY.md">Privacy Policy</a> •
  <a href=".github/TERMS_OF_SERVICES.md">Terms of Services</a> •
  <a href="LICENSE">License</a>
</p>

## Demo

[Markdrop - A powerful visual markdown editor and builder](https://github.com/user-attachments/assets/e6fcee29-72bd-4e07-818a-dcfd8b7d44dd)

## Features - Best Markdown Editor Online

## Narrated Video Beta

- A local Windows/Linux narrated video worker is now scaffolded in this repo.
- Start the full local stack with `./start-local.ps1` on Windows or `bash ./start-local.sh` on Linux.
- `npm run local:start` now starts the app and worker in the background, and also runs the Supabase migration sync step when it is configured.
- Use `npm run local:stop` or the matching stop script to shut the local stack down cleanly.
- Use `npm run local:watch` if you want both services attached to one terminal with live logs.
- Check the local toolchain with `npm run video:doctor`.
- The current implementation prepares normalized `presentation.md` and `transcript.json` job artifacts from MARP slides and the new `marp-voiceover` block.
- Detailed status and the remaining implementation plan live in [MARP_VIDEO_IMPLEMENTATION_PLAN.md](MARP_VIDEO_IMPLEMENTATION_PLAN.md).

### Forgetful Local Startup

If you do not want to remember the command sequence, use this routine.

1. Install dependencies once:

```bash
npm install
```

2. Optional: create a local override file if you want custom ports, binary paths, or automatic Supabase migration sync.

Use `.env.local` for your machine-specific settings. The startup scripts now load `.env` and `.env.local` automatically.

If you want startup to push the SQL migrations automatically, use one of these two options:

- Preferred: link this repo to your hosted Supabase project once with `npm run supabase:login` and `npm run supabase:link -- --project-ref YOUR_PROJECT_REF`.
- Fallback: set `MARKDROP_SUPABASE_DB_URL` in `.env.local`.

If neither is configured, or the repo has not been linked yet, startup will warn and skip the sync step instead of aborting the app and worker.

3. Optional but recommended: verify the linked Supabase CLI workflow once per machine.

```bash
npm run supabase:login
npm run supabase:link -- --project-ref YOUR_PROJECT_REF
npm run supabase:migration:list
```

The repo already includes `supabase/config.toml`, so you normally do not need to rerun `npm run supabase:init` unless that file is removed.

4. Verify the narrated-video toolchain:

```bash
npm run video:doctor
```

5. Start the full local stack.

Windows:

```powershell
./start-local.ps1
```

Linux:

```bash
bash ./start-local.sh
```

Equivalent npm command:

```bash
npm run local:start
```

6. Stop the full local stack.

Windows:

```powershell
./stop-local.ps1
```

Linux:

```bash
bash ./stop-local.sh
```

Equivalent npm command:

```bash
npm run local:stop
```

If you want both services attached to your current terminal instead, use `npm run local:watch` and stop it with `Ctrl+C`.

Default local URLs after startup:

- App: `http://localhost:3000`
- Worker: `http://127.0.0.1:43110`

What the startup scripts do:

- Run Supabase migration sync if `MARKDROP_SUPABASE_DB_URL` is set, or if the repo is linked with `supabase link`.
- Starts the Vite app.
- Starts the narrated-video worker.
- Writes a local state file and service logs under `.markdrop-local/`.
- Lets you stop everything later with the matching shutdown script.

### Local Commands

| Command | What it does |
| --- | --- |
| `npm run local:start` | Runs Supabase sync when configured, then starts the Vite app and narrated-video worker in the background |
| `npm run local:stop` | Stops the background app and narrated-video worker started by `local:start` |
| `npm run local:status` | Shows whether the background app and narrated-video worker are running |
| `npm run local:watch` | Runs Supabase sync when configured, then starts the Vite app and worker attached to one terminal |
| `npm run dev` | Starts only the Vite app |
| `npm run supabase:init` | Creates `supabase/config.toml` if you ever need to reinitialize the Supabase CLI project files |
| `npm run supabase:login` | Authenticates the Supabase CLI on your machine |
| `npm run supabase:link -- --project-ref YOUR_PROJECT_REF` | Links this repo to a hosted Supabase project |
| `npm run supabase:migration:list` | Shows local versus remote migration history for the linked Supabase project |
| `npm run supabase:sync` | Pushes `supabase/migrations/*.sql` using `MARKDROP_SUPABASE_DB_URL` or the linked Supabase project |
| `npm run video:worker` | Starts only the narrated-video worker |
| `npm run video:doctor` | Checks `ffmpeg`, `ffprobe`, `marp`, `python`, `uv`, and `ollama` |
| `npm run build` | Builds the frontend production bundle |
| `npm run test -- src/lib/__tests__/marp.test.js` | Runs the narrated-video utility tests |

### Example `.env.local`

```bash
VITE_MARP_VIDEO_WORKER_URL=http://127.0.0.1:43110
MARKDROP_SUPABASE_DB_URL=postgresql://postgres:password@db.example.supabase.co:5432/postgres
MARKDROP_VIDEO_WORKER_PORT=43110
MARKDROP_VIDEO_WORKDIR=.markdrop-video-worker
MARKDROP_OLLAMA_BASE_URL=http://127.0.0.1:11434
MARKDROP_FFMPEG_BIN=ffmpeg
MARKDROP_FFPROBE_BIN=ffprobe
MARKDROP_MARP_BIN=marp
MARKDROP_PYTHON_BIN=python
MARKDROP_UV_BIN=uv
```

### Daily Workflow

1. Run `npm run video:doctor` if you changed local tools, Python, ffmpeg, Marp CLI, or Ollama.
2. Run `./start-local.ps1` on Windows or `bash ./start-local.sh` on Linux.
3. Open the builder and use the `Narrated Video` button.
4. Run `./stop-local.ps1` or `bash ./stop-local.sh` when you are done.
5. If the worker dialog reports offline status, run `npm run local:status`, check `.markdrop-local/logs/`, and rerun the doctor output.

### Wrapper Scripts

- Windows start: `./start-local.ps1`
- Windows stop: `./stop-local.ps1`
- Linux start: `bash ./start-local.sh`
- Linux stop: `bash ./stop-local.sh`

### Visual Markdown Editor

- **Drag & Drop Markdown Builder** - Intuitive visual markdown editor with drag-and-drop block reordering
- **Real-Time Markdown Preview** - Live markdown preview with instant rendering alongside your editor
- **Multiple Editing Modes** - Switch between Visual Editor, Raw Markdown, and Live Preview modes

### Complete Markdown Content Creation

- **Markdown Headings Generator** - H1-H6 headers with SEO-friendly formatting
- **Rich Text Markdown** - Paragraphs, blockquotes, bold, italic, and formatted text blocks
- **Markdown Lists Creator** - Bullet lists, numbered lists, and interactive task lists with checkboxes
- **Code Syntax Highlighting** - Multi-language code blocks with syntax highlighting for developers
- **Markdown Media Embedding** - Images, videos, and hyperlinks with alignment options
- **Markdown Table Generator** - Professional tables with full editing and formatting capabilities
- **Advanced Markdown Elements** - GitHub badges, skill icons, HTML blocks, and dividers

### Cloud-Based Markdown Workspace

- **Secure User Authentication** - Protected login system for personal markdown workspace
- **Cloud Markdown Storage** - Auto-sync markdown files across all devices with cloud backup
- **Mobile-Responsive Markdown Editor** - Optimized for desktop, tablet, and mobile markdown editing
- **PWA Markdown App** - Install as native app on any device for offline markdown editing
- **Offline Markdown Editor** - Continue creating markdown content without internet connection

### Professional Markdown Tools

- **Markdown Import/Export** - Import .md files and export to PDF, HTML, and markdown formats
- **Markdown History Management** - Full undo/redo with keyboard shortcuts for efficient editing
- **Auto-Save Markdown** - Automatic saving to local storage and cloud backup
- **Markdown Analytics** - Real-time word count, character count, and reading time for content optimization
- **Quick Markdown Reset** - Instant workspace reset to start new markdown projects

## Modern Web Technologies - React Markdown Editor

| Category                | Technologies     |
| ----------------------- | ---------------- |
| **Frontend Framework**  | React 18         |
| **Build Tool**          | Vite             |
| **UI Components**       | Shadcn/UI        |
| **Styling**             | Tailwind CSS     |
| **Drag & Drop**         | @dnd-kit         |
| **Markdown Processing** | Remark, Rehype   |
| **Code Highlighting**   | Prism.js / Shiki |
| **Database & Backend**  | Supabase         |

## Contributing
> [!NOTE]
> **We welcome contributions! Read our [contributing guide](.github/CONTRIBUTING.md) to get started.**


## Project Board
> [!NOTE]
> **View progress, tasks, and upcoming features [here.](https://github.com/users/rakheOmar/projects/4)**

## Support

If you find this project helpful, please consider:

- **Starring the repository** to show your support
- **Reporting bugs** you encounter
- **Suggesting new features**
- **Contributing** to the codebase
- **Sharing** with others who might find it useful

---

<p align="center">
  <sub><strong>Turn your ideas into beautiful markdown, one block at a time. </strong></sub>
</p>
