import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Preview from "../Preview";

function makeTheme(overrides = {}) {
  return {
    headingFont: "Inter",
    bodyFont: "Inter",
    primaryColor: "#7c3aed",
    accentColor: "#06b6d4",
    bgColor: "#ffffff",
    displayOrientation: "landscape",
    displayResolution: "1366x768",
    ...overrides,
  };
}

describe("Preview", () => {
  it("uses MARP slide breaks to paginate the author preview", () => {
    render(
      <Preview
        theme={makeTheme()}
        blocks={[
          { id: "fm", type: "marp-frontmatter", size: "16:9" },
          { id: "one", type: "h1", content: "Slide One" },
          { id: "break", type: "slide" },
          { id: "two", type: "h1", content: "Slide Two" },
        ]}
      />
    );

    expect(screen.getAllByText("Slide One").length).toBeGreaterThan(0);
    expect(screen.queryByText("Slide Two")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));

    expect(screen.getAllByText("Slide Two").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Slide One")).toHaveLength(0);
  });
});