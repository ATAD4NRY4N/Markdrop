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
    slug: "review-comments",
    group: "collaboration",
    icon: "MessageSquare",
    title: "Review & Comments",
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
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export const FEATURES_BY_SLUG = Object.fromEntries(FEATURES.map((f) => [f.slug, f]));
export const FEATURES_BY_GROUP = FEATURE_GROUPS.map((group) => ({
  ...group,
  features: FEATURES.filter((f) => f.group === group.id),
}));
