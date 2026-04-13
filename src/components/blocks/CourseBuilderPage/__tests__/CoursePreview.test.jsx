import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CoursePreview from "../CoursePreview";

describe("CoursePreview", () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resizes the dialog shell when device presets change", () => {
    render(
      <CoursePreview
        open
        onOpenChange={vi.fn()}
        course={{ title: "Demo Course" }}
        modules={[{ id: "module-1", title: "Intro", blocks_json: "[]" }]}
        theme={{ displayOrientation: "landscape", displayResolution: "1366x768" }}
      />
    );

    const dialog = document.querySelector('[data-slot="dialog-content"]');
    expect(dialog?.getAttribute("style") || "").toContain("1470px");

    fireEvent.click(screen.getByRole("radio", { name: /tablet preview/i }));
    expect(dialog?.getAttribute("style") || "").toContain("1184px");

    fireEvent.click(screen.getByRole("radio", { name: /mobile 16:9 preview/i }));
    expect(dialog?.getAttribute("style") || "").toContain("712px");

    fireEvent.click(screen.getByRole("radio", { name: /mobile 9:16 preview/i }));
    expect(dialog?.getAttribute("style") || "").toContain("432px");
  });
});