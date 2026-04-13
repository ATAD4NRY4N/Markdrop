import { materializeTemplateBlocks } from "./preGeneratedSlideTemplates";

const BUILT_IN_TEMPLATE_TIMESTAMP = "2026-04-13T00:00:00.000Z";

const makeList = (items) => items.map((item) => `- ${item}`).join("\n");

const createStableId = (prefix = "builtin") => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
};

const escapeSvg = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const createIllustration = ({
  title,
  subtitle,
  primary,
  accent,
  background = "#f8fafc",
  width = 1600,
  height = 900,
}) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <rect width="${width}" height="${height}" rx="36" fill="${background}" />
      <rect x="70" y="72" width="${Math.round(width * 0.42)}" height="${Math.round(height * 0.72)}" rx="28" fill="${primary}" opacity="0.14" />
      <rect x="${Math.round(width * 0.55)}" y="120" width="${Math.round(width * 0.32)}" height="${Math.round(height * 0.12)}" rx="22" fill="${accent}" opacity="0.18" />
      <rect x="${Math.round(width * 0.55)}" y="${Math.round(height * 0.32)}" width="${Math.round(width * 0.24)}" height="${Math.round(height * 0.3)}" rx="24" fill="${primary}" opacity="0.10" />
      <rect x="${Math.round(width * 0.82)}" y="${Math.round(height * 0.35)}" width="${Math.round(width * 0.08)}" height="${Math.round(height * 0.23)}" rx="18" fill="${accent}" opacity="0.24" />
      <circle cx="${Math.round(width * 0.84)}" cy="${Math.round(height * 0.18)}" r="38" fill="${primary}" opacity="0.22" />
      <circle cx="${Math.round(width * 0.22)}" cy="${Math.round(height * 0.22)}" r="64" fill="${accent}" opacity="0.16" />
      <text x="110" y="220" fill="#111827" font-size="84" font-weight="700" font-family="Inter, Arial, sans-serif">${escapeSvg(title)}</text>
      <text x="110" y="300" fill="#334155" font-size="34" font-weight="500" font-family="Inter, Arial, sans-serif">${escapeSvg(subtitle)}</text>
      <rect x="110" y="360" width="340" height="18" rx="9" fill="#111827" opacity="0.08" />
      <rect x="110" y="404" width="300" height="18" rx="9" fill="#111827" opacity="0.08" />
      <rect x="110" y="448" width="250" height="18" rx="9" fill="#111827" opacity="0.08" />
      <rect x="${Math.round(width * 0.55)}" y="${Math.round(height * 0.62)}" width="${Math.round(width * 0.16)}" height="20" rx="10" fill="#111827" opacity="0.10" />
      <rect x="${Math.round(width * 0.55)}" y="${Math.round(height * 0.67)}" width="${Math.round(width * 0.22)}" height="20" rx="10" fill="#111827" opacity="0.10" />
      <rect x="${Math.round(width * 0.55)}" y="${Math.round(height * 0.72)}" width="${Math.round(width * 0.19)}" height="20" rx="10" fill="#111827" opacity="0.10" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createSection = (title, moduleKeys) => ({ title, moduleKeys });

const createModule = (key, title, blocks) => ({ key, title, blocks });

const createNarrationBlock = ({
  content,
  targetLocales = ["de-DE", "fr-FR"],
  sourceLocale = "en-US",
  voice = "alloy",
  localizationRuntime = "ollama",
  localizationProvider = "google-translategemma",
  localizationModel = "translategemma",
}) => ({
  type: "marp-voiceover",
  content,
  sourceLocale,
  language: sourceLocale,
  voice,
  targetLocales,
  autoLocalize: true,
  localizationRuntime,
  localizationProvider,
  localizationModel,
  autoScormPackaging: true,
});

const createCourseStats = (template) => ({
  moduleCount: Array.isArray(template?.modules) ? template.modules.length : 0,
  sectionCount: Array.isArray(template?.sections) ? template.sections.length : 0,
  blockCount: Array.isArray(template?.modules)
    ? template.modules.reduce((count, module) => count + (module.blocks?.length || 0), 0)
    : 0,
  narrationCount: Array.isArray(template?.modules)
    ? template.modules.reduce(
        (count, module) => count + (module.blocks || []).filter((block) => block.type === "marp-voiceover").length,
        0,
      )
    : 0,
});

const BLOCK_LABELS = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  paragraph: "Paragraph",
  ul: "Bullet List",
  ol: "Numbered List",
  alert: "Alert",
  image: "Image",
  grid: "Grid Layout",
  hotspot: "Hotspot Explorer",
  carousel: "Carousel",
  "learning-objective": "Learning Objectives",
  "knowledge-check": "Knowledge Check",
  matching: "Matching Activity",
  branching: "Branching Scenario",
  "marp-voiceover": "Slide Narration",
};

const formatBlockLabel = (type) => BLOCK_LABELS[type] || String(type || "block").replace(/-/g, " ");

const buildSearchText = (template) =>
  [
    template.title,
    template.description,
    template.category,
    ...(template.tags || []),
    ...(template.sections || []).map((section) => section.title),
    ...(template.modules || []).flatMap((module) => [
      module.title,
      ...(module.blocks || []).map((block) => formatBlockLabel(block.type)),
    ]),
  ]
    .join(" ")
    .toLowerCase();

const onboardingPalette = {
  primary: "#0f766e",
  accent: "#f97316",
  background: "#f5fbfa",
};

const technicalPalette = {
  primary: "#1d4ed8",
  accent: "#0f172a",
  background: "#f7f9ff",
};

const compliancePalette = {
  primary: "#b91c1c",
  accent: "#f59e0b",
  background: "#fff8f1",
};

const narratedPalette = {
  primary: "#0f172a",
  accent: "#14b8a6",
  background: "#f4fbfa",
};

const onboardingHero = createIllustration({
  title: "Product Onboarding Sprint",
  subtitle: "Kickoff, platform tour, workflow demo, readiness check",
  ...onboardingPalette,
});

const onboardingDetail = createIllustration({
  title: "Four-module launch path",
  subtitle: "Foundation, walkthrough, practice, assessment",
  ...onboardingPalette,
});

const technicalHero = createIllustration({
  title: "Technical Skills Workshop",
  subtitle: "Architecture framing, troubleshooting, decision practice",
  ...technicalPalette,
});

const technicalDetail = createIllustration({
  title: "Concepts to application",
  subtitle: "Structure a lab-ready technical course in minutes",
  ...technicalPalette,
});

const complianceHero = createIllustration({
  title: "Compliance Decision Certification",
  subtitle: "Risk framing, red flags, branching choices, attestation",
  ...compliancePalette,
});

const complianceDetail = createIllustration({
  title: "Scenario-led compliance",
  subtitle: "Train sound judgment before formal assessment",
  ...compliancePalette,
});

const narratedHero = createIllustration({
  title: "Multilingual Launch Briefing",
  subtitle: "Narration-first course starter with localization defaults",
  ...narratedPalette,
});

const narratedDetail = createIllustration({
  title: "Narration, localization, SCORM",
  subtitle: "Prewired for worker-owned downstream packaging",
  ...narratedPalette,
});

const COURSE_TEMPLATE_BLUEPRINTS = [
  {
    key: "product-onboarding-sprint",
    title: "Product Onboarding Sprint",
    description:
      "A preconfigured onboarding course with kickoff framing, product tour, workflow walkthrough, and a final readiness check.",
    category: "onboarding",
    tags: ["onboarding", "product", "narration", "assessment"],
    scormVersion: "2004",
    passThreshold: 80,
    maxAttempts: 0,
    theme: {
      headingFont: "Manrope",
      bodyFont: "Source Sans 3",
      primaryColor: onboardingPalette.primary,
      accentColor: onboardingPalette.accent,
      bgColor: "#ffffff",
    },
    images: [onboardingHero, onboardingDetail],
    sections: [
      createSection("Orientation", ["welcome-outcomes", "platform-tour"]),
      createSection("Practice", ["daily-workflow", "readiness-check"]),
    ],
    modules: [
      createModule("welcome-outcomes", "Welcome and Outcomes", [
        { type: "h1", content: "Welcome to the Product Onboarding Sprint" },
        {
          type: "paragraph",
          content:
            "Frame the business problem, the learner role, and the expected outcomes before diving into product-specific workflows.",
        },
        {
          type: "learning-objective",
          objectives: [
            "Explain the product promise in language that matches the learner role",
            "Identify the critical screens and checkpoints in the first-week workflow",
            "Demonstrate readiness before moving into live customer work",
          ],
        },
        createNarrationBlock({
          content:
            "Welcome to the product onboarding sprint.\n[PAUSE:500]\nThis course gives every learner the same launch message, the same workflow language, and the same readiness expectations before they begin working with real accounts.",
        }),
      ]),
      createModule("platform-tour", "Platform Tour", [
        { type: "h2", content: "Tour the Product Landscape" },
        {
          type: "grid",
          weights: [2, 2, 3],
          columns: [
            {
              blocks: [
                { type: "h3", content: "Workspace" },
                {
                  type: "ul",
                  content: makeList([
                    "Orient learners to the primary workspace",
                    "Call out the signals they should scan first",
                    "Name the most common navigation trap",
                  ]),
                },
              ],
            },
            {
              blocks: [
                { type: "h3", content: "Task Flow" },
                {
                  type: "ul",
                  content: makeList([
                    "What gets configured first",
                    "Where approvals or checks happen",
                    "How completion gets confirmed",
                  ]),
                },
              ],
            },
            {
              blocks: [
                {
                  type: "image",
                  content: createIllustration({
                    title: "Platform Map",
                    subtitle: "Replace with a product screenshot or annotated diagram",
                    width: 1200,
                    height: 720,
                    ...onboardingPalette,
                  }),
                  alt: "Illustrated product map",
                },
              ],
            },
          ],
        },
        {
          type: "hotspot",
          imageUrl: createIllustration({
            title: "Interactive Tour",
            subtitle: "Pin the exact controls new learners need to recognize",
            width: 1400,
            height: 840,
            ...onboardingPalette,
          }),
          alt: "Annotated platform tour",
          hotspots: [
            {
              x: 20,
              y: 30,
              label: "Entry dashboard",
              content: "Show the landing metrics or tasks learners should use to orient themselves.",
            },
            {
              x: 54,
              y: 56,
              label: "Primary action",
              content: "Explain the first action a learner must complete in a typical workflow.",
            },
            {
              x: 82,
              y: 38,
              label: "Status signal",
              content: "Highlight where progress, validation, or escalation status becomes visible.",
            },
          ],
        },
      ]),
      createModule("daily-workflow", "Daily Workflow", [
        { type: "h2", content: "Walk Through the Daily Workflow" },
        {
          type: "carousel",
          autoPlay: false,
          interval: 3500,
          showDots: true,
          images: [
            {
              url: createIllustration({
                title: "Step 1",
                subtitle: "Start with intake and context gathering",
                width: 1200,
                height: 720,
                ...onboardingPalette,
              }),
              alt: "Workflow step one",
              caption: "Step 1: Intake and context gathering",
            },
            {
              url: createIllustration({
                title: "Step 2",
                subtitle: "Complete the main interaction or build sequence",
                width: 1200,
                height: 720,
                ...onboardingPalette,
              }),
              alt: "Workflow step two",
              caption: "Step 2: Main interaction sequence",
            },
            {
              url: createIllustration({
                title: "Step 3",
                subtitle: "Validate the result and hand off cleanly",
                width: 1200,
                height: 720,
                ...onboardingPalette,
              }),
              alt: "Workflow step three",
              caption: "Step 3: Validation and handoff",
            },
          ],
        },
        {
          type: "alert",
          alertType: "important",
          content:
            "Use the alert callout to document handoff rules, escalation thresholds, or quality checks that must never be skipped.",
        },
      ]),
      createModule("readiness-check", "Readiness Check", [
        { type: "h2", content: "Confirm Readiness" },
        {
          type: "matching",
          prompt: "Match each responsibility to the correct stage in the workflow.",
          pairs: [
            { term: "Prepare context", definition: "Before beginning the main task flow" },
            { term: "Validate completion", definition: "After the learner submits the final action" },
            { term: "Escalate blockers", definition: "When a required signal or approval is missing" },
          ],
        },
        {
          type: "knowledge-check",
          prompt: "What should a new learner do first when they enter the workspace?",
          options: [
            "Review the dashboard signals and current task context",
            "Skip directly to the last completed workflow step",
            "Wait for another user to assign the next action",
          ],
          correctIndex: 0,
          feedbackCorrect: "Correct. Strong onboarding starts with shared context and orientation.",
          feedbackIncorrect: "Not quite. Learners should orient themselves before taking action.",
        },
      ]),
    ],
  },
  {
    key: "technical-skills-workshop",
    title: "Technical Skills Workshop",
    description:
      "A technical training starter with architecture framing, workflow comparisons, troubleshooting visuals, and decision practice.",
    category: "technical",
    tags: ["technical", "architecture", "labs", "troubleshooting"],
    scormVersion: "2004",
    passThreshold: 85,
    maxAttempts: 0,
    theme: {
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      primaryColor: technicalPalette.primary,
      accentColor: "#2563eb",
      bgColor: "#ffffff",
    },
    images: [technicalHero, technicalDetail],
    sections: [
      createSection("Concepts", ["architecture-map", "execution-paths"]),
      createSection("Application", ["troubleshoot-flow", "decision-simulation"]),
    ],
    modules: [
      createModule("architecture-map", "Architecture Map", [
        { type: "h1", content: "Architecture Map" },
        {
          type: "paragraph",
          content:
            "Use this first module to frame the system boundaries, the critical flows, and the learner mental model for the rest of the course.",
        },
        {
          type: "grid",
          weights: [1, 1, 1],
          columns: [
            {
              blocks: [
                { type: "h3", content: "Inputs" },
                {
                  type: "paragraph",
                  content: "Describe the upstream systems, data contracts, or events learners need to understand.",
                },
              ],
            },
            {
              blocks: [
                { type: "h3", content: "Processing" },
                {
                  type: "paragraph",
                  content: "Explain the transformation, orchestration, or validation logic that powers the core experience.",
                },
              ],
            },
            {
              blocks: [
                { type: "h3", content: "Outcomes" },
                {
                  type: "paragraph",
                  content: "Call out the outputs, dashboards, or downstream dependencies that matter to the learner role.",
                },
              ],
            },
          ],
        },
        {
          type: "learning-objective",
          objectives: [
            "Trace the system from input to output",
            "Explain where validation and failure handling occur",
            "Describe the path learners should follow during a guided lab",
          ],
        },
      ]),
      createModule("execution-paths", "Compare Execution Paths", [
        { type: "h2", content: "Compare Manual and Automated Paths" },
        {
          type: "grid",
          weights: [1, 1],
          columns: [
            {
              blocks: [
                { type: "h3", content: "Manual Path" },
                {
                  type: "ul",
                  content: makeList([
                    "Learner performs each validation step deliberately",
                    "Useful for early skill acquisition and troubleshooting",
                    "Slower, but exposes each checkpoint clearly",
                  ]),
                },
              ],
            },
            {
              blocks: [
                { type: "h3", content: "Automated Path" },
                {
                  type: "ul",
                  content: makeList([
                    "System handles repeated or validated steps automatically",
                    "Useful for scaled delivery once the learner understands the model",
                    "Requires strong observability when something breaks",
                  ]),
                },
              ],
            },
          ],
        },
        {
          type: "alert",
          alertType: "tip",
          content:
            "Add a tip callout when you want learners to notice a key tradeoff between reliability, speed, and observability.",
        },
      ]),
      createModule("troubleshoot-flow", "Troubleshoot the Flow", [
        { type: "h2", content: "Troubleshoot the Flow" },
        {
          type: "hotspot",
          imageUrl: createIllustration({
            title: "System Diagram",
            subtitle: "Annotate the exact nodes learners should inspect during failure analysis",
            width: 1400,
            height: 840,
            ...technicalPalette,
          }),
          alt: "Technical system diagram",
          hotspots: [
            {
              x: 18,
              y: 44,
              label: "Input boundary",
              content: "Document the first signals learners should inspect when data arrives malformed or incomplete.",
            },
            {
              x: 50,
              y: 52,
              label: "Processing checkpoint",
              content: "Use this to highlight retries, validation outcomes, or queue depth.",
            },
            {
              x: 80,
              y: 34,
              label: "Delivery surface",
              content: "Explain how issues appear in the final surface and where rollback decisions are made.",
            },
          ],
        },
        {
          type: "carousel",
          autoPlay: false,
          interval: 4000,
          showDots: true,
          images: [
            {
              url: createIllustration({
                title: "Log Snapshot",
                subtitle: "Capture the exact error signature learners should notice",
                width: 1200,
                height: 720,
                ...technicalPalette,
              }),
              alt: "Technical log snapshot",
              caption: "Step 1: Recognize the error signature",
            },
            {
              url: createIllustration({
                title: "Metrics View",
                subtitle: "Show the leading indicators before a visible failure occurs",
                width: 1200,
                height: 720,
                ...technicalPalette,
              }),
              alt: "Metrics view",
              caption: "Step 2: Check health and throughput",
            },
            {
              url: createIllustration({
                title: "Recovery Path",
                subtitle: "Map the fastest safe recovery motion",
                width: 1200,
                height: 720,
                ...technicalPalette,
              }),
              alt: "Recovery flow",
              caption: "Step 3: Recover safely and document the fix",
            },
          ],
        },
      ]),
      createModule("decision-simulation", "Decision Simulation", [
        { type: "h2", content: "Choose the Best Response" },
        {
          type: "branching",
          prompt:
            "A critical workflow is failing intermittently under load. Which path should the learner choose first?",
          choices: [
            {
              label: "Inspect the observability signals before changing configuration",
              targetLabel: "Troubleshoot the Flow",
            },
            {
              label: "Rollback immediately without confirming the failure pattern",
              targetLabel: "Architecture Map",
            },
            {
              label: "Ask another team to validate the alert thresholds",
              targetLabel: "Compare Execution Paths",
            },
          ],
        },
        {
          type: "knowledge-check",
          prompt: "Why is observability the first move in this scenario?",
          options: [
            "It reveals the real failure shape before a disruptive intervention",
            "It avoids all rollback decisions entirely",
            "It guarantees the workflow will self-heal immediately",
          ],
          correctIndex: 0,
          feedbackCorrect: "Correct. Strong technical judgment starts with evidence.",
          feedbackIncorrect: "Not quite. The learner needs signal before action.",
        },
      ]),
    ],
  },
  {
    key: "compliance-decision-certification",
    title: "Compliance Decision Certification",
    description:
      "A scenario-led compliance template with policy framing, red-flag recognition, branching choices, and final attestation.",
    category: "compliance",
    tags: ["compliance", "scenario", "branching", "certification"],
    scormVersion: "2004",
    passThreshold: 90,
    maxAttempts: 1,
    theme: {
      headingFont: "DM Sans",
      bodyFont: "Public Sans",
      primaryColor: compliancePalette.primary,
      accentColor: compliancePalette.accent,
      bgColor: "#fffdf8",
    },
    images: [complianceHero, complianceDetail],
    sections: [
      createSection("Policy Basics", ["policy-essentials", "recognize-red-flags"]),
      createSection("Decision Practice", ["make-the-right-call", "final-attestation"]),
    ],
    modules: [
      createModule("policy-essentials", "Policy Essentials", [
        { type: "h1", content: "Policy Essentials" },
        {
          type: "alert",
          alertType: "important",
          content:
            "State the non-negotiable standard first. Compliance learners should know exactly which decisions require escalation or documentation.",
        },
        {
          type: "paragraph",
          content:
            "Use this module to explain why the policy exists, what risk it prevents, and how the learner role is expected to respond.",
        },
        {
          type: "learning-objective",
          objectives: [
            "Recognize the policy threshold that requires escalation",
            "Distinguish acceptable actions from risky shortcuts",
            "Document the correct decision path during review",
          ],
        },
      ]),
      createModule("recognize-red-flags", "Recognize Red Flags", [
        { type: "h2", content: "Recognize the Red Flags" },
        {
          type: "grid",
          weights: [1, 1, 1],
          columns: [
            {
              blocks: [
                { type: "h3", content: "Timing pressure" },
                {
                  type: "paragraph",
                  content: "Show how urgency can push learners toward unapproved shortcuts or undocumented approvals.",
                },
              ],
            },
            {
              blocks: [
                { type: "h3", content: "Incomplete evidence" },
                {
                  type: "paragraph",
                  content: "Explain which missing signals, attachments, or approvals must stop the process immediately.",
                },
              ],
            },
            {
              blocks: [
                { type: "h3", content: "Third-party risk" },
                {
                  type: "paragraph",
                  content: "Use this card for partner or vendor conditions that require extra validation.",
                },
              ],
            },
          ],
        },
        {
          type: "hotspot",
          imageUrl: createIllustration({
            title: "Risk Review Screen",
            subtitle: "Mark the exact fields and warning badges learners should inspect",
            width: 1400,
            height: 840,
            ...compliancePalette,
          }),
          alt: "Compliance review screen",
          hotspots: [
            {
              x: 24,
              y: 42,
              label: "Missing approval",
              content: "Show the field or indicator that proves a required reviewer has not yet signed off.",
            },
            {
              x: 56,
              y: 58,
              label: "Documentation gap",
              content: "Explain what evidence is missing and where the learner must obtain it.",
            },
            {
              x: 80,
              y: 30,
              label: "Escalation route",
              content: "Name the escalation path so there is no ambiguity when learners hit a risk threshold.",
            },
          ],
        },
      ]),
      createModule("make-the-right-call", "Make the Right Call", [
        { type: "h2", content: "Practice the Decision" },
        {
          type: "branching",
          prompt:
            "A request is urgent, but one approval is missing and supporting evidence is incomplete. What should the learner do next?",
          choices: [
            {
              label: "Escalate and request the missing evidence before proceeding",
              targetLabel: "Final Attestation",
            },
            {
              label: "Approve provisionally because the deadline is near",
              targetLabel: "Policy Essentials",
            },
            {
              label: "Ask a peer to approve informally and continue",
              targetLabel: "Recognize Red Flags",
            },
          ],
        },
        {
          type: "paragraph",
          content:
            "Branching scenarios work best when each option reveals how judgment, documentation, and escalation should interact under pressure.",
        },
      ]),
      createModule("final-attestation", "Final Attestation", [
        { type: "h2", content: "Final Attestation" },
        {
          type: "matching",
          prompt: "Match each compliance signal to the correct response.",
          pairs: [
            { term: "Missing approval", definition: "Pause and escalate before proceeding" },
            { term: "Complete evidence", definition: "Continue through the approved workflow" },
            { term: "Third-party exception", definition: "Trigger the additional validation path" },
          ],
        },
        {
          type: "knowledge-check",
          prompt: "Which response best reflects sound compliance judgment?",
          options: [
            "Stop, document the gap, and use the formal escalation route",
            "Move forward if the request appears low risk",
            "Let the next reviewer decide whether the gap matters",
          ],
          correctIndex: 0,
          feedbackCorrect: "Correct. Strong compliance practice is explicit, documented, and reviewable.",
          feedbackIncorrect: "Not quite. The correct response protects the process and the learner.",
        },
      ]),
    ],
  },
  {
    key: "multilingual-launch-briefing",
    title: "Multilingual Launch Briefing",
    description:
      "A narration-first course starter with localization defaults, launch storytelling, screenshot walkthroughs, and readiness validation.",
    category: "narrated",
    tags: ["narration", "localization", "scorm", "launch"],
    scormVersion: "2004",
    passThreshold: 80,
    maxAttempts: 0,
    theme: {
      headingFont: "Outfit",
      bodyFont: "Inter",
      primaryColor: narratedPalette.primary,
      accentColor: narratedPalette.accent,
      bgColor: "#ffffff",
    },
    images: [narratedHero, narratedDetail],
    sections: [
      createSection("Launch Story", ["launch-narrative", "localized-walkthrough"]),
      createSection("Validation", ["market-readiness-check"]),
    ],
    modules: [
      createModule("launch-narrative", "Launch Narrative", [
        { type: "h1", content: "Launch Narrative" },
        {
          type: "paragraph",
          content:
            "Use this starter when the spoken story matters as much as the on-screen layout and downstream localization needs to be queued automatically.",
        },
        createNarrationBlock({
          content:
            "Welcome to the launch briefing.\n[PAUSE:500]\nAuthor this narrative once in English, keep the on-screen content concise, and let the background worker localize and package the learner-ready outputs for each destination locale.",
          targetLocales: ["de-DE", "fr-FR", "es-ES"],
        }),
        {
          type: "learning-objective",
          objectives: [
            "Tell a consistent launch story across markets",
            "Design slides so narration carries the nuance",
            "Queue localization and packaging without manual translation steps",
          ],
        },
      ]),
      createModule("localized-walkthrough", "Localized Walkthrough", [
        { type: "h2", content: "Build the Walkthrough Once" },
        {
          type: "grid",
          weights: [2, 1],
          columns: [
            {
              blocks: [
                {
                  type: "ul",
                  content: makeList([
                    "Keep the slide text concise and internationally neutral",
                    "Use narration to explain nuance, tradeoffs, and emphasis",
                    "Reserve long-form translation for the worker-owned localization step",
                  ]),
                },
                {
                  type: "alert",
                  alertType: "tip",
                  content:
                    "This template defaults to TranslateGemma-oriented localization metadata via Ollama so the authoring flow stays English-first.",
                },
              ],
            },
            {
              blocks: [
                {
                  type: "image",
                  content: createIllustration({
                    title: "Localization Pipeline",
                    subtitle: "Author once, localize in the worker, publish clean learner outputs",
                    width: 1100,
                    height: 720,
                    ...narratedPalette,
                  }),
                  alt: "Localization pipeline illustration",
                },
              ],
            },
          ],
        },
        {
          type: "carousel",
          autoPlay: false,
          interval: 3500,
          showDots: true,
          images: [
            {
              url: createIllustration({
                title: "Scene 1",
                subtitle: "Problem framing",
                width: 1200,
                height: 720,
                ...narratedPalette,
              }),
              alt: "Problem framing scene",
              caption: "Scene 1: Frame the release problem",
            },
            {
              url: createIllustration({
                title: "Scene 2",
                subtitle: "Workflow or feature explanation",
                width: 1200,
                height: 720,
                ...narratedPalette,
              }),
              alt: "Feature explanation scene",
              caption: "Scene 2: Explain the new workflow",
            },
            {
              url: createIllustration({
                title: "Scene 3",
                subtitle: "Regional rollout expectations",
                width: 1200,
                height: 720,
                ...narratedPalette,
              }),
              alt: "Regional rollout scene",
              caption: "Scene 3: Clarify rollout and readiness expectations",
            },
          ],
        },
      ]),
      createModule("market-readiness-check", "Market Readiness Check", [
        { type: "h2", content: "Market Readiness Check" },
        {
          type: "knowledge-check",
          prompt: "Why is narration-first authoring useful in a multilingual launch course?",
          options: [
            "It lets the author write one primary script while localization happens downstream",
            "It removes the need for any localized review or QA entirely",
            "It forces every slide to contain the full transcript on-screen",
          ],
          correctIndex: 0,
          feedbackCorrect: "Correct. The author stays focused on the source narrative while the worker handles the downstream tasks.",
          feedbackIncorrect: "Not quite. Narration-first helps, but it does not eliminate validation or require text-heavy slides.",
        },
        {
          type: "matching",
          prompt: "Match each workflow step to the right owner.",
          pairs: [
            { term: "Author source narration", definition: "Human author in the builder" },
            { term: "Localize target locales", definition: "Background worker pipeline" },
            { term: "Package learner delivery", definition: "SCORM/export automation" },
          ],
        },
      ]),
    ],
  },
];

export const PRE_GENERATED_COURSE_TEMPLATES = COURSE_TEMPLATE_BLUEPRINTS.map((template) => ({
  ...template,
  id: `builtin-course-template-${template.key}`,
  content: JSON.stringify(template.modules?.[0]?.blocks || []),
  thumbnail: template.images?.[0] || null,
  created_at: BUILT_IN_TEMPLATE_TIMESTAMP,
  updated_at: BUILT_IN_TEMPLATE_TIMESTAMP,
  user_id: null,
  course_id: null,
  is_builtin: true,
  template_kind: "course",
  searchText: buildSearchText(template),
}));

export const getBuiltInCourseTemplates = () => [...PRE_GENERATED_COURSE_TEMPLATES];

export const getBuiltInCourseTemplateById = (id) =>
  PRE_GENERATED_COURSE_TEMPLATES.find((template) => template.id === id) || null;

export const filterBuiltInCourseTemplatesByCategory = (category = "all") => {
  if (!category || category === "all") return getBuiltInCourseTemplates();
  return PRE_GENERATED_COURSE_TEMPLATES.filter((template) => template.category === category);
};

export const searchBuiltInCourseTemplates = (query = "") => {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return getBuiltInCourseTemplates();

  return PRE_GENERATED_COURSE_TEMPLATES.filter((template) =>
    (template.searchText || "").includes(normalized)
  );
};

export const materializeCourseTemplateModules = (template) =>
  (template?.modules || []).map((module, index) => ({
    key: module.key,
    title: module.title,
    order: index,
    blocks: materializeTemplateBlocks(module.blocks || []),
  }));

export const materializeCourseTemplateSections = (template, createdModules = []) => {
  const moduleIdByKey = new Map(createdModules.map((module) => [module.key, module.id]));

  return (template?.sections || [])
    .map((section) => ({
      id: createStableId("sec"),
      title: section.title,
      moduleIds: (section.moduleKeys || [])
        .map((moduleKey) => moduleIdByKey.get(moduleKey))
        .filter(Boolean),
    }))
    .filter((section) => section.moduleIds.length > 0);
};

export const getCourseTemplateStats = (template) => createCourseStats(template);

export const buildCourseTemplateStructurePreview = (template) => {
  if (!Array.isArray(template?.modules) || template.modules.length === 0) {
    return "Preview content unavailable.";
  }

  const lines = [`Course: ${template.title}`];

  if (Array.isArray(template.sections) && template.sections.length > 0) {
    lines.push("", "Sections:");
    template.sections.forEach((section, index) => {
      lines.push(`${index + 1}. ${section.title} (${section.moduleKeys.length} modules)`);
    });
  }

  lines.push("", "Modules:");
  template.modules.forEach((module, index) => {
    const blockSummary = (module.blocks || [])
      .slice(0, 4)
      .map((block) => formatBlockLabel(block.type))
      .join(" • ");

    lines.push(`${index + 1}. ${module.title}`);
    lines.push(`   ${blockSummary}${module.blocks.length > 4 ? " • ..." : ""}`);
  });

  return lines.join("\n");
};