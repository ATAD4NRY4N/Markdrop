import { describe, expect, it } from "vitest";
import {
  DEFAULT_COURSE_DISPLAY_SETTINGS,
  getCourseCanvasSize,
  getLearnerDeviceSize,
  getPreviewFitScale,
  normalizeCourseDisplaySettings,
} from "../courseDisplay";

describe("courseDisplay", () => {
  it("falls back to default display settings", () => {
    expect(normalizeCourseDisplaySettings()).toEqual(DEFAULT_COURSE_DISPLAY_SETTINGS);
    expect(normalizeCourseDisplaySettings({ displayOrientation: "sideways" })).toEqual(
      DEFAULT_COURSE_DISPLAY_SETTINGS
    );
  });

  it("swaps canvas dimensions for portrait orientation", () => {
    expect(
      getCourseCanvasSize({ displayOrientation: "portrait", displayResolution: "1280x720" })
    ).toEqual({ width: 720, height: 1280 });
  });

  it("uses course orientation for learner device frames", () => {
    expect(getLearnerDeviceSize("tablet", { displayOrientation: "portrait" })).toEqual({
      width: 834,
      height: 1112,
    });
    expect(getLearnerDeviceSize("mobile-16-9", { displayOrientation: "portrait" })).toEqual({
      width: 640,
      height: 360,
    });
    expect(getLearnerDeviceSize("mobile-9-16", { displayOrientation: "landscape" })).toEqual({
      width: 360,
      height: 640,
    });
  });

  it("scales oversized course canvases down to fit the preview viewport", () => {
    expect(
      getPreviewFitScale({ width: 640, height: 360 }, { width: 1366, height: 768 })
    ).toBeCloseTo(640 / 1366, 4);
    expect(
      getPreviewFitScale({ width: 1600, height: 900 }, { width: 1366, height: 768 })
    ).toBe(1);
  });
});