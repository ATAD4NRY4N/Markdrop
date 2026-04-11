# Development Plan: Blending MarkDrop & ScormStack

**Goals**
Combine MarkDrop's sleek markdown editor with ScormStack's advanced eLearning capabilities to build a modern, intuitive SCORM authoring tool.

---

## Roadmap

### Phase 1: Core Editor Engine & Critical Fixes (Current)
1. **Fix "Add Module" bug:** Resolve initialization and DB migration issues blocking Course creation.
2. **Page & Slide Structure:** Ensure seamless drag-and-drop of modules and basic text (Markdown) blocks.
3. **Copy & Paste Architecture:** Implement cross-slide block copying (as seen in ScormStack).

### Phase 2: Essential eLearning Blocks
1. **Callout / Admonition Block:** Implement markdown-based callouts (Info, Warning, Success, Error, Tip, Note).
2. **Media Blocks:** Carousel Image Block & PDF Viewer Block (with download options).
3. **Navigation Overhaul:** Top/bottom Slide Navigation Bars with conditional progression (locked until completion).

### Phase 3: Advanced Interactive Assessments
1. **Fill in the Blank:** Text input and dropdown within markdown.
2. **Matching Assessment:** Drag-and-drop line drawing.
3. **Hotspot Image:** Click-on-image interactive markers.
4. **Categorization:** Grouping items into buckets.

### Phase 4: Layouts, Templates & Theming
1. **CSS GRID Support:** Implement robust CSS Grid configurations to enable advanced, flexible slide templates.
2. **Preconfigured Slide Templates:** Develop a thorough selection of built-in templates specifically tailored for product training and sales enablement.
3. **Custom Themes System:** Allow reusable design systems, Google Fonts, and layered backgrounds. 
4. **Translation Workflows:** Outline XLIFF Export/Import for professional translations.

### Phase 5: Export & Standalone Analytics
1. **SCORM 1.2 / 2004 Polish:** Ensure packaged exports track `cmi.score.raw` and `cmi.core.lesson_status` correctly.
2. **LMS-lite Analytics:** A KPI dashboard for sessions, learners, completion rates, and average scores when hosted directly.

---
