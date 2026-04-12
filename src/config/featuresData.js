/**
 * CourseForge features catalogue.
 * Used by FeaturesPage (hub) and FeatureDetailPage (individual feature).
 */

// ── Feature groups ────────────────────────────────────────────────────────────

export const FEATURE_GROUPS = [
  {
    id: "authoring",
    icon: "Brush",
    title: "Visual Authoring",
    description:
      "A rich, drag-and-drop editor with 30+ content block types, pre-built slide templates, flexible grid layouts, and per-course custom themes.",
    color: "violet",
  },
  {
    id: "assessments",
    icon: "Brain",
    title: "Interactive Assessments",
    description:
      "Go beyond passive reading. Quiz learners, ask fill-in-the-blank questions, set matching exercises, place hotspots on images, and build drag-and-drop categorization tasks.",
    color: "blue",
  },
  {
    id: "export",
    icon: "Rocket",
    title: "Export & Distribution",
    description:
      "Package your course as a SCORM 1.2 or SCORM 2004 ZIP file in one click, or export XLIFF to translate your content into any language.",
    color: "emerald",
  },
  {
    id: "collaboration",
    icon: "Users2",
    title: "Collaboration",
    description:
      "Invite editors and reviewers, share feedback with threaded comments, track review status, and manage your team's access — all without leaving CourseForge.",
    color: "amber",
  },
  {
    id: "adaptive",
    icon: "Network",
    title: "Adaptive Learning",
    description:
      "Route learners through personalized paths based on quiz performance. Define variants, set checkpoint rules, and embed the adaptive runtime directly in your SCORM export.",
    color: "rose",
  },
  {
    id: "productivity",
    icon: "Zap",
    title: "Productivity",
    description:
      "A course dashboard to manage all your projects, keyboard-driven search & replace across every module, and copy-paste architecture that works across slides and courses.",
    color: "slate",
  },
  {
    id: "accessibility",
    icon: "Accessibility",
    title: "Accessibility",
    description:
      "CourseForge is built so your courses can reach every learner — including those who rely on assistive technologies. The player, blocks, and authoring tools align with WCAG inclusive-design principles from the ground up.",
    color: "teal",
  },
  {
    id: "localization",
    icon: "Globe2",
    title: "Localization",
    description:
      "Turn a single well-designed course into a complete multilingual learning experience. CourseForge gives you XLIFF workflows for working with translation teams, a localization panel for managing multiple language versions, and per-language SCORM exports that carry the correct metadata for any LMS.",
    color: "indigo",
  },
];

// ── Feature catalogue ─────────────────────────────────────────────────────────

export const FEATURES = [
  // ── Authoring ──
  {
    slug: "block-editor",
    group: "authoring",
    icon: "Layers",
    title: "Block-Based Editor",
    tagline: "Drag, drop, and edit 30+ content blocks without writing code.",
    description:
      "The CourseForge editor is built around composable content blocks. Open the block palette, drag a block onto the canvas, and edit it inline — every block has its own focused UI. Stack headings, paragraphs, rich media, and interactive assessments in any order. Reorder with a drag handle, copy to the clipboard for use on other slides, and lean on keyboard shortcuts to stay in flow.",
    howItWorks: [
      {
        step: "Open the block palette",
        detail:
          "Click the sidebar trigger or use the AppSidebar. Browse blocks grouped by category — headings, media, eLearning, layouts, and more.",
      },
      {
        step: "Add a block",
        detail:
          "Double-click any block type to append it, or drag it directly onto the canvas and drop it between existing blocks.",
      },
      {
        step: "Edit inline",
        detail:
          "Each block renders its own editing UI — type directly into headings and paragraphs, configure quiz options in a form, or adjust hotspot coordinates on an image.",
      },
      {
        step: "Reorder and manage",
        detail:
          "Drag the grip handle on any block to reorder. Use the block toolbar to copy, paste after, or delete. Press Ctrl+Z to undo any change.",
      },
    ],
    highlights: [
      "30+ block types: headings, paragraphs, tables, code, math, diagrams, images, video, carousel, PDF, and all eLearning types",
      "Keyboard shortcuts: Ctrl+S to save, Ctrl+Z/Y to undo/redo, Ctrl+V to paste",
      "Per-block copy, paste-after, and delete actions",
      "Undo/redo history backed by a full state stack",
      "Inline learner preview renders your blocks exactly as learners will see them",
      "Drag-and-drop reorder within a module using @dnd-kit",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "slide-templates",
    group: "authoring",
    icon: "LayoutTemplate",
    title: "Slide Templates",
    tagline: "One click inserts a complete, pre-configured slide layout.",
    description:
      "Don't start from a blank canvas. The Slide Templates section in the AppSidebar offers four pre-built layouts — Title Slide, Two-Column, Quote Focus, and 3-Step Timeline — each with placeholder content ready to edit. Click a template to insert all its blocks in sequence, then swap the placeholder text and images for your own content.",
    howItWorks: [
      {
        step: "Expand the sidebar",
        detail:
          "Click the sidebar trigger to open the full AppSidebar. Scroll to the 'Slide Templates' section at the bottom.",
      },
      {
        step: "Click a template",
        detail:
          "The template's full block set is appended to the active module — heading, grid columns, learning objectives, and all.",
      },
      {
        step: "Replace placeholder content",
        detail:
          "Each template ships with sensible default text. Click on any block to edit it in place.",
      },
      {
        step: "Mix freely",
        detail:
          "Use multiple templates in the same module, or mix template-built blocks with custom ones. All blocks are fully editable after insertion.",
      },
    ],
    highlights: [
      "Title Slide — H1 heading + Learning Objectives block",
      "Two-Column — H2 heading + 2:1 grid with a text column and an image column",
      "Quote Focus — blockquote + Knowledge Check question",
      "3-Step Timeline — H2 heading + 1:1:1 equal-column grid",
      "Templates insert via the same addBlock pipeline — full undo support",
      "Visible only in expanded sidebar state for a clean collapsed view",
    ],
    cta: { label: "Try the editor", href: "/course" },
  },
  {
    slug: "grid-layouts",
    group: "authoring",
    icon: "LayoutGrid",
    title: "Grid Layouts",
    tagline: "Side-by-side columns with flexible widths — no CSS required.",
    description:
      "The Grid block lets you build multi-column layouts by choosing a column weight preset and placing any block type inside each column. Ratios like 1:1, 2:1, and 1:2:1 give you full control over visual balance. On mobile, columns automatically stack into a single column so learners always get a readable experience.",
    howItWorks: [
      {
        step: "Add a Grid block",
        detail:
          "Find 'Grid (Columns)' in the Layout section of the block palette. Double-click or drag it onto the canvas.",
      },
      {
        step: "Choose a column ratio",
        detail:
          "Pick a preset from the dropdown: 1:1, 1:1:1, 1:1:1:1, 2:1, 1:2, or 1:2:1. The grid updates immediately.",
      },
      {
        step: "Add blocks inside columns",
        detail:
          "Each column has its own mini block palette. Add headings, paragraphs, images, or even assessments into any column.",
      },
      {
        step: "Preview responsiveness",
        detail:
          "Switch to the Preview tab. On small screens, columns automatically collapse into a single vertical stack.",
      },
    ],
    highlights: [
      "Six column weight presets covering the most common content layouts",
      "Any block type can live inside a column — including quizzes and media",
      "CSS fr units for precise proportional widths",
      "Mobile-responsive: single column on screens below sm breakpoint",
      "Nested grid blocks work with XLIFF translation and SCORM export",
      "Full undo/redo support for grid edits",
    ],
    cta: { label: "Open the editor", href: "/course" },
  },
  {
    slug: "custom-themes",
    group: "authoring",
    icon: "Palette",
    title: "Custom Themes",
    tagline: "Per-course fonts and colors, previewed live, baked into every export.",
    description:
      "Give each course its own visual identity. The Course Settings Appearance tab lets you set heading and body fonts from a curated Google Fonts list, and pick primary, accent, and background colors with a built-in color picker. A live swatch preview shows your choices before you save. The theme travels with the course — it's injected into the editor preview, the learner preview, and the SCORM export.",
    howItWorks: [
      {
        step: "Open Course Settings",
        detail:
          "Click the course title in the builder header to open the Course Settings dialog.",
      },
      {
        step: "Switch to Appearance",
        detail:
          "The Appearance tab exposes font selectors for heading and body text, plus three color pickers.",
      },
      {
        step: "Choose fonts and colors",
        detail:
          "Pick from Playfair Display, Montserrat, Lora, Inter, and more. Set primary, accent, and background colors with the native color picker.",
      },
      {
        step: "Save and preview",
        detail:
          "A live swatch at the bottom of the dialog shows the combination. Save, then verify in the Preview tab or Learner Preview.",
      },
    ],
    highlights: [
      "Six heading font options and six body font options from Google Fonts",
      "Three color slots: primary (headings/buttons), accent (highlights), background",
      "Live swatch preview inside the settings dialog",
      "Theme applied as CSS custom properties — no style conflicts",
      "Works in the inline Preview tab, the Learner Preview dialog, and SCORM export HTML",
      "Theme stored as theme_json in Supabase for persistence across sessions",
    ],
    cta: { label: "Customize your course", href: "/course" },
  },

  // ── Assessments ──
  {
    slug: "quiz",
    group: "assessments",
    icon: "HelpCircle",
    title: "Quiz & Knowledge Check",
    tagline: "Multiple-choice questions with instant feedback and scoring.",
    description:
      "CourseForge offers two question formats: a full multi-question Quiz block (with pass threshold and attempt limiting) and a lightweight single-question Knowledge Check for quick comprehension checks. Both formats support custom correct and incorrect feedback text, which appears color-coded after the learner submits.",
    howItWorks: [
      {
        step: "Add a Quiz or Knowledge Check block",
        detail:
          "Find them in the eLearning section of the block palette. Knowledge Check is a single question; Quiz supports multiple questions with a total score.",
      },
      {
        step: "Write your question",
        detail:
          "Type your prompt and at least two answer options. Click the radio button next to the correct answer to mark it.",
      },
      {
        step: "Set feedback",
        detail:
          "Enter custom 'Correct!' and 'Try again.' messages. These appear below the answer options after submission.",
      },
      {
        step: "Configure scoring (Quiz only)",
        detail:
          "Set a pass threshold (e.g., 80%) and an attempt limit. A score of 0 attempts means unlimited retries.",
      },
    ],
    highlights: [
      "Multiple-choice format with single correct answer per question",
      "Quiz block: multiple questions, total score, pass threshold, attempt limit",
      "Knowledge Check: single question, lightweight, great for mid-module checks",
      "Per-question correct and incorrect feedback with color-coded display",
      "Score tracked in SCORM via cmi.score.raw and cmi.core.lesson_status",
      "Both blocks work as adaptive checkpoints for learning path rules",
    ],
    cta: { label: "Build your first quiz", href: "/course" },
  },
  {
    slug: "fill-in-the-blank",
    group: "assessments",
    icon: "Type",
    title: "Fill in the Blank",
    tagline: "Cloze exercises where learners type missing words.",
    description:
      "Write a sentence with triple-underscore (___) placeholders, then define the accepted answers for each blank. Learners type their answers directly into the blanks. On submit, each blank is checked and highlighted — green for correct, red for incorrect — and per-blank correction hints appear alongside the final feedback message. Toggle case sensitivity as needed.",
    howItWorks: [
      {
        step: "Add the block",
        detail:
          "Find 'Fill in the Blank' in the eLearning section of the block palette and add it to the canvas.",
      },
      {
        step: "Write your sentence",
        detail:
          "Type your sentence in the Sentence field, inserting ___ wherever you want a blank (e.g., 'The capital of France is ___.').",
      },
      {
        step: "Set accepted answers",
        detail:
          "An input row appears for each ___. Enter the correct answer. You can list multiple acceptable answers for the same blank.",
      },
      {
        step: "Add feedback and submit options",
        detail:
          "Write custom correct and incorrect feedback messages, and toggle case-sensitive matching if needed.",
      },
    ],
    highlights: [
      "Multiple blanks per exercise using the ___ placeholder syntax",
      "Ordered answers array per blank for flexible match acceptance",
      "Case-sensitive matching toggle",
      "Per-blank correction hint shown after submit",
      "Custom correct and incorrect feedback messages",
      "Inline learner preview inside the editor for rapid testing",
    ],
    cta: { label: "Try it in the editor", href: "/course" },
  },
  {
    slug: "matching",
    group: "assessments",
    icon: "ArrowLeftRight",
    title: "Matching Exercise",
    tagline: "Pair terms with definitions by clicking — shuffled every time.",
    description:
      "Learners select a term from the left column, then click its matching definition in the right column. Definitions are shuffled on every attempt so learners can't rely on visual position. After submitting, each pair is highlighted correct or incorrect, a total score is shown, and a 'Try Again' button resets the exercise for another attempt.",
    howItWorks: [
      {
        step: "Add term/definition pairs",
        detail:
          "Add a Matching block and enter your pairs. Each pair has a Term field and a Definition field.",
      },
      {
        step: "Learner selects a term",
        detail:
          "In the learner view, clicking a term highlights it with a selection ring.",
      },
      {
        step: "Learner selects the matching definition",
        detail:
          "The pair is connected. Learners can re-select to change their pairing before submitting.",
      },
      {
        step: "Submit for scoring",
        detail:
          "Each pair turns green or red based on correctness. A score (e.g., '3 / 4 correct') appears with options to Try Again.",
      },
    ],
    highlights: [
      "Unlimited term/definition pairs per block",
      "Definitions shuffled on every render to prevent positional memorization",
      "Click-based pairing UI — no dragging required",
      "Per-pair correct/incorrect highlight on submit",
      "Total score shown after submission",
      "Try Again resets without reshuffling (same positions preserved for review)",
    ],
    cta: { label: "Start authoring", href: "/course" },
  },
  {
    slug: "hotspot",
    group: "assessments",
    icon: "Target",
    title: "Hotspot Interaction",
    tagline: "Clickable pins on an image that reveal labels and detailed content.",
    description:
      "Upload an image and place hotspot pins anywhere on it. Each hotspot has a label and a content description that appear in a popover when the learner clicks the animated pin. Ideal for labeled diagrams, interactive maps, equipment walkthroughs, and anatomy illustrations — any scenario where spatial context matters.",
    howItWorks: [
      {
        step: "Add a Hotspot block",
        detail:
          "Add the block from the eLearning palette and upload or link your base image.",
      },
      {
        step: "Place hotspots",
        detail:
          "Click 'Add Hotspot' and set the x/y position (as percentage of image dimensions). Give each hotspot a short label.",
      },
      {
        step: "Write content",
        detail:
          "Enter the popover description for each hotspot — full paragraph text is supported.",
      },
      {
        step: "Learners explore",
        detail:
          "Animated pin markers pulse on the image. Learners click any pin to reveal its popover with label and description.",
      },
    ],
    highlights: [
      "Unlimited hotspots per image",
      "Precise x/y position controls as percentage of image dimensions",
      "Animated pulsing pin markers in learner view",
      "Click-to-reveal popover with label and full description",
      "Fully editable inline — no separate configuration dialog",
      "Hotspot content is XLIFF-exportable for translation",
    ],
    cta: { label: "Build an interaction", href: "/course" },
  },
  {
    slug: "categorization",
    group: "assessments",
    icon: "Kanban",
    title: "Categorization",
    tagline: "Drag items into the correct category buckets.",
    description:
      "Present learners with a set of items and category buckets. They drag each item into the bucket they believe is correct, then submit for scoring. The categorization block supports unlimited categories and items, making it suitable for anything from sorting vocabulary to classifying safety procedures.",
    howItWorks: [
      {
        step: "Define your categories",
        detail:
          "Add a Categorization block and create your category labels (e.g., 'Safe', 'Unsafe', 'Requires Training').",
      },
      {
        step: "Add items",
        detail:
          "Add each item and assign it to the correct category in the authoring view. Items start uncategorized in the learner view.",
      },
      {
        step: "Learners sort",
        detail:
          "Learners drag items from the item pool into the category buckets. Items can be moved between buckets before submitting.",
      },
      {
        step: "Score and review",
        detail:
          "Submit scores items based on whether they're in the correct bucket. Feedback shows which items were correctly placed.",
      },
    ],
    highlights: [
      "Unlimited categories and items per block",
      "Drag-and-drop sorting UI for learners",
      "Author-defined correct categorization for automatic scoring",
      "Item labels are XLIFF-translatable",
      "Works within grid columns for complex layout compositions",
    ],
    cta: { label: "Create a sorting activity", href: "/course" },
  },
  {
    slug: "flashcards",
    group: "assessments",
    icon: "CreditCard",
    title: "Flashcards",
    tagline: "Flip-card pairs for self-paced memorization.",
    description:
      "Create term/definition or question/answer card pairs. Learners click the card to flip it and reveal the back face — a smooth 3D flip animation reinforces the interaction. Flashcards work equally well as a review activity at the end of a module or as an introductory vocabulary exercise at the start.",
    howItWorks: [
      {
        step: "Add a Flashcard block",
        detail:
          "Find Flashcard in the eLearning section of the block palette.",
      },
      {
        step: "Write the front face",
        detail:
          "Enter a term, question, or prompt — this is what the learner sees first.",
      },
      {
        step: "Write the back face",
        detail:
          "Enter the definition, answer, or explanation that appears when the card is flipped.",
      },
      {
        step: "Learners flip to reveal",
        detail:
          "Clicking the card triggers a smooth flip animation. Learners can flip back and forth to reinforce memory.",
      },
    ],
    highlights: [
      "Front and back text with rich content support",
      "Smooth CSS flip animation in learner view",
      "Both front and back text are XLIFF-translatable",
      "Works in SCORM export and the inline learner preview",
      "Renders correctly inside grid columns",
    ],
    cta: { label: "Add to your course", href: "/course" },
  },

  // ── Export ──
  {
    slug: "scorm-export",
    group: "export",
    icon: "Package",
    title: "SCORM Export",
    tagline: "One-click ZIP export for any SCORM 1.2 or SCORM 2004 LMS.",
    description:
      "CourseForge packages your entire course — all modules, themes, and interactive content — into a standards-compliant SCORM ZIP file. Choose SCORM 1.2 for maximum LMS compatibility or SCORM 2004 4th Edition for richer tracking. The exported package includes the adaptive learning runtime, custom theme styles, and all interactive block JavaScript. Just upload the ZIP to your LMS.",
    howItWorks: [
      {
        step: "Build your course",
        detail:
          "Author your modules, add interactive blocks, set a custom theme, and optionally configure adaptive learning paths.",
      },
      {
        step: "Click Export SCORM",
        detail:
          "Click the Export SCORM button in the builder toolbar to open the export dialog.",
      },
      {
        step: "Choose version and options",
        detail:
          "Select SCORM 1.2 or SCORM 2004 4th Edition and confirm your course title. The dialog previews the module list that will be packaged.",
      },
      {
        step: "Download and upload",
        detail:
          "Click Download. A ZIP file is generated in your browser and saved. Upload it directly to Moodle, TalentLMS, Docebo, Cornerstone, or any SCORM-compliant LMS.",
      },
    ],
    highlights: [
      "Full SCORM 1.2 and SCORM 2004 4th Edition support",
      "Each module exports as its own SCO (shareable content object)",
      "cmi.score.raw, cmi.core.lesson_status, and session_time tracked",
      "cmi.suspend_data used for adaptive state persistence across sessions",
      "Custom course theme (fonts + colors) baked into exported HTML",
      "Adaptive learning runtime embedded in every exported page",
      "No server required — ZIP generated entirely in the browser",
    ],
    cta: { label: "Export your course", href: "/course" },
  },
  {
    slug: "localization",
    group: "export",
    icon: "Globe",
    title: "Localization & Translation",
    tagline: "Export XLIFF, translate, reimport — a full localized course in minutes.",
    description:
      "CourseForge supports XLIFF 1.2, the industry standard for software and content translation. Export all text from every block type across every module into a single XLIFF file, hand it to a translator or run it through CAT software, then import the completed file. CourseForge creates a fully translated course clone automatically — no manual copy-pasting required.",
    howItWorks: [
      {
        step: "Export XLIFF",
        detail:
          "Click 'Translate' in the toolbar to open the XLIFF dialog. The Export tab downloads an XLIFF file containing every translatable string, organized by module.",
      },
      {
        step: "Translate the file",
        detail:
          "Open the XLIFF in any CAT tool (OmegaT, MemoQ, SDL Trados, DeepL) or send it to a professional translator. Fill in the <target> elements for each trans-unit.",
      },
      {
        step: "Import the translation",
        detail:
          "In the Import tab, upload the completed XLIFF and select the target language. CourseForge shows a per-module summary of translated strings.",
      },
      {
        step: "Auto-cloned course",
        detail:
          "Click Apply Translation. A new course titled '[Original Title] [Language]' is created with all translations applied. The original course is untouched.",
      },
    ],
    highlights: [
      "XLIFF 1.2 standard format — compatible with all major CAT tools",
      "Covers all 30+ block types including nested quiz options and grid blocks",
      "Stable trans-unit IDs survive block reordering between export and import",
      "Per-module breakdown in the import summary",
      "Auto-clones the course — never overwrites the original",
      "Dot-path notation resolves deeply nested fields (e.g., questions.2.options.1)",
    ],
    cta: { label: "Try translation", href: "/course" },
  },

  // ── Collaboration ──
  {
    slug: "team-roles",
    group: "collaboration",
    icon: "Users",
    title: "Team Roles & Permissions",
    tagline: "Invite editors and reviewers with one link — no account required.",
    description:
      "CourseForge uses a three-tier role model. Course Owners have full edit, publish, and team management rights. Editors can edit any module. Reviewers get read-only access to the learner preview and can leave comments. Invitations are sent as signed links with a 7-day expiry — the invitee clicks the link and instantly gets access at the assigned role level.",
    howItWorks: [
      {
        step: "Open the Team dialog",
        detail:
          "Click 'Team' in the builder toolbar to open the Collaborators dialog.",
      },
      {
        step: "Enter an email and role",
        detail:
          "Type the collaborator's email address, select Editor or Reviewer from the dropdown, and click Invite.",
      },
      {
        step: "Share the invite link",
        detail:
          "The signed invite link is automatically copied to your clipboard. Send it by email or chat.",
      },
      {
        step: "Collaborator accepts",
        detail:
          "The invitee clicks the link and lands on the Accept Invite page. They confirm the course name and role, click Accept, and are redirected to their view.",
      },
    ],
    highlights: [
      "Owner: full edit, publish, delete, and team management",
      "Editor: edit all modules, save, but no publish or team controls",
      "Reviewer: read-only learner preview + comment access",
      "Signed invite links with 7-day expiry",
      "Pending Invitations tab shows outstanding invites with copy/revoke controls",
      "RLS policies enforce roles at the database level via Supabase",
    ],
    cta: { label: "Invite your team", href: "/course" },
  },
  {
    slug: "template-designer",
    group: "collaboration",
    icon: "LayoutTemplate",
    title: "Course Templates & Template Designer",
    tagline: "Lock course structure with templates — editors can only change content, never layout.",
    description:
      "The Template Designer system lets designated team members build reusable course structures. A template course defines all the modules and block components. When a regular course is linked to a template, its structure is frozen: authors can edit text, media, and interactive content inside each block, but cannot add, remove, reorder, or restructure blocks or modules. This ensures brand consistency and instructional design compliance across all courses based on the same template.",
    howItWorks: [
      {
        step: "Create a template course",
        detail:
          "A user with the Template Designer role creates a course with is_template=true. They build out all the sections, modules, and block components freely.",
      },
      {
        step: "Link a course to a template",
        detail:
          "Set the template_id on a regular course to point to the template. Once linked, that course enters template-locked mode.",
      },
      {
        step: "Content editing only",
        detail:
          "When editing a template-locked course, the block palette in the sidebar is replaced by a 'Structure locked' notice. Drag handles, delete buttons, and paste-after controls are hidden on every block.",
      },
      {
        step: "Module structure frozen",
        detail:
          "In the Course Structure panel, Add Module and Add Section buttons are disabled. Module rename and delete options are removed from the context menu. A lock icon appears in the panel header.",
      },
    ],
    highlights: [
      "New 'Template Designer' collaborator role for template authors",
      "is_template flag marks a course as a reusable template definition",
      "template_id on a course activates template-locked mode",
      "Block palette replaced with lock message when structure is frozen",
      "Drag handles, delete, and paste-after controls hidden in locked mode",
      "Add Module / Add Section buttons disabled in locked courses",
      "Amber banner in the editor reminds authors that structure is fixed",
      "Dashboard shows purple 'Template' badge and sky 'Template Locked' badge",
    ],
    cta: { label: "Manage your team", href: "/course" },
  },
  {
    slug: "review-comments",
    group: "collaboration",
    icon: "MessageSquare",
    tagline: "Structured threaded feedback with status tracking and priority levels.",
    description:
      "The Review panel gives reviewers a structured place to leave feedback. Comments can be attached to a specific module slide or to the course as a whole. Each comment has a status (open, in-progress, resolved), a priority (low, normal, high), and supports threaded replies. Course owners and authors track progress by filtering by status, slide, or keyword.",
    howItWorks: [
      {
        step: "Open the Review panel",
        detail:
          "Click 'Review' in the toolbar. The panel slides in as a Sheet over-panel. Reviewers can also reach it at /review/:courseId.",
      },
      {
        step: "Leave a comment",
        detail:
          "Type your feedback, select which module/slide it relates to (or mark it as course-wide), set a priority, and click Post.",
      },
      {
        step: "Reply and discuss",
        detail:
          "Anyone with access can reply to a comment, creating a thread. Replies are timestamped and author-attributed.",
      },
      {
        step: "Resolve and close",
        detail:
          "Authors change the comment status from Open → In Progress → Resolved as they address feedback. Resolved comments can be filtered out of the view.",
      },
    ],
    highlights: [
      "Per-slide comments and course-wide comments",
      "Threaded replies for focused discussions",
      "Three statuses: Open, In Progress, Resolved",
      "Three priorities: Low, Normal, High",
      "Filter by status, slide, or keyword",
      "Comment cards show author avatar, timestamp, and context badge",
      "Authors and owners can delete; only owners can change others' statuses",
    ],
    cta: { label: "Start a review", href: "/course" },
  },

  // ── Adaptive ──
  {
    slug: "learning-paths",
    group: "adaptive",
    icon: "GitBranch",
    title: "Learning Paths",
    tagline: "Named variants route learners through personalized module sequences.",
    description:
      "Define named learning branches — for example a Remediation Path for learners who score below 60%, or an Advanced Track for those who score above 90%. Variant modules are invisible to learners until a checkpoint rule unlocks them. Mark variants as 'required' (they count toward course completion) or 'optional' (enrichment only). The entire adaptive state persists in SCORM cmi.suspend_data across sessions.",
    howItWorks: [
      {
        step: "Open the Adaptive panel",
        detail:
          "Click 'Adaptive' in the builder toolbar to open the Adaptive Learning sheet panel.",
      },
      {
        step: "Create a variant",
        detail:
          "In the Variants tab, click 'Add Variant', give it a descriptive name (e.g., 'Remediation Path'), and toggle whether it counts toward required completion.",
      },
      {
        step: "Assign modules",
        detail:
          "Check the modules that belong to this variant. A module can belong to multiple variants.",
      },
      {
        step: "Set unlock rules",
        detail:
          "Switch to the Checkpoints tab to define the score-based rules that unlock this variant. Save the config.",
      },
    ],
    highlights: [
      "Multiple named variants per course",
      "Required vs optional variants for completion logic",
      "Variant modules hidden from learners until unlocked by a rule",
      "Adaptive state serialized as JSON in cmi.suspend_data — survives LMS session restarts",
      "Adaptive runtime embedded in every SCORM export automatically",
      "Works across both SCORM 1.2 and SCORM 2004 exports",
    ],
    cta: { label: "Configure adaptive paths", href: "/course" },
  },
  {
    slug: "checkpoints",
    group: "adaptive",
    icon: "CheckCircle2",
    title: "Checkpoint Rules",
    tagline: "Score-based rules fire in real time to unlock the right learning path.",
    description:
      "Designate any quiz or knowledge-check block as a checkpoint. Then attach score-based rules: 'if score ≥ 80%, unlock Advanced Track'. Rules are evaluated in order — first match wins. A fallback rule fires when no score condition is met, so every learner always gets routed somewhere. All evaluation happens inside the SCORM runtime, with no server calls.",
    howItWorks: [
      {
        step: "Go to Checkpoints tab",
        detail:
          "Open the Adaptive panel and switch to the Checkpoints tab. All quiz and knowledge-check blocks in the course are listed.",
      },
      {
        step: "Add a rule",
        detail:
          "Click 'Add Rule' on the checkpoint card. Choose the operator (≥ or <), enter a score percentage, and select which variant to unlock.",
      },
      {
        step: "Set a fallback",
        detail:
          "Add a fallback rule (no score condition) that unlocks a default variant for learners who don't match any scored rule.",
      },
      {
        step: "Save and export",
        detail:
          "Save the adaptive config. When you export to SCORM, the full ruleset is embedded as window._ADAPTIVE_CONFIG in every SCO page.",
      },
    ],
    highlights: [
      "Supports ≥ (greater-than-or-equal) and < (less-than) score operators",
      "Rules evaluated in order — first match wins",
      "Fallback rule handles all non-matching cases",
      "Real-time rule evaluation in the SCORM runtime (no server required)",
      "Checkpoint scores persisted per-block in cmi.suspend_data",
      "Compatible with both Quiz blocks and Knowledge Check blocks",
    ],
    cta: { label: "Set up checkpoints", href: "/course" },
  },

  // ── Productivity ──
  {
    slug: "course-dashboard",
    group: "productivity",
    icon: "LayoutDashboard",
    title: "Course Dashboard",
    tagline: "Manage every course from one clean overview.",
    description:
      "The Courses dashboard shows all your courses at a glance. Filter by draft or published status, search by title or description, and act on any course with a single dropdown. Duplicate a finished course as a starting point for a new one, toggle its publish status, check how many modules it contains, or delete it — all without opening the editor.",
    howItWorks: [
      {
        step: "Navigate to Courses",
        detail:
          "Click 'Courses' in the navigation bar to reach the dashboard.",
      },
      {
        step: "Filter and search",
        detail:
          "Use the status filter (All, Draft, Published) and the search bar to find the course you need.",
      },
      {
        step: "Open or edit",
        detail:
          "Click a course card to open it in the full CourseBuilder with all modules loaded.",
      },
      {
        step: "Manage from the card menu",
        detail:
          "Use the ⋯ menu on any card to duplicate the course, toggle its publish status, or delete it.",
      },
    ],
    highlights: [
      "Draft / Published status filter",
      "Full-text search across course titles and descriptions",
      "Module count shown per course card",
      "One-click duplicate — all modules are copied to a new course",
      "Publish/unpublish toggle without opening the editor",
      "Delete with confirmation to prevent accidental data loss",
    ],
    cta: { label: "View your courses", href: "/courses" },
  },
  {
    slug: "search-replace",
    group: "productivity",
    icon: "Search",
    title: "Search & Replace",
    tagline: "Find and update text across every module in seconds.",
    description:
      "Press Ctrl+H (or Cmd+H on Mac) to open the Find & Replace dialog. Type a search term and results appear instantly, grouped by module with the matched text highlighted in context. Click any result to jump directly to that block in the editor. Replace a single match, or hit Replace All to sweep every occurrence across the entire course.",
    howItWorks: [
      {
        step: "Open Find & Replace",
        detail:
          "Press Ctrl+H / Cmd+H from anywhere in the builder, or click the Search icon in the toolbar.",
      },
      {
        step: "Type your search",
        detail:
          "Results appear as you type, grouped by module with match count badges and highlighted context snippets.",
      },
      {
        step: "Navigate results",
        detail:
          "Press Enter / Shift+Enter, use the ↑↓ arrow buttons, or click any result row. The editor switches to that module and scrolls the matching block into view with a violet outline pulse.",
      },
      {
        step: "Replace",
        detail:
          "Enter a replacement in the second input. Click Replace to fix the selected match, or Replace All to update every occurrence across all modules at once.",
      },
    ],
    highlights: [
      "Searches all 30+ block types including deeply nested quiz fields",
      "Case-sensitive matching toggle",
      "Results grouped by module with per-module match count badges",
      "Context snippet shows text before and after each match",
      "Click to navigate: module switches and block scrolls into view with a highlight animation",
      "Replace All updates every module and persists changes to the database",
      "Replacing in the active module preserves the full undo/redo history",
    ],
    cta: { label: "Try in the editor", href: "/course" },
  },

  // ── Accessibility ──────────────────────────────────────────────────────────
  {
    slug: "wcag-compliance",
    group: "accessibility",
    icon: "ShieldCheck",
    title: "WCAG Compliance",
    tagline: "Build inclusive courses on a platform designed with accessible-by-default principles.",
    description:
      "CourseForge is designed so your courses can reach as many learners as possible, including those who rely on assistive technologies. The player and content blocks are built with modern accessibility practices in mind, helping you align with WCAG guidelines in day-to-day authoring work \u2014 not as an afterthought, but as part of the foundation.",
    howItWorks: [
      {
        step: "Accessible player foundation",
        detail:
          "Navigation, buttons, and interactive elements are structured with semantic HTML so they work well with screen readers and keyboard navigation out of the box.",
      },
      {
        step: "Accessible content patterns",
        detail:
          "Core blocks \u2014 text, media, assessments, and navigation \u2014 are designed to encourage clear document structure, proper heading hierarchy, and readable, high-contrast layouts.",
      },
      {
        step: "Author with confidence",
        detail:
          "Because accessible structure is baked into the block authoring UI, you\u2019re nudged toward good practices automatically \u2014 labels, roles, and semantic markup are included by default.",
      },
      {
        step: "Continuous improvement",
        detail:
          "Accessibility is treated as an ongoing commitment, not a one-off checklist. Updates focus on keeping the experience in line with evolving WCAG standards.",
      },
    ],
    highlights: [
      "Semantic HTML roles and ARIA attributes used in all interactive blocks",
      "Screen-reader-friendly structure across the SCORM player and inline preview",
      "Heading hierarchy encouraged through the ordered block palette (H1 \u2192 H6)",
      "High-contrast text defaults throughout the default course theme",
      "Focus indicators preserved on all interactive elements",
      "Accessibility treated as an iterative, ongoing platform commitment",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "alt-text",
    group: "accessibility",
    icon: "ImageWithText",
    title: "Alternate Text for Images",
    tagline: "Every image gets a voice \u2014 describe visuals for learners who can\u2019t see them.",
    description:
      "Images should never be invisible to learners who can\u2019t see them. CourseForge makes it easy to add meaningful alternate text directly in the image block \u2014 no separate dialog, no extra steps. When a screen reader encounters an image in the SCORM player or learner preview, it reads your alt text aloud, giving every visual a clear voice.",
    howItWorks: [
      {
        step: "Add an Image block",
        detail:
          "Insert an Image block from the media section of the block palette. The block immediately shows an Alt Text field alongside the image URL.",
      },
      {
        step: "Write a meaningful description",
        detail:
          "Describe what matters about the image in the context of the lesson \u2014 not just what it literally shows. Good alt text conveys meaning, not decoration.",
      },
      {
        step: "Leave decorative images blank",
        detail:
          'If an image is purely decorative and adds no informational value, leave alt text empty. CourseForge marks it with alt="" so screen readers correctly skip it.',
      },
      {
        step: "SCORM and preview render it correctly",
        detail:
          'Your alt text travels into the exported SCORM ZIP and the inline learner preview. Screen readers encounter a proper <img alt=\"...\"> in all output formats.',
      },
    ],
    highlights: [
      "Alt text field built directly into the Image block editing UI \u2014 no extra steps",
      'Alt text included in SCORM export HTML with correct <img alt=\'...\'> attribute',
      "Decorative images can use empty alt to signal screen readers to skip",
      "Also supported in Carousel blocks \u2014 per-image alt text for every slide",
      "Alt text exported as a translatable field in XLIFF for multilingual courses",
      "Hotspot images also carry an alt attribute for the base image",
    ],
    cta: { label: "Add an image block", href: "/course" },
  },
  {
    slug: "keyboard-navigation",
    group: "accessibility",
    icon: "Keyboard",
    title: "Keyboard-Accessible Learning",
    tagline: "Learners who rely on a keyboard \u2014 not a mouse \u2014 can navigate your course fully.",
    description:
      "CourseForge ensures learners who navigate with a keyboard can still move through your courses smoothly and confidently. Consistent tab order, visible focus rings, and keyboard-operable assessments mean that motor-impaired learners and those using alternative input devices get the same complete experience as any other learner.",
    howItWorks: [
      {
        step: "Consistent focus order",
        detail:
          "Learners can Tab through every interactive element \u2014 buttons, links, text inputs, quiz options, and media controls \u2014 in a predictable, logical order that follows the visual layout.",
      },
      {
        step: "Keyboard-operable assessments",
        detail:
          "All assessment types \u2014 MCQ, Knowledge Check, Fill in the Blank, Matching, Categorization, and Flashcards \u2014 can be fully operated with keyboard keys. No mouse click is ever the only way to interact.",
      },
      {
        step: "Visible focus indicators",
        detail:
          "Focus rings are preserved on all interactive elements so keyboard navigators always know exactly where they are on screen.",
      },
      {
        step: "Authoring keyboard shortcuts",
        detail:
          "The CourseBuilder itself is keyboard-friendly: Ctrl+S to save, Ctrl+Z/Y to undo/redo, Ctrl+H for Find & Replace, and Ctrl+V to paste blocks \u2014 reducing authoring friction for everyone.",
      },
    ],
    highlights: [
      "Full Tab key navigation through all interactive elements in the SCORM player",
      "Visible focus rings on buttons, links, inputs, and quiz controls",
      "All assessment types operable via keyboard \u2014 no mouse-only interactions",
      "Course navigation (prev/next) buttons are keyboard-reachable",
      "Keyboard shortcuts in the builder: Ctrl+S, Ctrl+Z/Y, Ctrl+H, Ctrl+V",
      "Supports learners with motor impairments and alternative input devices",
    ],
    cta: { label: "Try the editor", href: "/course" },
  },
  {
    slug: "rtl-support",
    group: "accessibility",
    icon: "Languages",
    title: "RTL Languages Support",
    tagline: "Courses in right\u2011to\u2011left languages look and feel natural \u2014 from text flow to navigation.",
    description:
      "CourseForge lets you reach new regions and audiences without compromising on usability or design. With RTL support, every course element \u2014 text, assessments, interactive blocks, and exported SCORM packages \u2014 behaves as learners of Arabic, Hebrew, Persian, Urdu, and other RTL languages expect.",
    howItWorks: [
      {
        step: "Correct text direction",
        detail:
          "Headings, body text, questions, and answers all flow right\u2011to\u2011left so RTL learners can read comfortably without any manual text-direction overrides.",
      },
      {
        step: "Mirrored layouts",
        detail:
          "Sidebars, navigation buttons, and progress indicators flip to follow RTL reading order while keeping your course design fully intact.",
      },
      {
        step: "Consistent interactive experience",
        detail:
          "Whether learners are reading content, answering a quiz, or exploring an interactive block, everything behaves as they expect in an RTL interface \u2014 with no jarring LTR islands.",
      },
      {
        step: "RTL\u2011ready SCORM export",
        detail:
          "Export SCORM packages with the correct language and text-direction settings so LMSs render your course natively. Build once, localize to RTL, and ship a version that feels truly native to RTL audiences.",
      },
    ],
    highlights: [
      "Full right\u2011to\u2011left text flow for all content block types",
      "Layout mirroring: navigation, sidebars, and progress indicators flip for RTL",
      "RTL-aware quiz and assessment rendering \u2014 options, feedback, and scoring all correct",
      "SCORM export includes correct lang and dir attributes for LMS compatibility",
      "No duplicate course required \u2014 build once and localize to RTL",
      "Supports Arabic, Hebrew, Persian, Urdu, and other RTL script languages",
    ],
    cta: { label: "Start building", href: "/course" },
  },

  // ── Responsive Authoring ──────────────────────────────────────────
  {
    slug: "responsive-authoring",
    group: "authoring",
    icon: "MonitorSmartphone",
    title: "Responsive Authoring",
    tagline: "Courses that look great on every device \u2014 without extra layout work.",
    description:
      "CourseForge automatically turns your courses into responsive experiences that look great on laptops, tablets, and phones. Every slide, image, video, and interaction adapts to the learner\u2019s screen so you don\u2019t have to think about breakpoints, device types, or mobile versions.",
    howItWorks: [
      {
        step: "Block-based layout",
        detail:
          "Courses are built from content blocks instead of rigid pages, so designs naturally reflow on different screen sizes without any manual adjustment.",
      },
      {
        step: "Smart media behaviour",
        detail:
          "Images, videos, and carousels resize gracefully, preserving readability and visual impact on small and large displays alike.",
      },
      {
        step: "Consistent look and feel",
        detail:
          "Themes keep typography, colours, and spacing balanced across breakpoints, giving learners a polished experience regardless of device.",
      },
      {
        step: "What you design is what learners see",
        detail:
          "The inline learner preview and SCORM player render identically \u2014 everything adapts automatically so you preview on one screen and know it looks right everywhere.",
      },
    ],
    highlights: [
      "Content blocks reflow naturally \u2014 no manual breakpoint or column tweaking",
      "Images, videos, and carousels scale gracefully on any screen size",
      "Typography and spacing stay balanced across desktop, tablet, and phone",
      "SCORM player and inline preview render identically on all devices",
      "No separate mobile course version needed \u2014 one build, all screens",
      "Interactions, quizzes, and hotspots are touch-friendly on mobile",
    ],
    cta: { label: "Start building", href: "/course" },
  },

  // ── Course Navigation ──────────────────────────────────────────
  {
    slug: "course-navigation",
    group: "authoring",
    icon: "Map",
    title: "Course Navigation",
    tagline: "Control how learners move through your course \u2014 menus, progress, and sequencing rules all in one place.",
    description:
      "CourseForge gives you full control over how learners navigate your content. Set up menus, progress indicators, and navigation rules that fit your instructional design \u2014 whether you want free exploration, a guided linear path, or locked sequences that enforce prerequisite completion.",
    howItWorks: [
      {
        step: "Choose a menu style",
        detail:
          "Pick from sidebar menus, hamburger menus, or minimal navigation to match your course structure and visual design.",
      },
      {
        step: "Track learner progress",
        detail:
          "Visual progress indicators show learners exactly where they are in the course, how much they\u2019ve completed, and what\u2019s still ahead.",
      },
      {
        step: "Configure sequential locking",
        detail:
          "Require learners to complete a section before advancing to the next, enforcing prerequisite logic and structured learning paths.",
      },
      {
        step: "Course nav block",
        detail:
          "Drop a Course Nav block into any slide to give learners a consistent, accessible way to jump between modules \u2014 fully styled by your active theme.",
      },
    ],
    highlights: [
      "Sidebar, hamburger, and minimal navigation menu styles",
      "Visual progress bar and completion indicators for learners",
      "Sequential locking \u2014 require section completion before advancing",
      "Free-exploration mode for self-directed learners",
      "Course Nav block available in the block palette for in-slide navigation",
      "Navigation styles inherit your active theme for a consistent look",
    ],
    cta: { label: "Start building", href: "/course" },
  },

  // ── Branding ───────────────────────────────────────────────────
  {
    slug: "custom-fonts",
    group: "authoring",
    icon: "WholeWord",
    title: "Custom Fonts",
    tagline: "Use the exact fonts your brand requires \u2014 Google Fonts or your own uploads.",
    description:
      "Typography is a key part of brand identity. CourseForge lets you import fonts from the Google Fonts library or upload your own font files, then apply custom typography to headings, body text, and UI elements across all your course content.",
    howItWorks: [
      {
        step: "Choose from Google Fonts",
        detail:
          "Search and import from 1,500+ fonts in the Google Fonts library directly inside the theme editor \u2014 no manual URL entry required.",
      },
      {
        step: "Upload your own font files",
        detail:
          "Upload WOFF, WOFF2, TTF, or OTF files for complete brand control when your typeface isn\u2019t available in any public library.",
      },
      {
        step: "Set font pairing",
        detail:
          "Assign different fonts to headings, body text, and UI elements independently so your typographic hierarchy is intentional and on-brand.",
      },
      {
        step: "Fonts travel with your export",
        detail:
          "Custom fonts are bundled into your SCORM export so learners see the correct typography in any LMS, even without internet access.",
      },
    ],
    highlights: [
      "1,500+ Google Fonts searchable and importable from inside the editor",
      "Upload WOFF, WOFF2, TTF, and OTF font files for full brand control",
      "Separate font settings for headings, body, captions, and UI labels",
      "Font choices saved as part of your reusable course theme",
      "Custom fonts bundled into SCORM export for offline LMS rendering",
      "Live preview updates as you change fonts \u2014 no save-and-reload cycle",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "course-themes",
    group: "authoring",
    icon: "Swatch",
    title: "Course Themes",
    tagline: "Design once, apply everywhere \u2014 branded themes for every course.",
    description:
      "Build themes that capture your brand\u2019s visual identity and apply them to any course with one click. Colors, fonts, and styles all update together, giving you a consistent learner experience across your entire catalogue without rebuilding anything.",
    howItWorks: [
      {
        step: "Define your color palette",
        detail:
          "Set primary, secondary, accent, and background colors to match your brand guidelines. Full color control over every UI element in the course.",
      },
      {
        step: "Configure typography",
        detail:
          "Set fonts for headings, body text, and captions. Combine with CourseForge\u2019s Custom Fonts feature to use Google Fonts or your own uploads.",
      },
      {
        step: "Save and reuse",
        detail:
          "Save your theme to the theme library and apply it to any course instantly. Switch themes on existing courses without rebuilding a single slide.",
      },
      {
        step: "Build a theme library",
        detail:
          "Create multiple themes \u2014 one per client, brand, or project \u2014 and keep them all in your library ready to apply in one click.",
      },
    ],
    highlights: [
      "Full color control \u2014 primary, secondary, accent, background, and text colors",
      "Typography settings for headings, body text, and captions",
      "Save themes to a reusable library for consistent branding across courses",
      "Quick-apply: switch themes on existing courses without rebuilding",
      "Theme library supports multiple brands, clients, or projects",
      "All theme settings \u2014 colors, fonts, spacing \u2014 update together on apply",
    ],
    cta: { label: "Start building", href: "/course" },
  },

  // ── Localization ───────────────────────────────────────────────
  {
    slug: "xliff-workflows",
    group: "localization",
    icon: "FileCode2",
    title: "XLIFF Translation Workflows",
    tagline: "Export content to industry-standard XLIFF for professional translation, then import back in one click.",
    description:
      "Send XLIFF files to your translation team or agency without any custom tooling. CourseForge exports all translatable course content in XLIFF 1.2, 2.0, or 2.1 format \u2014 headings, paragraphs, questions, feedback, and UI labels \u2014 and imports completed translations back instantly, preserving all rich text formatting through the round trip.",
    howItWorks: [
      {
        step: "Export to XLIFF",
        detail:
          "Choose XLIFF 1.2, 2.0, or 2.1 and export all translatable content from your course in one file, ready to send to any professional translation team or agency.",
      },
      {
        step: "Translate externally",
        detail:
          "Your translators work in their preferred CAT tools (SDL Trados, memoQ, Phrase, etc.) using the industry-standard XLIFF format they already know.",
      },
      {
        step: "Import completed translations",
        detail:
          "When translations come back, import the completed XLIFF file and CourseForge applies every translated string to the correct block \u2014 no manual copy-paste needed.",
      },
      {
        step: "Formatting preserved end-to-end",
        detail:
          "Bold, italic, links, and other inline rich-text markup survive the translation round trip intact, so your course looks right in every language.",
      },
    ],
    highlights: [
      "XLIFF 1.2, 2.0, and 2.1 export formats supported",
      "All translatable content exported: headings, body, questions, feedback, and UI labels",
      "One-click import applies every translated string to the correct block automatically",
      "Rich text formatting (bold, italic, links) preserved through the full round trip",
      "Compatible with SDL Trados, memoQ, Phrase, and other major CAT tools",
      "Combine with the localization panel to manage all language versions in one place",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "content-localization",
    group: "localization",
    icon: "Globe2",
    title: "Content Localization",
    tagline: "One course, multiple languages \u2014 manage every locale from a single localization panel.",
    description:
      "CourseForge lets you translate not just interface labels, but the actual learning content \u2014 headings, paragraphs, questions, feedback, and more. Each language gets its own version of the course while sharing the same structure, navigation, and assessments. Manage all locales from one panel, use AI to generate first-pass drafts, and preview any locale as learners will see it.",
    howItWorks: [
      {
        step: "Add locales",
        detail:
          "Create language entries (English, French, Spanish, Arabic, and more) for the same course from the localization panel. Each locale shares the base structure \u2014 only the text changes.",
      },
      {
        step: "Translate block by block",
        detail:
          "Switch to any locale and translate the text inside your existing blocks. Layouts, media, and interactions stay in sync across all languages automatically.",
      },
      {
        step: "Speed up with AI drafts",
        detail:
          "Use integrated AI translation assistance to generate first-pass translations you can then refine and approve, cutting the time needed before handing off to a human reviewer.",
      },
      {
        step: "Preview in any locale",
        detail:
          "Switch locale in the course preview to see exactly how learners will experience the localized version \u2014 navigation, UI labels, and content all shown together.",
      },
    ],
    highlights: [
      "Unlimited locales per course \u2014 manage all languages from one panel",
      "Block-by-block translation: layouts, media, and interactions stay aligned across locales",
      "Set a default language while offering additional localized variants",
      "AI-assisted first-pass translation drafts for faster turnaround",
      "Switch locale in the preview to verify the full learner experience",
      "Works alongside XLIFF workflows for agency or team translation handoffs",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "custom-labels",
    group: "localization",
    icon: "Tag",
    title: "Custom Labels & Interface Text",
    tagline: "Tailor every button, prompt, and message to match your tone of voice.",
    description:
      "The words learners see in a course \u2014 buttons, messages, and prompts \u2014 are part of the learning experience. CourseForge lets you rename key actions and adjust system messages so the interface fits your organisation\u2019s terminology, style, and tone of voice.",
    howItWorks: [
      {
        step: "Rename key actions",
        detail:
          "Change labels like \u2018Next\u2019, \u2018Submit answer\u2019, or \u2018Finish\u2019 so they match your organisation\u2019s terminology and instructional style.",
      },
      {
        step: "Align tone and clarity",
        detail:
          "Adjust system messages to be more formal, more friendly, or more instructional \u2014 whatever best serves your audience and brand.",
      },
      {
        step: "Localise labels per language",
        detail:
          "Custom labels are scoped per locale, so your French learners see \u2018Suivant\u2019 while English learners see \u2018Next\u2019 \u2014 both customised to your voice.",
      },
      {
        step: "Export with localised labels",
        detail:
          "Exported SCORM packages carry your custom labels for each locale so learners experience both content and UI in their preferred language.",
      },
    ],
    highlights: [
      "Rename navigation labels: Next, Previous, Submit, Finish, and more",
      "Customise feedback messages, error prompts, and completion notices",
      "Labels scoped per locale \u2014 each language version keeps its own custom text",
      "Tone control: adjust formality to match your brand voice",
      "Custom labels bundled into SCORM export for every locale",
      "Changes visible immediately in the inline learner preview",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "localized-exports",
    group: "localization",
    icon: "PackageCheck",
    title: "Exporting Localised Courses",
    tagline: "Export the exact language version you need \u2014 one clean SCORM package per locale.",
    description:
      "Once your translations are in place, CourseForge makes it straightforward to export the right language version of your course as a standard SCORM package. Every export keeps the same slides, blocks, and assessments \u2014 changing only the labels and content language \u2014 and carries the correct language and text-direction metadata so LMSs display it correctly.",
    howItWorks: [
      {
        step: "Pick your locale to export",
        detail:
          "Choose which language version to export \u2014 English, French, Arabic, and more \u2014 without duplicating the whole course or managing separate copies.",
      },
      {
        step: "Same structure, different language",
        detail:
          "Every export keeps the same slides, blocks, and assessments. Only the text content and UI labels change to match the chosen locale.",
      },
      {
        step: "Correct LMS metadata",
        detail:
          "Exported packages carry the right language and text-direction (`lang`, `dir`) HTML attributes so LMSs render them correctly \u2014 including full RTL support for Arabic and other RTL languages.",
      },
      {
        step: "No duplicated authoring work",
        detail:
          "Build once, manage all translations in the localization panel, and generate as many per-language SCORM exports as you need from that single source.",
      },
    ],
    highlights: [
      "Per-locale SCORM export \u2014 pick the language version at export time",
      "Identical course structure across all exports: same slides, blocks, assessments",
      "Correct `lang` and `dir` HTML metadata for proper LMS rendering",
      "Full RTL metadata included for Arabic, Hebrew, Persian, and other RTL locales",
      "No duplicate course copies \u2014 one source, unlimited language exports",
      "Works with XLIFF import to complete the full translation-to-export pipeline",
    ],
    cta: { label: "Export a course", href: "/course" },
  },

  // ── Course Review ──────────────────────────────────────────────
  {
    slug: "course-review",
    group: "collaboration",
    icon: "MessageCircleMore",
    title: "Course Review",
    tagline: "Review and sign-off built into the authoring workspace \u2014 no exports, no email chains.",
    description:
      "CourseForge makes review and sign-off a built-in part of authoring, not an afterthought. Invite teammates and stakeholders into the same workspace so they can see the latest version of a course, leave structured feedback on any slide or block, and help get it ready for release \u2014 all without leaving the platform.",
    howItWorks: [
      {
        step: "Invite reviewers via email",
        detail:
          "Share access with subject-matter experts and stakeholders via email invitations. Reviewers get a realistic learner view so they can check copy, flow, and interactions before launch.",
      },
      {
        step: "Comment on slides and blocks",
        detail:
          "Add comments on an entire slide or tie them to a specific block \u2014 a quiz question, an image, a heading. Threaded conversations keep replies and resolutions together so nothing gets lost.",
      },
      {
        step: "Manage the review cycle",
        detail:
          "Use statuses (open, in progress, resolved), priorities, and filters to stay on top of feedback across complex courses with multiple stakeholders. Search by text or author to find any discussion instantly.",
      },
      {
        step: "Edit, re-preview, and sign off",
        detail:
          "Make edits in place and re-preview instantly until everyone is satisfied. Publishing becomes a confident last step, not a gamble.",
      },
    ],
    highlights: [
      "Email invitations for subject-matter experts and stakeholders",
      "Collaboration roles: Course Owner, Editor, and Reviewer",
      "Slide-level and block-level comments with threaded replies",
      "Comment statuses (open, in progress, resolved) and priority flags",
      "Filter and search comments by text or author across the whole course",
      "Realistic learner preview for reviewers \u2014 including navigation and assessments",
    ],
    cta: { label: "Invite your team", href: "/course" },
  },

  // ── Publishing & Export ──────────────────────────────────────────
  {
    slug: "publishing-export",
    group: "export",
    icon: "SendHorizonal",
    title: "Publishing & Export",
    tagline: "Export to SCORM, HTML, xAPI, or a share link \u2014 one click to publish anywhere.",
    description:
      "CourseForge gives you the flexibility to deliver courses through any channel. Export SCORM 1.2 or 2004 packages for any LMS, generate HTML packages for web hosting, produce xAPI packages for Learning Record Stores, or generate a shareable preview link for instant stakeholder review \u2014 all from the same course, with no rebuilding.",
    howItWorks: [
      {
        step: "Choose your output format",
        detail:
          "Pick SCORM 1.2, SCORM 2004, xAPI, or HTML at export time. Each format is generated from the same source course so you never need to build separate versions.",
      },
      {
        step: "Export for your LMS",
        detail:
          "Download a SCORM-compliant ZIP file and upload it to any LMS \u2014 Moodle, Canvas, Cornerstone, Docebo, SAP SuccessFactors, and more. Completion and grade data are reported back automatically.",
      },
      {
        step: "Publish to the web",
        detail:
          "Generate a self-contained HTML package for hosting on your own server, intranet, or CDN. Includes an embed code so any page can host the course in an iframe.",
      },
      {
        step: "Share a preview link",
        detail:
          "Generate a shareable link for stakeholder review in seconds. No LMS, no login required \u2014 reviewers open the link and see the course exactly as learners will.",
      },
    ],
    highlights: [
      "SCORM 1.2 and SCORM 2004 export compatible with any LMS",
      "xAPI export for Learning Record Stores and richer activity tracking",
      "Self-contained HTML package with embed code for web hosting",
      "Shareable preview link for stakeholder review \u2014 no login needed",
      "All formats generated from the same source course \u2014 no rebuilding",
      "Custom fonts, media, and RTL metadata bundled into every export",
    ],
    cta: { label: "Export a course", href: "/course" },
  },
  {
    slug: "flexible-completion",
    group: "export",
    icon: "ListChecks",
    title: "Flexible Completion & Grading",
    tagline: "Define exactly what \u2018course complete\u2019 means for your organisation.",
    description:
      "Every organisation measures success differently. CourseForge lets you configure completion rules, grade cutoffs, and advanced grading policies so pass/fail decisions align with your standards \u2014 whether that\u2019s finishing a set of slides, passing a quiz, or meeting a weighted grade across multiple assessment categories.",
    howItWorks: [
      {
        step: "Set your completion rule",
        detail:
          "Define completion based on slides viewed, assessments passed, or both together. Mix and match criteria to fit your instructional design.",
      },
      {
        step: "Configure slide progress thresholds",
        detail:
          "Set a minimum percentage of slides that must be visited before the course counts as complete \u2014 useful for compliance content where full coverage matters.",
      },
      {
        step: "Define grade cutoffs",
        detail:
          "Configure pass/fail grade cutoffs with an intuitive percentage scale so learner outcomes align with your organisation\u2019s policies.",
      },
      {
        step: "Apply advanced grading policies",
        detail:
          "Use weighted assessment categories \u2014 quizzes, assignments, final exams \u2014 for sophisticated grading programmes that reflect the relative importance of each assessment type.",
      },
    ],
    highlights: [
      "Completion rules: slides viewed, assessments passed, or both combined",
      "Minimum slide progress threshold for compliance-style completion",
      "Pass/fail grade cutoff configured as a percentage",
      "Weighted assessment categories for multi-component grading",
      "Completion and grade data reported to LMS via SCORM or xAPI",
      "Rules set per course so different programmes can have different standards",
    ],
    cta: { label: "Configure your course", href: "/course" },
  },
  {
    slug: "multiple-output-formats",
    group: "export",
    icon: "Layers2",
    title: "Multiple Output Formats",
    tagline: "SCORM, xAPI, HTML, or a share link \u2014 one course, every delivery channel.",
    description:
      "Whether you need SCORM for your LMS, HTML for your website, xAPI for a Learning Record Store, or a shareable link for quick review \u2014 CourseForge has you covered. Every format is generated from the same source course so you always have a consistent, up-to-date version wherever learners access it.",
    howItWorks: [
      {
        step: "SCORM export",
        detail:
          "Export SCORM 1.2 or 2004 packages compatible with any LMS. Completion, score, and progress data are reported back automatically through the standard SCORM runtime.",
      },
      {
        step: "Web publishing",
        detail:
          "Generate a self-contained HTML package for self-hosting, or use the embed code to drop the course into any web page or intranet portal.",
      },
      {
        step: "xAPI export",
        detail:
          "Export xAPI (Tin Can) packages for Learning Record Stores that need richer learner activity tracking beyond what SCORM supports.",
      },
      {
        step: "Share links",
        detail:
          "Generate a shareable preview link for stakeholder review or informal distribution. Recipients click the link and experience the course as a learner \u2014 no account required.",
      },
    ],
    highlights: [
      "SCORM 1.2 and SCORM 2004 \u2014 compatible with all major LMSs",
      "xAPI (Tin Can) export for Learning Record Stores",
      "Self-contained HTML package with embed code for web hosting",
      "Shareable preview links for review or informal distribution",
      "All formats generated from the same source \u2014 no duplicate courses",
      "Custom completion rules and grade settings travel with every export",
    ],
    cta: { label: "Export a course", href: "/course" },
  },

  // ── Assessments & Quizzes ─────────────────────────────────────────
  {
    slug: "assessments-quizzes",
    group: "assessments",
    icon: "ClipboardCheck",
    title: "Assessments & Quizzes",
    tagline: "Move from content-only to truly measurable learning \u2014 without a separate quiz tool.",
    description:
      "CourseForge\u2019s built-in assessment blocks let you check understanding, track performance, and feed meaningful results back into your LMS. Multiple question types, smart attempt controls, partial credit, and SCORM-ready scoring are all included \u2014 no plugins or third-party tools required.",
    howItWorks: [
      {
        step: "Choose the right question type",
        detail:
          "Mix and match multiple-choice, multi-response, fill-in-the-blank, matching, click-on-image, and scenario-based success meter questions within a single course to keep assessments varied and engaging.",
      },
      {
        step: "Configure scoring and pass criteria",
        detail:
          "Set pass scores, grade cutoffs, and assessment weights so each quiz or activity contributes to the final course result exactly the way you intend \u2014 no code needed.",
      },
      {
        step: "Control attempts and feedback",
        detail:
          "Choose how many attempts learners get, when they see correct answers, and whether partial credit applies \u2014 all from the block settings panel.",
      },
      {
        step: "Report results to your LMS",
        detail:
          "Scores, attempts, completion status, and session continuity data are packaged in a way LMSs understand via SCORM or xAPI, so your reporting dashboards stay trustworthy and accurate.",
      },
    ],
    highlights: [
      "Multiple-choice and multi-response questions for quick checks and formal tests",
      "Fill-in-the-blank with support for multiple correct answers and partial credit",
      "Drag-style matching interactions for concepts, definitions, and visuals",
      "Click-on-image questions \u2014 ideal for diagrams, interfaces, and real-world scenarios",
      "Scenario-based success meter questions to assess judgement and decision-making",
      "SCORM/xAPI-ready scoring: scores, attempts, and completion reported to any LMS",
    ],
    cta: { label: "Add an assessment", href: "/course" },
  },

  // ── Block Authoring Detail ─────────────────────────────────────────
  {
    slug: "block-based-authoring",
    group: "authoring",
    icon: "LayoutPanelLeft",
    title: "Block-Based Authoring",
    tagline: "Build courses like stacking building blocks \u2014 drop, arrange, and rearrange at any time.",
    description:
      "CourseForge lets you build courses by dropping in text, media, interactions, and navigation elements exactly where you want them, then rearranging them at any time. You never have to fight a rigid template or layout system \u2014 duplicate slides, swap layouts, or introduce new interactions without rebuilding from the ground up.",
    howItWorks: [
      {
        step: "Start from rich presets",
        detail:
          "Choose from presets like \u2018Image & Text\u2019, \u2018Flashcard Stack\u2019, \u2018Resources Grid\u2019, or \u2018Slide Intro\u2019 instead of building every screen from scratch. Presets give you a strong starting point you can immediately customise.",
      },
      {
        step: "Drop and arrange blocks",
        detail:
          "Add text, media, interactive, assessment, and navigation blocks to any slide in any order. Drag to reorder, duplicate, or delete \u2014 everything is reversible.",
      },
      {
        step: "Fine-tune visual details",
        detail:
          "Adjust width, alignment, spacing, animations, and button styles through simple settings panels instead of custom design work. No CSS required.",
      },
      {
        step: "Control learning behaviour per block",
        detail:
          "Decide how each block contributes to progress: some complete on view, others on interaction or successful quiz completion, so tracking stays meaningful.",
      },
    ],
    highlights: [
      "Text & layout blocks: headings, paragraphs, two-column, accordions, tabs",
      "Media blocks: images, video, audio, carousels, hotspot images, web simulations",
      "Assessment blocks: MCQ, fill-in-the-blank, matching, click-on-image, success meter",
      "Navigation blocks: slide intros, separators, nav buttons, resource lists",
      "Rich presets for common screen types \u2014 no blank-canvas paralysis",
      "Per-block learning behaviour: complete on view, interaction, or quiz pass",
    ],
    cta: { label: "Start building", href: "/course" },
  },
  {
    slug: "images",
    group: "authoring",
    icon: "Images",
    title: "Images",
    tagline: "Millions of professional photos, smart cropping, and AI-generated visuals \u2014 all in one block.",
    description:
      "CourseForge gives you flexible image block variants for every layout need, access to a searchable library of millions of royalty-free photos, smart cropping and alignment controls, and AI-assisted image generation \u2014 so every visual fits naturally into your course without separate design work.",
    howItWorks: [
      {
        step: "Search the photo library",
        detail:
          "Find the perfect visual in seconds by searching millions of high-quality, royalty-free photos by keyword, then drop them straight into your course.",
      },
      {
        step: "Choose your image variant",
        detail:
          "Pick the layout that fits your content: full-width hero, image-and-text, grid, or carousel. Each variant adapts to your theme and looks great on any screen size.",
      },
      {
        step: "Adjust cropping and alignment",
        detail:
          "Control focus point, aspect ratio, alignment, and size so each image fits perfectly into its layout without distorting or cutting off important details.",
      },
      {
        step: "Generate with AI",
        detail:
          "Generate on-brand images from a simple text prompt and fine-tune them with your course colours \u2014 useful when stock photos don\u2019t quite fit.",
      },
    ],
    highlights: [
      "Full-width hero, image-and-text, grid, and carousel image block variants",
      "Searchable library of millions of royalty-free photos \u2014 drop in without leaving the editor",
      "Smart cropping: control focus point, aspect ratio, and alignment",
      "AI image generation from a text prompt, styled to your course theme",
      "Upload your own images and reuse them across courses from the media library",
      "All image variants are fully responsive on desktop, tablet, and mobile",
    ],
    cta: { label: "Add an image block", href: "/course" },
  },
  {
    slug: "video",
    group: "authoring",
    icon: "Film",
    title: "Video",
    tagline: "Embed from YouTube and Vimeo, or host your own \u2014 video as a first-class learning block.",
    description:
      "CourseForge turns video into the centrepiece of a learning experience. Drop in a YouTube or Vimeo link to keep the viewing experience familiar, or upload your own files so everything lives in one place. The player aligns with your course theme so videos feel like part of your brand, not an external embed.",
    howItWorks: [
      {
        step: "Embed from a platform",
        detail:
          "Paste a link from YouTube, Vimeo, or other major video hosts. The block handles the embed automatically and the player adapts to your course layout.",
      },
      {
        step: "Upload your own video",
        detail:
          "Host training videos, product walkthroughs, or intro recordings directly in CourseForge so learners never leave your course to watch something.",
      },
      {
        step: "Match your brand",
        detail:
          "Player accents inherit your active course theme so the video block looks like an intentional part of the design, not a third-party widget.",
      },
      {
        step: "Set completion behaviour",
        detail:
          "Mark the video block as required viewing and configure whether progress counts on play, on reaching a certain percentage watched, or on full completion.",
      },
    ],
    highlights: [
      "Embed from YouTube, Vimeo, and other major video platforms",
      "Upload and host your own video files directly in CourseForge",
      "Branded player \u2014 accent colours follow your active course theme",
      "Completion behaviour: count progress on play, percentage watched, or full view",
      "Responsive player that looks great on desktop, tablet, and mobile",
      "Videos stored in the media library and reusable across courses",
    ],
    cta: { label: "Add a video block", href: "/course" },
  },
  {
    slug: "audio",
    group: "authoring",
    icon: "Headphones",
    title: "Audio",
    tagline: "Voice-over, podcasts, and narration \u2014 with a clean player that works everywhere.",
    description:
      "Add a rich layer of sound to your courses without making learners wrestle with clunky players. CourseForge\u2019s audio block gives learners a sleek bar with play, pause, seek, speed control, and optional transcript \u2014 tailored for narration, podcast-style explainers, or ambient background sound.",
    howItWorks: [
      {
        step: "Upload or link your audio",
        detail:
          "Upload MP3 or WAV files directly, or link to an external audio source. Files go into your media library for reuse across any course.",
      },
      {
        step: "Learners get a clean player",
        detail:
          "A sleek audio bar with clear play, pause, and seek controls works beautifully on desktop and mobile without taking up excessive screen space.",
      },
      {
        step: "Enable speed and scrubbing",
        detail:
          "Let learners listen faster, replay key moments, or jump back and forth in small increments to review important content at their own pace.",
      },
      {
        step: "Attach an optional transcript",
        detail:
          "Provide a transcript learners can open when they need to read along, scan for specific information, or access the content without sound.",
      },
    ],
    highlights: [
      "Upload MP3/WAV files or link external audio sources",
      "Sleek, accessible audio bar with play, pause, and seek controls",
      "Playback speed control and small-increment scrubbing",
      "Optional collapsible transcript for accessibility and scanning",
      "Themed player \u2014 accent colours follow your active course theme",
      "Audio files stored in the media library and reusable across courses",
    ],
    cta: { label: "Add an audio block", href: "/course" },
  },
  {
    slug: "documents-downloads",
    group: "authoring",
    icon: "FolderOpen",
    title: "Documents & Downloads",
    tagline: "Attach supporting materials to any slide \u2014 PDFs, worksheets, slides, and more.",
    description:
      "CourseForge lets you attach supporting materials directly to your courses without losing track of files. Group links, documents, and references into a dedicated Resources section on any slide, present them as a clean list or a card-style grid, and back everything with a central media library so files are uploaded once and reused everywhere.",
    howItWorks: [
      {
        step: "Add a Resources block",
        detail:
          "Drop a Resources block onto any slide and add files, links, and references. Choose between a list layout for simplicity or a card grid for a more visual presentation.",
      },
      {
        step: "Upload to the media library",
        detail:
          "Upload PDFs, Word documents, spreadsheets, or slide decks once and they\u2019re available to attach to any course or module \u2014 no re-uploading needed.",
      },
      {
        step: "Add context with icons and descriptions",
        detail:
          "Each resource entry supports an icon, title, and short description so learners know exactly what they\u2019re downloading before they click.",
      },
      {
        step: "Learners download or open inline",
        detail:
          "PDFs can open inline in the course for quick reading, or learners can download files directly to their device \u2014 your choice per resource.",
      },
    ],
    highlights: [
      "Resources block available on any slide \u2014 list or card-grid layout",
      "Supports PDFs, Word docs, spreadsheets, slide decks, and external links",
      "Media library: upload once, reuse across any course or module",
      "Per-resource icon, title, and description for clear learner guidance",
      "Inline preview or direct download \u2014 configurable per resource",
      "Resource blocks styled by your active course theme",
    ],
    cta: { label: "Add a resources block", href: "/course" },
  },

  // ── Content Blocks ────────────────────────────────────────────────────────
  {
    slug: "table-block",
    group: "authoring",
    icon: "Table2",
    title: "Table Block",
    tagline: "Present structured data, comparisons, and schedules in clean, readable tables.",
    description:
      "The Table block brings full rich-text table editing into your course slides. Add rows and columns, apply cell colours, use bold, italic, and links inside cells, and choose from striped, compact, or bordered display options — all without leaving the editor. Tables render in both the course builder preview and every export format.",
    howItWorks: [
      {
        step: "Insert a Table block",
        detail:
          "Drop a Table block onto any slide from the block palette. The block opens with a default grid you can immediately start editing.",
      },
      {
        step: "Edit with the rich text toolbar",
        detail:
          "Add and remove rows and columns from the toolbar. Apply cell background and text colours, bold, italic, and links — the same rich editor you already know, extended with table support.",
      },
      {
        step: "Resize and customise layout",
        detail:
          "Drag column borders to resize them. Switch between striped rows, compact mode, and bordered or borderless styles to match your course design.",
      },
      {
        step: "Export anywhere",
        detail:
          "Tables render identically in the course builder preview, SCORM exports, and HTML exports. They also support content variables and entrance animations like every other block.",
      },
    ],
    highlights: [
      "Add and remove rows and columns from the inline toolbar",
      "Cell background and text colours for visual emphasis",
      "Rich text inside cells — bold, italic, links, and more",
      "Resizable columns by dragging borders",
      "Striped rows, compact mode, and bordered/borderless display options",
      "Tables render in both SCORM and HTML exports with full fidelity",
    ],
    cta: { label: "Add a table block", href: "/course" },
  },
  {
    slug: "pdf-viewer",
    group: "authoring",
    icon: "FileText",
    title: "PDF Viewer Block",
    tagline: "Embed PDF documents directly into slides — no external links, no file hunting.",
    description:
      "The PDF Viewer block lets you embed documents directly inside your courses so learners never have to leave the slide to access reference materials. Upload a PDF or paste a URL, add page navigation controls, and optionally let learners download the file — all in a responsive, high-DPI viewer that looks sharp on every screen.",
    howItWorks: [
      {
        step: "Upload or link your PDF",
        detail:
          "Upload a PDF file directly into your media library or paste a URL to an externally hosted document. The viewer renders it automatically.",
      },
      {
        step: "Add to any slide",
        detail:
          "Drop a PDF Viewer block onto any slide. The document appears inline with page-by-page navigation controls so learners browse without scrolling past the block.",
      },
      {
        step: "Configure display settings",
        detail:
          "Toggle the page count indicator, enable or disable the download button, and set the viewer height to fit your slide layout.",
      },
      {
        step: "Responsive and high-DPI",
        detail:
          "The viewer scales to any container width while preserving the document's aspect ratio. High-DPI rendering ensures sharp text and graphics on retina displays.",
      },
    ],
    highlights: [
      "Upload PDFs to the media library or link external URLs",
      "Page-by-page navigation with intuitive previous/next controls",
      "Optional download button for offline learner access",
      "Responsive viewer — scales to container width, preserves aspect ratio",
      "High-DPI rendering for sharp text on retina and 4K displays",
      "Renders in both SCORM and HTML export formats",
    ],
    cta: { label: "Add a PDF viewer", href: "/course" },
  },
  {
    slug: "web-simulation",
    group: "authoring",
    icon: "MonitorPlay",
    title: "Web Simulation Block",
    tagline: "Guide learners through software and interfaces step-by-step with interactive screenshots.",
    description:
      "The Web Simulation block transforms static screenshots into guided, clickable walkthroughs of websites and applications. Define hotspots for each step, add tooltips, write a welcome message, and let learners explore at their own pace — perfect for software training, product demos, and onboarding without live software access.",
    howItWorks: [
      {
        step: "Add screenshots as simulation steps",
        detail:
          "Upload a screenshot for each step of the workflow. Steps can link linearly or branch to support non-linear exploration.",
      },
      {
        step: "Define clickable hotspots",
        detail:
          "Draw interactive areas on each screenshot and assign tooltips that guide learners to the next step. Toggle hotspot visibility to show highlighted zones or keep them invisible with pointer hints.",
      },
      {
        step: "Add welcome and completion messages",
        detail:
          "Write a rich HTML introduction and a completion message so learners know what to expect and get a sense of achievement when they finish.",
      },
      {
        step: "Track progress in SCORM",
        detail:
          "Simulation state — which steps learners have completed — is persisted in SCORM suspend data and restored on resume so sessions carry over across LMS logins.",
      },
    ],
    highlights: [
      "Multi-step screenshot walkthroughs with unlimited steps",
      "Clickable hotspots with custom tooltips guiding learners to the next step",
      "Toggle hotspot visibility — highlighted zones or invisible pointer hints",
      "Visual progress bar showing learner's journey through the simulation",
      "Rich welcome and completion messages with custom HTML content",
      "Full SCORM state persistence — simulation resumes where learners left off",
    ],
    cta: { label: "Try a simulation", href: "/course" },
  },
  {
    slug: "time-requirements",
    group: "authoring",
    icon: "Timer",
    title: "Time Requirements Block",
    tagline: "Enforce minimum time-on-task without locking learners out — essential for compliance training.",
    description:
      "The Time Requirements block prevents learners from rushing through content by requiring a configurable minimum time on a slide before the block completes. Elapsed time is tracked per learner and persisted through SCORM suspend data so resuming a session picks up exactly where it left off — no re-counting from zero.",
    howItWorks: [
      {
        step: "Add a Time Requirements block",
        detail:
          "Drop the block onto any compliance slide from the navigation and control section of the block palette.",
      },
      {
        step: "Set the required duration",
        detail:
          "Configure the minimum time in minutes (or seconds for shorter gates). Learners must spend at least that long on the slide before the block marks complete.",
      },
      {
        step: "Show optional progress feedback",
        detail:
          "Enable the progress display to show learners how much time has elapsed and how much remains — reducing frustration from waiting without feedback.",
      },
      {
        step: "Resume-safe tracking",
        detail:
          "Elapsed time is stored in SCORM suspend data so learners who leave mid-session don't lose their accumulated time when they return.",
      },
    ],
    highlights: [
      "Configurable minimum time requirement in minutes or seconds",
      "Optional elapsed/remaining progress display for learners",
      "'Hide on completed' option removes the block after the time requirement is met",
      "Attempt-based completion — once time is reached the block completes",
      "Time tracked per learner and persisted via SCORM suspend data",
      "Ideal for compliance training where time-on-task must be enforced",
    ],
    cta: { label: "Build a compliance course", href: "/course" },
  },
  {
    slug: "course-sections",
    group: "authoring",
    icon: "FolderTree",
    title: "Course Sections",
    tagline: "Organise long courses into logical groups for authors and learners alike.",
    description:
      "Sections let you group related slides together into named, collapsible units inside the course editor. Whether you're building a multi-module training or a structured learning path, sections make it faster to navigate while authoring and give learners a clear, organised structure in the SCORM player.",
    howItWorks: [
      {
        step: "Create a section",
        detail:
          "Click 'New Section' in the slides panel. Give it a title and icon from the section menu, then drag existing slides into it or add new ones directly.",
      },
      {
        step: "Collapse and expand",
        detail:
          "Collapse sections you're not working on to keep the slide panel tidy. Expand to reveal the slides inside. Long courses become much easier to navigate in the editor.",
      },
      {
        step: "Drag-and-drop organisation",
        detail:
          "Drag slides into, out of, and between sections with clear visual drop indicators. Mix standalone slides and sections freely in any order.",
      },
      {
        step: "Learners see the same structure",
        detail:
          "Sections are fully supported in SCORM exports. Learners see the same organised structure in their LMS — grouped content with clear labels and hierarchy.",
      },
    ],
    highlights: [
      "Named, collapsible sections in the slide panel for clean course organisation",
      "Customisable section title and icon from the section properties menu",
      "Drag-and-drop: move slides into, out of, and between sections",
      "Mix standalone slides and sections freely in any order",
      "Sections fully supported in SCORM and HTML exports",
      "Learners see the same organised structure in their LMS",
    ],
    cta: { label: "Structure a course", href: "/course" },
  },
  {
    slug: "custom-css",
    group: "authoring",
    icon: "Code2",
    title: "Custom CSS",
    tagline: "Fine-tune your course's visual appearance with theme-level and course-level CSS.",
    description:
      "For when theme settings aren't enough, CourseForge gives you a built-in CSS editor at both the theme level and the course level. Add custom styles that apply across all your themed courses, then override at the course level for specific exceptions — without touching the shared theme.",
    howItWorks: [
      {
        step: "Write theme-level CSS",
        detail:
          "Open Theme Customizer → Advanced → Custom CSS. Styles written here apply to every course using that theme, including previews and all export formats.",
      },
      {
        step: "Override per course",
        detail:
          "Open Course Settings → Advanced → Course Custom CSS. This CSS is applied after your theme CSS and affects only the current course — the shared theme stays unchanged.",
      },
      {
        step: "Edit with a full-featured editor",
        detail:
          "The built-in CSS editor includes syntax highlighting and an expanded dialog mode for more comfortable editing of longer stylesheets.",
      },
      {
        step: "Styles travel with exports",
        detail:
          "Both theme CSS and course CSS are merged and injected into slide editor previews and all export outputs — SCORM, HTML, and share links.",
      },
    ],
    highlights: [
      "Theme-level Custom CSS in Theme Customizer → Advanced",
      "Course-level CSS override in Course Settings → Advanced — doesn't affect the shared theme",
      "Built-in CSS editor with syntax highlighting and expanded dialog mode",
      "Theme CSS and course CSS merged automatically — duplicate segments deduplicated",
      "CSS injected into slide editor previews and all export formats",
      "Ideal for pixel-perfect brand alignment that theme settings alone can't achieve",
    ],
    cta: { label: "Customise a theme", href: "/course" },
  },
  {
    slug: "ai-captions",
    group: "authoring",
    icon: "Mic2",
    title: "AI Captions & Transcripts",
    tagline: "Auto-generate captions and transcripts for video and audio blocks in seconds.",
    description:
      "CourseForge uses AI to automatically generate VTT caption files for video blocks and text transcripts for audio uploads. Review and edit cues in the built-in caption editor before publishing, or upload your own subtitle file when you prefer full manual control. Captions and transcripts improve accessibility, speed up localisation, and make it easier to reuse media across courses.",
    howItWorks: [
      {
        step: "Generate captions or a transcript",
        detail:
          "Open any video or audio block and click 'Generate captions' or 'Generate transcript'. AI processes your media and produces a draft in seconds.",
      },
      {
        step: "Edit in the built-in caption editor",
        detail:
          "Open Manage Captions to edit cue text, adjust timing, reorder entries, or delete unwanted segments — all without leaving the editor.",
      },
      {
        step: "Upload your own file",
        detail:
          "Prefer your own subtitles? Upload a .vtt file to override or supplement the AI-generated captions at any time.",
      },
      {
        step: "Captions ship with your export",
        detail:
          "Caption files and transcripts are bundled into SCORM and HTML exports so learners see them in any LMS or web delivery format.",
      },
    ],
    highlights: [
      "AI-generated VTT captions for video blocks — draft ready in seconds",
      "AI-generated transcripts for audio uploads",
      "Built-in caption editor: edit cue text, timing, and order before publishing",
      "Upload your own .vtt subtitle file as an alternative to AI generation",
      "Captions and transcripts bundled into SCORM and HTML exports",
      "AI generation available on Pro plans; manual upload always free",
    ],
    cta: { label: "Add captions to a video", href: "/course" },
  },

  // ── AI & Productivity ─────────────────────────────────────────────────────
  {
    slug: "ai-course-generation",
    group: "productivity",
    icon: "Sparkles",
    title: "AI Course Generation",
    tagline: "Describe what you want to teach — AI builds the full course for you to refine.",
    description:
      "Creating a course from scratch just got dramatically faster. Tell CourseForge what you want to teach, upload reference documents, review learning objectives, approve the slide outline, and generate a complete course — all slide content, blocks, and assessments — ready to review and refine. Powered by Mistral AI for strong multilingual capability and content quality.",
    howItWorks: [
      {
        step: "Describe your course",
        detail:
          "Enter a title and choose a course length — short, medium, or long. CourseForge uses this to calibrate the depth and scope of the generated content.",
      },
      {
        step: "Upload reference documents",
        detail:
          "Attach up to 10 source files (PDFs, Word docs, slide decks). The AI grounds its content in your material so generated courses reflect your actual subject matter.",
      },
      {
        step: "Review objectives and outline",
        detail:
          "Approve AI-suggested learning objectives (edit, reorder, or add), then review the proposed slide structure with block types before generation starts.",
      },
      {
        step: "Generate and refine",
        detail:
          "Hit Generate and watch real-time progress as every slide and block is created. Once done, the course is fully editable — rearrange slides, tweak wording, swap blocks, or add your own media.",
      },
    ],
    highlights: [
      "Multi-step guided workflow: describe → upload docs → objectives → outline → generate",
      "Upload up to 10 reference files — AI grounds content in your source material",
      "Generates text, flashcards, accordions, tabs, callouts, MCQ assessments, and images",
      "Real-time generation progress — see slides appear as they're created",
      "Fully editable output — rearrange, rewrite, swap blocks, or add media after generation",
      "Powered by Mistral AI with strong multilingual capabilities",
    ],
    cta: { label: "Generate a course", href: "/course" },
  },
  {
    slug: "learner-tracking",
    group: "productivity",
    icon: "BarChart2",
    title: "Learner Progress Tracking",
    tagline: "Track who's learning and how far they've got — no LMS required.",
    description:
      "CourseForge can capture real learner progress when you distribute a course via public link or embedded iframe — without a traditional LMS. An optional email prompt identifies learners, a built-in KPI dashboard shows sessions, scores, progress, and time spent, and a learner table lets you search, sort, and export data to CSV or Excel.",
    howItWorks: [
      {
        step: "Publish with tracking enabled",
        detail:
          "When publishing via Public Link or Embed, toggle 'Track Progress'. CourseForge immediately starts capturing session data for every learner who opens the link.",
      },
      {
        step: "Optionally identify learners",
        detail:
          "Enable the email prompt to ask learners for their address before starting. This ties progress data to a named individual rather than an anonymous session.",
      },
      {
        step: "Review your KPI dashboard",
        detail:
          "Head to the Track tab to see Total Sessions, Unique Learners, Average Score, Average Progress, Avg Time per Session, Total Time Spent, and Completion Rate — all in one view.",
      },
      {
        step: "Export learner data",
        detail:
          "The learner table supports search, sort, and one-click export to CSV or Excel — useful for compliance reporting, manager dashboards, or feeding data into other tools.",
      },
    ],
    highlights: [
      "Tracks learner progress from public links and iFrame embeds — no LMS needed",
      "KPIs: Total Sessions, Unique Learners, Average Score, Completion Rate, and more",
      "Charts: Sessions Over Time, Active Learners, Average Progress, Average Score",
      "Optional email prompt to identify learners with their consent",
      "Learner table with search, sort, and CSV/Excel export",
      "Privacy-first: email collection is opt-in and requires your consent notice",
    ],
    cta: { label: "Publish and track", href: "/course" },
  },

  // ── Integrations ──────────────────────────────────────────────────────────
  {
    slug: "gitlab-integration",
    group: "productivity",
    icon: "GitBranch",
    title: "GitLab Integration",
    tagline: "Push course content to your own GitLab repository for a full version history of every change.",
    description:
      "CourseForge can push your course content to any GitLab instance — cloud or self-hosted. Every save creates a commit, giving you a complete audit trail, the ability to roll back to any previous version, and the freedom to use your existing Git workflows for review and sign-off. No vendor lock-in: your content lives in your repository.",
    howItWorks: [
      {
        step: "Connect your GitLab instance",
        detail:
          "Enter your GitLab instance URL — gitlab.com or any self-hosted CE/EE server — and authenticate with a personal access token. CourseForge verifies the connection and stores credentials securely before proceeding.",
      },
      {
        step: "Choose or create a repository",
        detail:
          "Select an existing repository from your GitLab account or create a new one directly from CourseForge settings. Each course maps to its own repository path, keeping content cleanly separated.",
      },
      {
        step: "Every save becomes a commit",
        detail:
          "Each time an author saves, CourseForge commits the current state of the course to the repository. Commit messages include the author name, timestamp, and a summary of what was changed.",
      },
      {
        step: "Browse history and restore",
        detail:
          "Use GitLab's built-in diff view, branch comparisons, and merge request workflows to review changes. Roll back a course to any previous commit directly from CourseForge's version history panel.",
      },
    ],
    highlights: [
      "Works with any GitLab instance — gitlab.com, self-hosted CE, or EE",
      "Authenticate with a personal access token — no OAuth app setup required",
      "Every save creates a timestamped, author-attributed commit",
      "Full version history: browse diffs, compare versions, and roll back in one click",
      "One repository per course, or organise multiple courses using GitLab subgroups",
      "Compatible with your existing branching, tagging, and merge request workflows",
    ],
    cta: { label: "Connect a repository", href: "/course" },
  },
  {
    slug: "github-integration",
    group: "productivity",
    icon: "Github",
    title: "GitHub Integration",
    tagline: "Back every course save to a GitHub repository — a full audit trail and version history on the platform your team already uses.",
    description:
      "CourseForge integrates natively with GitHub.com so your course content is committed to a repository on every save. Authors get a complete history of every change, the ability to restore any previous version, and access to GitHub's full ecosystem — pull requests for peer review, protected branches for sign-off workflows, GitHub Actions for automation, and Issues for tracking feedback.",
    howItWorks: [
      {
        step: "Connect your GitHub account",
        detail:
          "Authenticate with a GitHub personal access token (classic or fine-grained) from your user settings. CourseForge verifies the token scope and stores credentials securely — no OAuth app or organisation-level configuration needed.",
      },
      {
        step: "Choose or create a repository",
        detail:
          "Pick an existing repo from your GitHub account or organisation, or create a new one without leaving CourseForge. Each course maps to its own repository so content stays cleanly separated.",
      },
      {
        step: "Every save creates a commit",
        detail:
          "When an author saves, CourseForge pushes the current course state as a commit to the configured branch. Commit messages include the author's name, timestamp, and a summary of the changes made.",
      },
      {
        step: "Use GitHub's full workflow toolchain",
        detail:
          "Review changes in pull requests, protect the main branch to enforce approvals, trigger GitHub Actions on commit for validation or publishing pipelines, and roll back to any commit directly from CourseForge's version history panel.",
      },
    ],
    highlights: [
      "Authenticate with a GitHub personal access token — no OAuth app required",
      "Supports personal accounts, organisations, and GitHub Enterprise Cloud",
      "Every save → a timestamped, author-attributed commit on your chosen branch",
      "Full version history: diff view, restore any previous version in one click",
      "One repository per course, or organise courses using GitHub topics and teams",
      "Compatible with pull requests, branch protection, GitHub Actions, and Issues",
    ],
    cta: { label: "Connect a repository", href: "/course" },
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export const FEATURES_BY_SLUG = Object.fromEntries(FEATURES.map((f) => [f.slug, f]));
export const FEATURES_BY_GROUP = FEATURE_GROUPS.map((group) => ({
  ...group,
  features: FEATURES.filter((f) => f.group === group.id),
}));
