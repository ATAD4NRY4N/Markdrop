/**
 * TimeRequirementsBlock.test.jsx
 *
 * Tests for the TimeRequirementsBlock eLearning block component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TimeRequirementsBlock from "../TimeRequirementsBlock";

function makeBlock(overrides = {}) {
  return {
    id: "block-tr",
    type: "time-requirements",
    requiredMinutes: 2,
    showProgress: true,
    hideOnCompleted: false,
    ...overrides,
  };
}

describe("TimeRequirementsBlock", () => {
  it("renders the 'Time Requirement' section header", () => {
    render(<TimeRequirementsBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Time Requirement")).toBeInTheDocument();
  });

  it("shows the required minutes in the message", () => {
    render(<TimeRequirementsBlock block={makeBlock({ requiredMinutes: 3 })} onUpdate={vi.fn()} />);
    expect(screen.getByText(/3 minute/)).toBeInTheDocument();
  });

  it("shows progress bar when showProgress is true", () => {
    render(<TimeRequirementsBlock block={makeBlock({ showProgress: true })} onUpdate={vi.fn()} />);
    expect(screen.getByText(/0:00 elapsed/)).toBeInTheDocument();
  });

  it("does not show progress bar when showProgress is false", () => {
    render(<TimeRequirementsBlock block={makeBlock({ showProgress: false })} onUpdate={vi.fn()} />);
    expect(screen.queryByText(/elapsed/)).toBeNull();
  });

  it("renders edit controls (Required Time input) in edit mode", () => {
    render(<TimeRequirementsBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText(/Required Time/)).toBeInTheDocument();
  });

  it("does not render edit controls when onUpdate is not a function", () => {
    render(<TimeRequirementsBlock block={makeBlock()} />);
    expect(screen.queryByText(/Required Time/)).toBeNull();
  });

  it("calls onUpdate with updated requiredMinutes when input changes", () => {
    const onUpdate = vi.fn();
    render(<TimeRequirementsBlock block={makeBlock({ requiredMinutes: 2 })} onUpdate={onUpdate} />);
    const input = screen.getByDisplayValue("2");
    fireEvent.change(input, { target: { value: "5" } });
    expect(onUpdate).toHaveBeenCalledWith(
      "block-tr",
      expect.objectContaining({ requiredMinutes: 5 })
    );
  });

  it("calls onUpdate when showProgress switch is toggled", () => {
    const onUpdate = vi.fn();
    render(<TimeRequirementsBlock block={makeBlock({ showProgress: true })} onUpdate={onUpdate} />);
    const toggles = screen.getAllByRole("switch");
    fireEvent.click(toggles[0]);
    expect(onUpdate).toHaveBeenCalledWith(
      "block-tr",
      expect.objectContaining({ showProgress: false })
    );
  });

  it("calls onUpdate when hideOnCompleted switch is toggled", () => {
    const onUpdate = vi.fn();
    render(<TimeRequirementsBlock block={makeBlock({ hideOnCompleted: false })} onUpdate={onUpdate} />);
    const toggles = screen.getAllByRole("switch");
    fireEvent.click(toggles[1]);
    expect(onUpdate).toHaveBeenCalledWith(
      "block-tr",
      expect.objectContaining({ hideOnCompleted: true })
    );
  });
});
