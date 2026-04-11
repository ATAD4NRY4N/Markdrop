# Development Plan: Blending MarkDrop & ScormStack

**Goals**
Combine MarkDrop's sleek markdown editor with ScormStack's advanced eLearning capabilities to build a modern, intuitive SCORM authoring tool with powerful layout options and interactive assessments.

---

## Roadmap

### Phase 1: Core Editor Engine & Course Management
1. **Fix "Add Module" Bug [COMPLETED]:** Resolved initialization issues blocking course creation.
2. **Course Dashboard [COMPLETED]:** Built a comprehensive dashboard to view all courses, filter by draft/published, search by title/description, duplicate courses, toggle publish status, show module counts, and delete courses. Added `status` column via migration 002.
3. **Advanced Drag & Drop [COMPLETED]:** Seamless drag-and-drop of modules within the sidebar structure — intra-section reorder, cross-section drag, drag-to-unsectioned, `DragOverlay` ghost, droppable empty-section zones, touch sensor support. `persistSections` exposed from `CourseContext`.
4. **Copy & Paste Architecture:** Implement cross-slide and cross-course block copying and pasting (as seen in ScormStack).

### Phase 2: Layouts, Templates & Theming
1. **CSS GRID Support:** 
   - Implement a new "Grid/Columns" block to allow placing components side-by-side. 
   - Define row/column weights and responsive collapsing for mobile.
2. **Preconfigured Slide Templates:** 
   - Title Slide, Two-Column (Text/Image), Quote Focus, 3-Step Timeline.
   - Tailored specifically for product training and sales enablement.
3. **Custom Themes System:** Global configuration panel for reusable design systems, custom Google Fonts, and layered CSS backgrounds. 

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
