const CURRICULUM_ROOT_SEGMENTS = ["curriculum", "lessons"];

const INVALID_PATH_SEGMENT_RE = /[<>:"/\\|?*\u0000-\u001F]/g;
const MULTISPACE_RE = /\s+/g;

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .replace(INVALID_PATH_SEGMENT_RE, "-")
    .replace(MULTISPACE_RE, " ")
    .replace(/[. ]+$/g, "");

const uniqueSorted = (values = []) =>
  [...new Set((values || []).filter(Boolean))].sort((left, right) =>
    String(left).localeCompare(String(right)),
  );

export const extractCourseCodeFromFeatureFolder = (productFeatureFolder = "") => {
  const normalizedFeature = normalizeText(productFeatureFolder);
  const match = normalizedFeature.match(/^([^-]+)/);
  return match?.[1] || "";
};

export const ensureMarkdownFileName = (value = "") => {
  const trimmed = normalizeText(value).replace(/\.md$/i, "");
  return trimmed ? `${trimmed}.md` : "";
};

export const normalizeCourseCurriculumMetadata = (metadata = {}) => {
  const productVersion = normalizeText(metadata.productVersion);
  const productModule = normalizeText(metadata.productModule);
  const productFeatureFolder = normalizeText(
    metadata.productFeatureFolder || metadata.productFeature,
  );
  const courseCode =
    normalizeText(metadata.courseCode) ||
    extractCourseCodeFromFeatureFolder(productFeatureFolder);

  return {
    productVersion,
    productModule,
    courseCode,
    productFeatureFolder,
  };
};

export const normalizeModuleCurriculumMetadata = (metadata = {}) => ({
  lessonFolder: normalizeText(metadata.lessonFolder),
  markdownFileName: ensureMarkdownFileName(
    metadata.markdownFileName || metadata.fileName,
  ),
});

export const parseCourseCurriculumMetadata = (value = "{}") => {
  if (value && typeof value === "object") {
    return normalizeCourseCurriculumMetadata(value);
  }

  try {
    return normalizeCourseCurriculumMetadata(JSON.parse(value || "{}"));
  } catch {
    return normalizeCourseCurriculumMetadata({});
  }
};

export const parseModuleCurriculumMetadata = (value = "{}") => {
  if (value && typeof value === "object") {
    return normalizeModuleCurriculumMetadata(value);
  }

  try {
    return normalizeModuleCurriculumMetadata(JSON.parse(value || "{}"));
  } catch {
    return normalizeModuleCurriculumMetadata({});
  }
};

export const buildCourseCurriculumTags = (courseMetadata = {}) => {
  const normalized = normalizeCourseCurriculumMetadata(courseMetadata);

  return uniqueSorted([
    normalized.productVersion && `version:${normalized.productVersion}`,
    normalized.productModule && `module:${normalized.productModule}`,
    normalized.courseCode && `course:${normalized.courseCode}`,
    normalized.productFeatureFolder && `feature:${normalized.productFeatureFolder}`,
  ]);
};

export const buildModuleCurriculumTags = (
  courseMetadata = {},
  moduleMetadata = {},
) => {
  const normalizedModule = normalizeModuleCurriculumMetadata(moduleMetadata);
  const path = buildLessonRelativePath(courseMetadata, normalizedModule);

  return uniqueSorted([
    ...buildCourseCurriculumTags(courseMetadata),
    normalizedModule.lessonFolder && `lesson:${normalizedModule.lessonFolder}`,
    normalizedModule.markdownFileName && `file:${normalizedModule.markdownFileName}`,
    path && `path:${path}`,
  ]);
};

export const buildCourseFolderPreview = (courseMetadata = {}) => {
  const normalized = normalizeCourseCurriculumMetadata(courseMetadata);

  return [
    ...CURRICULUM_ROOT_SEGMENTS,
    normalized.productVersion || "{version}",
    normalized.productModule || "{module}",
    normalized.productFeatureFolder || "{feature}",
  ].join("/");
};

export const buildLessonRelativePath = (
  courseMetadata = {},
  moduleMetadata = {},
) => {
  const normalizedCourse = normalizeCourseCurriculumMetadata(courseMetadata);
  const normalizedModule = normalizeModuleCurriculumMetadata(moduleMetadata);

  if (
    !normalizedCourse.productVersion ||
    !normalizedCourse.productModule ||
    !normalizedCourse.productFeatureFolder ||
    !normalizedModule.lessonFolder ||
    !normalizedModule.markdownFileName
  ) {
    return "";
  }

  return [
    ...CURRICULUM_ROOT_SEGMENTS,
    normalizedCourse.productVersion,
    normalizedCourse.productModule,
    normalizedCourse.productFeatureFolder,
    normalizedModule.lessonFolder,
    normalizedModule.markdownFileName,
  ].join("/");
};

export const buildLessonPathPreview = (
  courseMetadata = {},
  moduleMetadata = {},
) => {
  const normalizedCourse = normalizeCourseCurriculumMetadata(courseMetadata);
  const normalizedModule = normalizeModuleCurriculumMetadata(moduleMetadata);

  return [
    ...CURRICULUM_ROOT_SEGMENTS,
    normalizedCourse.productVersion || "{version}",
    normalizedCourse.productModule || "{module}",
    normalizedCourse.productFeatureFolder || "{feature}",
    normalizedModule.lessonFolder || "{lesson}",
    normalizedModule.markdownFileName || "{file}.md",
  ].join("/");
};