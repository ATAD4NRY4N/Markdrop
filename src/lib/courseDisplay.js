export const DEFAULT_COURSE_DISPLAY_SETTINGS = {
  displayOrientation: "landscape",
  displayResolution: "1366x768",
};

export const COURSE_RESOLUTION_PRESETS = [
  { value: "1024x768", label: "XGA", width: 1024, height: 768 },
  { value: "1280x720", label: "HD", width: 1280, height: 720 },
  { value: "1366x768", label: "HD+", width: 1366, height: 768 },
  { value: "1600x900", label: "HD+ Wide", width: 1600, height: 900 },
  { value: "1920x1080", label: "Full HD", width: 1920, height: 1080 },
];

export const LEARNER_DEVICE_PRESETS = [
  { value: "desktop", label: "Desktop / Web" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile-16-9", label: "Mobile 16:9" },
  { value: "mobile-9-16", label: "Mobile 9:16" },
];

const LEARNER_DEVICE_BASE_SIZES = {
  desktop: null,
  tablet: { width: 834, height: 1112 },
  "mobile-16-9": { width: 640, height: 360 },
  "mobile-9-16": { width: 360, height: 640 },
  mobile: { width: 360, height: 640 },
};

const DEFAULT_RESOLUTION_PRESET = COURSE_RESOLUTION_PRESETS[2];

export function getResolutionPreset(value) {
  return (
    COURSE_RESOLUTION_PRESETS.find((preset) => preset.value === value) || DEFAULT_RESOLUTION_PRESET
  );
}

export function normalizeCourseDisplaySettings(value = {}) {
  const displayOrientation =
    value.displayOrientation === "portrait" ? "portrait" : DEFAULT_COURSE_DISPLAY_SETTINGS.displayOrientation;
  const preset = getResolutionPreset(value.displayResolution);

  return {
    displayOrientation,
    displayResolution: preset.value,
  };
}

export function withNormalizedCourseDisplaySettings(value = {}) {
  return {
    ...value,
    ...normalizeCourseDisplaySettings(value),
  };
}

export function applyOrientationToSize(size, orientation = DEFAULT_COURSE_DISPLAY_SETTINGS.displayOrientation) {
  if (!size) return { width: DEFAULT_RESOLUTION_PRESET.width, height: DEFAULT_RESOLUTION_PRESET.height };

  const wantsPortrait = orientation === "portrait";
  const isLandscape = size.width >= size.height;

  if ((wantsPortrait && isLandscape) || (!wantsPortrait && !isLandscape)) {
    return { width: size.height, height: size.width };
  }

  return { width: size.width, height: size.height };
}

export function getCourseCanvasSize(value = {}) {
  const settings = normalizeCourseDisplaySettings(value);
  const preset = getResolutionPreset(settings.displayResolution);
  return applyOrientationToSize(preset, settings.displayOrientation);
}

export function getCourseCanvasLabel(value = {}) {
  const settings = normalizeCourseDisplaySettings(value);
  const preset = getResolutionPreset(settings.displayResolution);
  const size = getCourseCanvasSize(settings);
  const orientationLabel =
    settings.displayOrientation === "portrait" ? "Portrait" : "Landscape";

  return `${orientationLabel} · ${preset.label} · ${size.width} x ${size.height}`;
}

export function getCourseAspectRatio(value = {}) {
  const size = getCourseCanvasSize(value);
  return `${size.width} / ${size.height}`;
}

export function getCourseContentMaxWidth(value = {}) {
  const size = getCourseCanvasSize(value);
  return Math.max(320, size.width - 160);
}

export function getPreviewFitScale(viewportSize = {}, contentSize = {}) {
  const viewportWidth = Number(viewportSize.width || 0);
  const viewportHeight = Number(viewportSize.height || 0);
  const contentWidth = Number(contentSize.width || 0);
  const contentHeight = Number(contentSize.height || 0);

  if (!viewportWidth || !viewportHeight || !contentWidth || !contentHeight) {
    return 1;
  }

  return Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight, 1);
}

export function getLearnerDeviceSize(device = "desktop", value = {}) {
  if (device === "desktop") {
    return getCourseCanvasSize(value);
  }

  if (device === "mobile-16-9" || device === "mobile-9-16") {
    const baseSize = LEARNER_DEVICE_BASE_SIZES[device];
    return { width: baseSize.width, height: baseSize.height };
  }

  const settings = normalizeCourseDisplaySettings(value);
  const baseSize = LEARNER_DEVICE_BASE_SIZES[device] || LEARNER_DEVICE_BASE_SIZES.mobile;
  return applyOrientationToSize(baseSize, settings.displayOrientation);
}

export function getLearnerDeviceLabel(device = "desktop") {
  return LEARNER_DEVICE_PRESETS.find((preset) => preset.value === device)?.label || "Desktop / Web";
}

export function isMarpPresentation(blocks = []) {
  return blocks.some((block) => block?.type === "marp-frontmatter" || block?.type === "slide");
}
