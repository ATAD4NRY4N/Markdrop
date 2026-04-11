# Development Plan: Blending MarkDrop & ScormStack

**Goals**
Combine MarkDrop's sleek markdown editor with ScormStack's advanced eLearning capabilities to build a modern, intuitive SCORM authoring tool with powerful layout options and interactive assessments.

---

## Roadmap

### Phase 1: Core Editor Engine & Course Management
1. **Fix "Add Module" Bug [COMPLETED]:** Resolved initialization issues blocking course creation.
2. **Course Dashboard [COMPLETED]:** Built a comprehensive dashboard to view all courses, filter by draft/published, search by title/description, duplicate courses, toggle publish status, show module counts, and delete courses. Added `status` column via migration 002.
3. **Advanced Drag & Drop [COMPLETED]:** Seamless drag-and-drop of modules within the sidebar structure — intra-section reorder, cross-section drag, drag-to-unsectioned, `DragOverlay` ghost, droppable empty-section zones, touch sensor support. `persistSections` exposed from `CourseContext`.
4. **Copy & Paste Architecture [COMPLETED]:** Cross-slide and cross-course block copying and pasting. In-app clipboard singleton (`clipboard.js`) with synchronous helpers (`clipboardHasContent`, `getClipboardCount`). System clipboard integration with same-session in-app fallback. Clipboard count badge in the editor toolbar; per-block "paste after" button (shown when clipboard is loaded); `handleCopyModule` to copy all blocks of the active module; `handlePasteAfterBlock` to insert pasted blocks at a precise position. Copy/Paste module block actions in the sidebar panel dropdown. `pasteBlocksIntoModule` in `CourseContext` persists cross-slide pastes and syncs the active editor view via `blocks_json`-keyed `useEffect`.

### Phase 2: Layouts, Templates & Theming
1. **CSS GRID Support [COMPLETED]:** Fixed the orphaned `GridBlock` component (`onUpdate` signature bug repaired — now calls `onUpdate(block.id, updatedBlock)`). Added column weight presets (1:1, 1:1:1, 1:1:1:1, 2:1, 1:2, 1:2:1) via `block.weights` array and CSS `fr` units. Added a "layout" section to the AppSidebar palette with a "Columns / Grid" entry (double-click to add). Preview.jsx now renders `GridBlock` through the `ELEARNING_TYPES`/`ELEARNING_COMPONENTS` registry. Responsive: stacks to a single column on mobile (`max-sm:grid-cols-1`).
2. **Preconfigured Slide Templates [COMPLETED]:** Four preconfigured templates added to a new "Slide Templates" section at the bottom of AppSidebar: **Title Slide** (heading + learning objectives), **Two-Column** (H2 + 2:1 grid with text and image columns), **Quote Focus** (blockquote + knowledge check), **3-Step Timeline** (H2 + 1:1:1 grid). Clicking a template inserts all its blocks in sequence via `onBlockAdd`. Visible only in expanded sidebar state.
3. **Custom Themes System [COMPLETED]:** Per-course theme (heading font, body font, primary colour, accent colour, background colour) stored as `theme_json JSONB` in the `courses` table (migration `003_add_course_theme.sql`). Course Settings dialog expanded to two tabs — General (title/description) and Appearance (font selectors + colour pickers with live swatch preview). Theme applied in the inline Preview pane via injected CSS custom properties and a Google Fonts `@import`. Also threaded through `CoursePreview` (learner preview) and `buildPreviewHtml`/`buildScoHtml` in `scormUtils.js` so the exported SCORM package respects the chosen fonts and colours.

### Phase 3: Essential Interactive Blocks
1. **Callout / Admonition Block:** Markdown-based callouts with distinct UI states (Info, Warning, Success, Error, Tip, Note).
2. **Media Blocks:** 
   - Carousel Image Block with auto-play and pagination.
   - PDF Viewer Block with integrated accessibility and download options.
3. **Course Navigation Block:** Top/bottom progress bars, pagination buttons, and conditional progression (e.g., "locked until video watched").

### Phase 4: Advanced Interactive Assessments
1. **Refined MCQ / Knowledge Check:** Polish the existing Single/Multiple Choice blocks with inline feedback.
2. **Fill in the Blank:** Support inline text input fields and dropdowns directly within markdown paragraphs.
3. **Matching Assessment:** Drag-and-drop interactive line drawing to match terms to definitions.
4. **Hotspot Image Interaction:** Define clickable zones on an uploaded image that reveal popovers or act as quiz answers.
5. **Categorization Drag & Drop:** Grouping items into defined bucket columns.

### Phase 5: Localization workflows
1. **XLIFF Export/Import:** Features to export text nodes to XLIFF XML for professional translation agencies, and import them to clone translated courses.

### Phase 6: Export & Analytics
1. **SCORM 1.2 / 2004 Polish:** Ensure packaged ZIP exports meticulously track `cmi.score.raw`, `cmi.core.lesson_status`, and `session_time`.
2. **Review Link Sharing:** Generate a public "Reviewer" URL for stakeholders to leave slide-specific feedback.
3. **LMS-Lite Analytics Dashboard:** For natively hosted courses, track sessions, active learners, completion rates, and average scores.

---
