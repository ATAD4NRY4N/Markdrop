import { createDefaultMarpVoiceoverBlock } from "./marp";

export const BLOCK_TEMPLATE_BASE_BLOCK_OPTIONS = [
  { value: "all", label: "All Standard Blocks" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "h5", label: "Heading 5" },
  { value: "h6", label: "Heading 6" },
  { value: "paragraph", label: "Paragraph" },
  { value: "table", label: "Table" },
  { value: "separator", label: "Separator" },
  { value: "blockquote", label: "Blockquote" },
  { value: "alert", label: "Alert" },
  { value: "code", label: "Code Block" },
  { value: "math", label: "Math Expression" },
  { value: "diagram", label: "Diagram" },
  { value: "grid", label: "Columns / Grid" },
  { value: "ol", label: "Ordered List" },
  { value: "ul", label: "Unordered List" },
  { value: "task-list", label: "Task List" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "carousel", label: "Image Carousel" },
  { value: "pdf", label: "PDF Viewer" },
  { value: "link", label: "Link" },
  { value: "marp-frontmatter", label: "MARP Frontmatter" },
  { value: "slide", label: "Slide Break" },
  { value: "marp-slide-directive", label: "Slide Directive" },
  { value: "marp-bg-image", label: "Background Image" },
  { value: "marp-style", label: "Custom CSS" },
  { value: "marp-voiceover", label: "Slide Narration" },
  { value: "shield-badge", label: "Shield Badge" },
  { value: "skill-icons", label: "Skill Icons" },
  { value: "typing-svg", label: "Typing SVG" },
  { value: "github-profile-cards", label: "GitHub Profile Cards" },
  { value: "learning-objective", label: "Learning Objectives" },
  { value: "quiz", label: "Quiz" },
  { value: "knowledge-check", label: "Knowledge Check" },
  { value: "flashcard", label: "Flashcard" },
  { value: "fill-in-the-blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching Activity" },
  { value: "hotspot", label: "Hotspot Image" },
  { value: "categorization", label: "Categorization" },
  { value: "time-requirements", label: "Time Requirement" },
  { value: "progress-marker", label: "Progress Marker" },
  { value: "course-nav", label: "Course Navigation" },
  { value: "branching", label: "Branching Scenario" },
];

export function getBlockTypeLabel(blockType) {
  return (
    BLOCK_TEMPLATE_BASE_BLOCK_OPTIONS.find((option) => option.value === blockType)?.label ||
    blockType ||
    "Unknown Block"
  );
}

export function createDefaultBlock(blockType, overrides = {}) {
  const blockId = overrides.id || Date.now().toString();

  const defaultContent = {
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    paragraph: "",
    blockquote: "",
    code: "```javascript\n// Your code here\n```",
    math: "$\\sqrt{3x-1}+(1+x)^2$",
    diagram: "```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```",
    alert: "Useful information that users should know, even when skimming content.",
    ul: "- Item 1\n- Item 2\n- Item 3",
    ol: "1. First item\n2. Second item\n3. Third item",
    "task-list": "- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3",
    separator: "",
    image: "",
    video: "",
    link: "",
    table: "| Header 1 | Header 2 |\n|----------|----------|\n| Add text..   | Add text..   |",
    "shield-badge": "",
    "skill-icons": "",
    "typing-svg": "",
    "github-profile-cards": "",
    "marp-frontmatter": "",
    slide: "",
    "marp-slide-directive": "",
    "marp-bg-image": "",
    "marp-style": "",
    "marp-voiceover": "",
  };

  return {
    id: blockId,
    type: blockType,
    content: defaultContent[blockType] || "",
    ...(blockType === "marp-voiceover"
      ? createDefaultMarpVoiceoverBlock({ id: blockId })
      : {}),
    ...(blockType === "image" && {
      alt: "",
      width: "",
      height: "",
      align: "left",
    }),
    ...(blockType === "video" && { title: "" }),
    ...(blockType === "link" && { url: "" }),
    ...(blockType === "shield-badge" && {
      label: "build",
      message: "passing",
      badgeColor: "brightgreen",
      style: "flat",
      logo: "",
    }),
    ...(blockType === "skill-icons" && {
      icons: "js,html,css",
      theme: "dark",
      perLine: "15",
    }),
    ...(blockType === "typing-svg" && {
      lines: ["Hi there! I'm a developer 👋"],
      font: "Fira Code",
      size: "28",
      duration: "3000",
      pause: "1000",
      color: "00FFB3",
      center: true,
      vCenter: true,
      width: "900",
      height: "80",
    }),
    ...(blockType === "github-profile-cards" && {
      username: "",
      align: "left",
      cards: [
        {
          cardType: "profile-details",
          theme: "material_palenight",
          utcOffset: "8",
          height: "",
          width: "",
        },
      ],
    }),
    ...(blockType === "alert" && {
      alertType: "note",
    }),
    ...(blockType === "marp-frontmatter" && {
      theme: "default",
      size: "16:9",
      paginate: false,
      header: "",
      footer: "",
      backgroundColor: "",
      color: "",
    }),
    ...(blockType === "marp-slide-directive" && {
      directives: [{ key: "_class", value: "" }],
    }),
    ...(blockType === "marp-bg-image" && {
      position: "bg",
      opacity: "",
    }),
    ...(blockType === "grid" && {
      columns: [
        {
          id: "nc_init_0",
          blocks: [
            { id: "nb_init_0", type: "h2", content: "" },
            { id: "nb_init_1", type: "paragraph", content: "" },
          ],
        },
        {
          id: "nc_init_1",
          blocks: [
            { id: "nb_init_2", type: "h2", content: "" },
            { id: "nb_init_3", type: "paragraph", content: "" },
          ],
        },
      ],
      weights: null,
    }),
    ...(blockType === "learning-objective" && {
      objectives: ["Learners will be able to…"],
    }),
    ...(blockType === "quiz" && {
      title: "",
      passThreshold: 80,
      maxAttempts: 0,
      questions: [
        {
          id: `q${Date.now()}`,
          type: "mcq",
          prompt: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          feedbackCorrect: "",
          feedbackIncorrect: "",
          points: 1,
        },
      ],
    }),
    ...(blockType === "knowledge-check" && {
      prompt: "",
      options: ["", "", ""],
      correctIndex: 0,
    }),
    ...(blockType === "flashcard" && {
      front: "",
      back: "",
    }),
    ...(blockType === "progress-marker" && {
      label: "Progress checkpoint",
    }),
    ...(blockType === "course-nav" && {
      prevLabel: "← Previous",
      nextLabel: "Next →",
      locked: false,
      position: "bottom",
      showProgress: false,
    }),
    ...(blockType === "branching" && {
      prompt: "",
      choices: [
        { id: "c1", label: "" },
        { id: "c2", label: "" },
      ],
    }),
    ...(blockType === "time-requirements" && {
      requiredMinutes: 2,
      showProgress: true,
      hideOnCompleted: false,
    }),
    ...(blockType === "categorization" && {
      prompt: "Sort the following items into the correct categories:",
      mode: "checklist",
      categories: [
        { id: "cat-1", label: "Category A" },
        { id: "cat-2", label: "Category B" },
      ],
      items: [
        { id: "item-1", content: "", categoryId: "cat-1" },
        { id: "item-2", content: "", categoryId: "cat-2" },
        { id: "item-3", content: "", categoryId: "cat-1" },
        { id: "item-4", content: "", categoryId: "cat-2" },
      ],
    }),
    ...(blockType === "carousel" && {
      images: [{ url: "", alt: "", caption: "" }],
      autoPlay: false,
      interval: 3000,
      showDots: true,
    }),
    ...(blockType === "pdf" && {
      url: "",
      title: "",
      height: "500px",
      showDownload: true,
    }),
    ...(blockType === "fill-in-the-blank" && {
      sentence: "The ___ is the powerhouse of the cell.",
      answers: ["mitochondria"],
      caseSensitive: false,
      feedbackCorrect: "✓ Correct! Well done.",
      feedbackIncorrect: "✗ Not quite — review and try again.",
    }),
    ...(blockType === "matching" && {
      prompt: "Match each term to its correct definition:",
      pairs: [
        { id: "p1", term: "Term 1", definition: "Definition A" },
        { id: "p2", term: "Term 2", definition: "Definition B" },
        { id: "p3", term: "Term 3", definition: "Definition C" },
      ],
    }),
    ...(blockType === "hotspot" && {
      imageUrl: "",
      alt: "",
      hotspots: [],
    }),
    ...overrides,
  };
}