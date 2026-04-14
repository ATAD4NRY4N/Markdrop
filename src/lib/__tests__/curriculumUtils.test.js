import { describe, expect, it } from "vitest";
import {
  buildCourseCurriculumTags,
  buildCourseFolderPreview,
  buildLessonPathPreview,
  buildLessonRelativePath,
  buildModuleCurriculumTags,
  ensureMarkdownFileName,
  extractCourseCodeFromFeatureFolder,
  normalizeCourseCurriculumMetadata,
  normalizeModuleCurriculumMetadata,
} from "@/lib/curriculumUtils";

describe("curriculumUtils", () => {
  it("infers the course code from the product feature folder", () => {
    expect(
      extractCourseCodeFromFeatureFolder(
        "163DQ06-01-Introduction to the ONE Runtime Server",
      ),
    ).toBe("163DQ06");
  });

  it("normalizes course and lesson metadata into the expected repo path", () => {
    const courseMetadata = normalizeCourseCurriculumMetadata({
      productVersion: "163",
      productModule: "DQ",
      productFeatureFolder: "163DQ06-01-Introduction to the ONE Runtime Server",
    });
    const moduleMetadata = normalizeModuleCurriculumMetadata({
      lessonFolder: "01q Introduction to the ONE Runtime Server MCQ",
      markdownFileName:
        "163DQ06-01-Introduction to the ONE Runtime Server MCQ",
    });

    expect(courseMetadata.courseCode).toBe("163DQ06");
    expect(moduleMetadata.markdownFileName).toBe(
      "163DQ06-01-Introduction to the ONE Runtime Server MCQ.md",
    );
    expect(buildLessonRelativePath(courseMetadata, moduleMetadata)).toBe(
      "curriculum/lessons/163/DQ/163DQ06-01-Introduction to the ONE Runtime Server/01q Introduction to the ONE Runtime Server MCQ/163DQ06-01-Introduction to the ONE Runtime Server MCQ.md",
    );
  });

  it("derives curriculum tags for courses and modules", () => {
    const courseMetadata = {
      productVersion: "163",
      productModule: "DQ",
      productFeatureFolder: "163DQ06-01-Introduction to the ONE Runtime Server",
    };
    const moduleMetadata = {
      lessonFolder: "01q Introduction to the ONE Runtime Server MCQ",
      markdownFileName:
        "163DQ06-01-Introduction to the ONE Runtime Server MCQ.md",
    };

    expect(buildCourseCurriculumTags(courseMetadata)).toEqual([
      "course:163DQ06",
      "feature:163DQ06-01-Introduction to the ONE Runtime Server",
      "module:DQ",
      "version:163",
    ]);

    expect(buildModuleCurriculumTags(courseMetadata, moduleMetadata)).toEqual([
      "course:163DQ06",
      "feature:163DQ06-01-Introduction to the ONE Runtime Server",
      "file:163DQ06-01-Introduction to the ONE Runtime Server MCQ.md",
      "lesson:01q Introduction to the ONE Runtime Server MCQ",
      "module:DQ",
      "path:curriculum/lessons/163/DQ/163DQ06-01-Introduction to the ONE Runtime Server/01q Introduction to the ONE Runtime Server MCQ/163DQ06-01-Introduction to the ONE Runtime Server MCQ.md",
      "version:163",
    ]);
  });

  it("renders placeholder previews when metadata is incomplete", () => {
    expect(buildCourseFolderPreview({ productVersion: "163" })).toBe(
      "curriculum/lessons/163/{module}/{feature}",
    );
    expect(buildLessonPathPreview({}, {})).toBe(
      "curriculum/lessons/{version}/{module}/{feature}/{lesson}/{file}.md",
    );
  });

  it("ensures markdown filenames are safe and end with .md", () => {
    expect(ensureMarkdownFileName("  My Lesson  ")).toBe("My Lesson.md");
    expect(ensureMarkdownFileName("Bad/Name.md")).toBe("Bad-Name.md");
  });
});