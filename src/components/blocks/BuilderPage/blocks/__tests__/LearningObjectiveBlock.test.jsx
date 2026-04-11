/**
 * LearningObjectiveBlock.test.jsx
 *
 * Tests for the LearningObjectiveBlock eLearning block component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LearningObjectiveBlock from "../LearningObjectiveBlock";

function makeBlock(overrides = {}) {
  return { id: "block-1", type: "learning-objective", objectives: ["Learn React"], ...overrides };
}

describe("LearningObjectiveBlock", () => {
  it("renders the 'Learning Objectives' section header", () => {
    render(<LearningObjectiveBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Learning Objectives")).toBeInTheDocument();
  });

  it("renders all objectives as input fields", () => {
    const block = makeBlock({ objectives: ["Objective A", "Objective B"] });
    render(<LearningObjectiveBlock block={block} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("Objective A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Objective B")).toBeInTheDocument();
  });

  it("renders a single empty input when no objectives are provided (fallback)", () => {
    // block with no objectives property → falls back to [""] default
    render(
      <LearningObjectiveBlock
        block={{ id: "block-1", type: "learning-objective" }}
        onUpdate={vi.fn()}
      />
    );
    const inputs = screen.getAllByPlaceholderText(/Learners will be able to/i);
    expect(inputs).toHaveLength(1);
  });

  it("shows 'Add Objective' button", () => {
    render(<LearningObjectiveBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Add Objective")).toBeInTheDocument();
  });

  it("calls onUpdate with a new empty objective when 'Add Objective' is clicked", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ objectives: ["Objective A"] });
    render(<LearningObjectiveBlock block={block} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText("Add Objective"));

    expect(onUpdate).toHaveBeenCalledWith(
      "block-1",
      expect.objectContaining({ objectives: ["Objective A", ""] })
    );
  });

  it("calls onUpdate with updated value when an objective input changes", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ objectives: ["Old value"] });
    render(<LearningObjectiveBlock block={block} onUpdate={onUpdate} />);

    fireEvent.change(screen.getByDisplayValue("Old value"), {
      target: { value: "New value" },
    });

    expect(onUpdate).toHaveBeenCalledWith(
      "block-1",
      expect.objectContaining({ objectives: ["New value"] })
    );
  });

  it("calls onUpdate without the removed objective when delete button is clicked", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ objectives: ["Keep me", "Remove me"] });
    render(<LearningObjectiveBlock block={block} onUpdate={onUpdate} />);

    // Delete buttons are the Trash2 icon buttons — there are two; click the second
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    // The first non-"Add Objective" buttons are the trash buttons
    const trashButtons = deleteButtons.filter((b) => !b.textContent.includes("Add"));
    fireEvent.click(trashButtons[1]);

    expect(onUpdate).toHaveBeenCalledWith(
      "block-1",
      expect.objectContaining({ objectives: ["Keep me"] })
    );
  });

  it("keeps at least one (empty) objective row when the last objective is deleted", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ objectives: ["Only one"] });
    render(<LearningObjectiveBlock block={block} onUpdate={onUpdate} />);

    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const trashButtons = deleteButtons.filter((b) => !b.textContent.includes("Add"));
    fireEvent.click(trashButtons[0]);

    expect(onUpdate).toHaveBeenCalledWith(
      "block-1",
      expect.objectContaining({ objectives: [""] })
    );
  });

  it("shows sequential numbering for objectives", () => {
    const block = makeBlock({ objectives: ["A", "B", "C"] });
    render(<LearningObjectiveBlock block={block} onUpdate={vi.fn()} />);
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });
});
