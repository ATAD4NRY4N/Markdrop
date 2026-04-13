import { createDefaultMarpVoiceoverBlock, normalizeVoiceoverBlock } from "./marp";

const makeList = (items) => items.map((item) => `- ${item}`).join("\n");

const placeholderImage = (label) => `https://placehold.co/1200x720?text=${encodeURIComponent(label)}`;

const createId = (prefix = "tpl") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const cloneGridColumn = (column) => ({
  id: createId("col"),
  blocks: (column.blocks || []).map(cloneTemplateBlock),
});

function cloneTemplateBlock(block) {
  const blockId = createId("block");

  if (block.type === "marp-voiceover") {
    return normalizeVoiceoverBlock({
      ...createDefaultMarpVoiceoverBlock({ id: blockId }),
      ...block,
      id: blockId,
    });
  }

  if (block.type === "grid") {
    return {
      ...block,
      id: blockId,
      columns: (block.columns || []).map(cloneGridColumn),
    };
  }

  if (block.type === "hotspot") {
    return {
      ...block,
      id: blockId,
      hotspots: (block.hotspots || []).map((hotspot) => ({
        ...hotspot,
        id: createId("hotspot"),
      })),
    };
  }

  if (block.type === "quiz") {
    return {
      ...block,
      id: blockId,
      questions: (block.questions || []).map((question) => ({
        ...question,
        id: createId("question"),
      })),
    };
  }

  if (block.type === "branching") {
    return {
      ...block,
      id: blockId,
      choices: (block.choices || []).map((choice) => ({
        ...choice,
        id: createId("choice"),
      })),
    };
  }

  if (block.type === "matching") {
    return {
      ...block,
      id: blockId,
      pairs: (block.pairs || []).map((pair) => ({
        ...pair,
        id: createId("pair"),
      })),
    };
  }

  if (block.type === "categorization") {
    return {
      ...block,
      id: blockId,
      categories: (block.categories || []).map((category) => ({
        ...category,
        id: createId("category"),
      })),
      items: (block.items || []).map((item) => ({
        ...item,
        id: createId("item"),
      })),
    };
  }

  return {
    ...block,
    id: blockId,
  };
}

export function materializeTemplateBlocks(blocks = []) {
  return blocks.map(cloneTemplateBlock);
}

export const PRE_GENERATED_SLIDE_TEMPLATES = [
  {
    key: "course-kickoff",
    label: "Course Kickoff",
    description: "Hero title, context, image, and learning objectives",
    icon: "LayoutGrid",
    blocks: [
      { type: "h1", content: "Course Title" },
      { type: "h3", content: "Program subtitle or business outcome" },
      {
        type: "grid",
        weights: [2, 2, 3],
        columns: [
          {
            blocks: [
              {
                type: "paragraph",
                content:
                  "Set the context for the course, who it is for, and why this topic matters right now.",
              },
              {
                type: "ul",
                content: makeList([
                  "Audience or role",
                  "Expected duration",
                  "Business problem being solved",
                ]),
              },
            ],
          },
          {
            blocks: [
              {
                type: "alert",
                alertType: "important",
                content: "Use this space for prerequisites, outcomes, or certification context.",
              },
            ],
          },
          {
            blocks: [
              {
                type: "image",
                content: placeholderImage("Course+Hero"),
                alt: "Course hero image",
              },
            ],
          },
        ],
      },
      {
        type: "learning-objective",
        objectives: [
          "Explain the key concepts covered in this course",
          "Apply the process or framework in a practical scenario",
          "Recognize the most important decisions and tradeoffs",
        ],
      },
    ],
  },
  {
    key: "lesson-launch",
    label: "Lesson Launch",
    description: "Lesson title, framing, and split visual layout",
    icon: "Layers",
    blocks: [
      { type: "h1", content: "Lesson Title" },
      { type: "h3", content: "What learners will focus on in this lesson" },
      {
        type: "grid",
        weights: [3, 2],
        columns: [
          {
            blocks: [
              {
                type: "paragraph",
                content:
                  "Introduce the lesson with a concise explanation of the objective and why it matters in the larger course journey.",
              },
              {
                type: "ul",
                content: makeList([
                  "Key concept to introduce",
                  "Main workflow or behavior to observe",
                  "Expected learner action",
                ]),
              },
            ],
          },
          {
            blocks: [
              {
                type: "image",
                content: placeholderImage("Lesson+Visual"),
                alt: "Lesson visual",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "agenda-board",
    label: "Agenda Board",
    description: "Agenda overview with concept and lab tracks",
    icon: "ListChecks",
    blocks: [
      { type: "h1", content: "Agenda" },
      {
        type: "paragraph",
        content:
          "Use this slide to preview the structure of the session and help learners build a mental model before they begin.",
      },
      {
        type: "grid",
        weights: [1, 1],
        columns: [
          {
            blocks: [
              { type: "h3", content: "Core Concepts" },
              {
                type: "ul",
                content: makeList([
                  "Foundational topic",
                  "Important workflow",
                  "Decision criteria",
                  "Common pitfall",
                ]),
              },
            ],
          },
          {
            blocks: [
              { type: "h3", content: "Hands-on Activities" },
              {
                type: "ul",
                content: makeList([
                  "Lab or demo exercise",
                  "Guided practice step",
                  "Reflection or checkpoint",
                ]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "two-column-insight",
    label: "Two-Column Insight",
    description: "Narrative content with supporting visual",
    icon: "Columns2",
    blocks: [
      { type: "h2", content: "Key Concept" },
      {
        type: "grid",
        weights: [2, 1],
        columns: [
          {
            blocks: [
              {
                type: "paragraph",
                content:
                  "Explain the concept, workflow, or point of view in a way that can stand alone without a presenter.",
              },
              {
                type: "ul",
                content: makeList([
                  "First important takeaway",
                  "Second important takeaway",
                  "Third important takeaway",
                ]),
              },
            ],
          },
          {
            blocks: [
              {
                type: "image",
                content: placeholderImage("Supporting+Visual"),
                alt: "Supporting visual",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "compare-contrast",
    label: "Compare and Contrast",
    description: "Two side-by-side explanations or options",
    icon: "ArrowLeftRight",
    blocks: [
      { type: "h2", content: "Compare Two Approaches" },
      {
        type: "grid",
        weights: [1, 1],
        columns: [
          {
            blocks: [
              { type: "h3", content: "Option A" },
              {
                type: "paragraph",
                content: "Use this column for the first approach, state, capability, or recommendation.",
              },
              {
                type: "ul",
                content: makeList([
                  "Strength or benefit",
                  "Constraint or tradeoff",
                  "Best-fit use case",
                ]),
              },
            ],
          },
          {
            blocks: [
              { type: "h3", content: "Option B" },
              {
                type: "paragraph",
                content: "Use this column for the comparison point, alternative path, or future-state recommendation.",
              },
              {
                type: "ul",
                content: makeList([
                  "Strength or benefit",
                  "Constraint or tradeoff",
                  "Best-fit use case",
                ]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "stacked-explainer",
    label: "Stacked Explainer",
    description: "Three-part vertical story for progressive explanation",
    icon: "Layers",
    blocks: [
      { type: "h2", content: "Three-Part Explainer" },
      {
        type: "paragraph",
        content: "Use a stacked structure when a learner should move from context to detail to action in sequence.",
      },
      { type: "h3", content: "Part 1: Context" },
      { type: "paragraph", content: "Frame the situation, problem, or environment." },
      { type: "separator", content: "" },
      { type: "h3", content: "Part 2: What to Notice" },
      { type: "paragraph", content: "Highlight the signals, patterns, or rules that matter." },
      { type: "separator", content: "" },
      { type: "h3", content: "Part 3: What to Do Next" },
      { type: "paragraph", content: "Finish with the desired learner action, decision, or reflection prompt." },
    ],
  },
  {
    key: "four-metrics",
    label: "Four Metrics",
    description: "A four-card summary for KPIs, principles, or outcomes",
    icon: "LayoutGrid",
    blocks: [
      { type: "h2", content: "Four Key Signals" },
      {
        type: "paragraph",
        content: "Good for executive summaries, maturity signals, or quick-read value statements.",
      },
      {
        type: "grid",
        weights: [1, 1, 1, 1],
        columns: [
          { blocks: [{ type: "h3", content: "Metric 1" }, { type: "paragraph", content: "State the metric or principle and why it matters." }] },
          { blocks: [{ type: "h3", content: "Metric 2" }, { type: "paragraph", content: "State the metric or principle and why it matters." }] },
          { blocks: [{ type: "h3", content: "Metric 3" }, { type: "paragraph", content: "State the metric or principle and why it matters." }] },
          { blocks: [{ type: "h3", content: "Metric 4" }, { type: "paragraph", content: "State the metric or principle and why it matters." }] },
        ],
      },
    ],
  },
  {
    key: "hotspot-explorer",
    label: "Hotspot Explorer",
    description: "Annotated image walkthrough using the hotspot block",
    icon: "Crosshair",
    blocks: [
      { type: "h2", content: "Explore the Diagram" },
      { type: "h3", content: "Click each marker to inspect the labeled parts" },
      {
        type: "hotspot",
        imageUrl: placeholderImage("System+Diagram"),
        alt: "System diagram for hotspot exploration",
        hotspots: [
          { x: 18, y: 42, label: "Entry point", content: "Explain what learners should notice first in this area." },
          { x: 52, y: 58, label: "Processing layer", content: "Describe the system behavior, transition, or business rule here." },
          { x: 81, y: 34, label: "Outcome", content: "Clarify the result, destination, or learner takeaway." },
        ],
      },
    ],
  },
  {
    key: "gallery-showcase",
    label: "Gallery Showcase",
    description: "Carousel-based sequence for screenshots or examples",
    icon: "ImagePlay",
    blocks: [
      { type: "h2", content: "Visual Walkthrough" },
      {
        type: "paragraph",
        content: "Use a carousel when learners need to compare multiple screenshots, artifacts, or states without leaving the slide.",
      },
      {
        type: "carousel",
        autoPlay: false,
        interval: 4000,
        showDots: true,
        images: [
          { url: placeholderImage("Step+1"), alt: "Walkthrough step 1", caption: "Step 1: Starting point" },
          { url: placeholderImage("Step+2"), alt: "Walkthrough step 2", caption: "Step 2: Key interaction" },
          { url: placeholderImage("Step+3"), alt: "Walkthrough step 3", caption: "Step 3: Completed outcome" },
        ],
      },
    ],
  },
  {
    key: "knowledge-check",
    label: "Knowledge Check",
    description: "Prompt, context, and a quick multiple-choice check",
    icon: "CheckCircle2",
    blocks: [
      { type: "h2", content: "Knowledge Check" },
      {
        type: "paragraph",
        content: "Use a quick formative check to confirm the main point before learners move on.",
      },
      {
        type: "knowledge-check",
        prompt: "Which statement best matches the concept just explained?",
        options: [
          "Best answer placeholder",
          "Plausible distractor",
          "Another distractor",
        ],
        correctIndex: 0,
        feedbackCorrect: "Correct. This reinforces the core concept.",
        feedbackIncorrect: "Not quite. Revisit the concept and try again.",
      },
    ],
  },
  {
    key: "matching-practice",
    label: "Matching Practice",
    description: "Match terms to definitions for concept reinforcement",
    icon: "ArrowLeftRight",
    blocks: [
      { type: "h2", content: "Match the Concepts" },
      {
        type: "paragraph",
        content: "Good for terminology, definitions, process states, or product capability mapping.",
      },
      {
        type: "matching",
        prompt: "Match each term to its definition.",
        pairs: [
          { term: "Concept A", definition: "Definition or explanation for concept A" },
          { term: "Concept B", definition: "Definition or explanation for concept B" },
          { term: "Concept C", definition: "Definition or explanation for concept C" },
        ],
      },
    ],
  },
  {
    key: "narrated-explainer",
    label: "Narrated Explainer",
    description: "Content slide pre-wired with the narration block",
    icon: "Mic",
    blocks: [
      { type: "h2", content: "Narrated Explainer" },
      {
        type: "paragraph",
        content:
          "Use this pattern when the written content and spoken narration should be designed together from the start.",
      },
      {
        type: "grid",
        weights: [2, 1],
        columns: [
          {
            blocks: [
              {
                type: "paragraph",
                content: "Write the on-screen explanation here. Keep it concise if the narration will carry more detail.",
              },
              {
                type: "ul",
                content: makeList([
                  "Keep the visual concise",
                  "Let narration carry nuance",
                  "Queue localization in the worker",
                ]),
              },
            ],
          },
          {
            blocks: [
              {
                type: "image",
                content: placeholderImage("Narrated+Visual"),
                alt: "Narrated slide visual",
              },
            ],
          },
        ],
      },
      {
        type: "marp-voiceover",
        content: "Welcome to this section.\n[PAUSE:600]\nUse the narration block to script what the learner should hear, while the worker handles downstream localization and packaging.",
        targetLocales: ["de-DE", "fr-FR"],
      },
    ],
  },
];
