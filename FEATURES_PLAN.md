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

### Phase 3: Essential Interactive Blocks [COMPLETED]
1. **Callout / Admonition Block [COMPLETED]:** Added `success` type (emerald green with `BadgeCheck` icon) to the existing `AlertBlock`, which already covered Note, Tip, Important, Warning, and Caution. The new `success` type propagates through the Preview.jsx `div` mdComponent alert renderer and `scormUtils.js` colorMap (`SUCCESS: "#10b981"`).
2. **Media Blocks [COMPLETED]:** 
   - **Carousel Image Block [COMPLETED]:** `CarouselBlock.jsx` built with `embla-carousel-react`. Supports multiple slides with URL / alt text / caption per slide, autoPlay toggle + interval, show-dots toggle, prev/next arrow buttons, and dot-pill navigation. Registers in AppSidebar media palette, MarkdownBlock switch, and Preview ELEARNING_TYPES. SCORM export renders a full `buildCarouselHtml()` with JS functions `carouselGo/carouselPrev/carouselNext` and `initCarousels()` called on page load.
   - **PDF Viewer Block [COMPLETED]:** `PdfBlock.jsx` with URL input, optional title, height selector (400px–800px), and show-download toggle. Preview renders an `<iframe>` embed with inline fallback and a download link. SCORM export via `buildPdfHtml()` renders an iframe with inline styles and optional download anchor.
3. **Course Navigation Block [COMPLETED]:** Enhanced `CourseNavBlock.jsx` with `position` selector (Bottom / Top / Both) and `showProgress` toggle that renders a preview progress bar. `buildNavBarHtml` updated to accept `showProgress` param and render a thin 3px progress indicator on top of the nav bar. `buildScoHtml` updated to handle `position === "both"` (renders nav bar at both top and bottom of the module). `course-nav` default block in AppSidebar updated to include `position: "bottom"` and `showProgress: false`.

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
