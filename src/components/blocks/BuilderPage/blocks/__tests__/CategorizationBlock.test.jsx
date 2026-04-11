/**
 * CategorizationBlock.test.jsx
 *
 * Tests for the CategorizationBlock eLearning block component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategorizationBlock from "../CategorizationBlock";

function makeBlock(overrides = {}) {
  return {
    id: "block-cat",
    type: "categorization",
    prompt: "Sort these items:",
    mode: "checklist",
    categories: [
      { id: "c1", label: "Plants" },
      { id: "c2", label: "Animals" },
    ],
    items: [
      { id: "i1", content: "Oak tree", categoryId: "c1" },
      { id: "i2", content: "Eagle", categoryId: "c2" },
      { id: "i3", content: "Rose", categoryId: "c1" },
    ],
    ...overrides,
  };
}

describe("CategorizationBlock", () => {
  it("renders the 'Categorization' header", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Categorization")).toBeInTheDocument();
  });

  it("renders the prompt text", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getAllByText("Sort these items:").length).toBeGreaterThan(0);
  });

  it("renders category labels in checklist mode", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getAllByText("Plants").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Animals").length).toBeGreaterThan(0);
  });

  it("renders item content in checklist mode", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Oak tree")).toBeInTheDocument();
    expect(screen.getByText("Eagle")).toBeInTheDocument();
    expect(screen.getByText("Rose")).toBeInTheDocument();
  });

  it("renders radio buttons for each item/category combination", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    const radios = screen.getAllByRole("radio");
    // 3 items × 2 categories = 6 radios
    expect(radios.length).toBe(6);
  });

  it("Submit button is disabled until all items are answered", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it("shows result after submitting all answers", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    const radios = screen.getAllByRole("radio");
    // Select a radio for each item
    fireEvent.click(radios[0]); // i1 → c1 (correct)
    fireEvent.click(radios[3]); // i2 → c2 (correct)
    fireEvent.click(radios[4]); // i3 → c2 (wrong, correct is c1)
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });

  it("Try Again button resets the block", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]);
    fireEvent.click(radios[3]);
    fireEvent.click(radios[4]);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    // After reset, submit button should be disabled again
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("renders edit controls in edit mode", () => {
    render(<CategorizationBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText(/Prompt/)).toBeInTheDocument();
    expect(screen.getByText(/Categories/)).toBeInTheDocument();
    expect(screen.getByText(/Items/)).toBeInTheDocument();
  });

  it("does not render edit controls when onUpdate is not a function", () => {
    render(<CategorizationBlock block={makeBlock()} />);
    expect(screen.queryByText(/Prompt/)).toBeNull();
    expect(screen.queryByText(/Categories/)).toBeNull();
  });

  it("calls onUpdate when adding a new category", () => {
    const onUpdate = vi.fn();
    render(<CategorizationBlock block={makeBlock()} onUpdate={onUpdate} />);
    // The "Add" button in categories section (not "Add Item")
    const addBtns = screen.getAllByRole("button", { name: /add/i });
    const addCatBtn = addBtns.find((b) => !b.textContent.includes("Item"));
    fireEvent.click(addCatBtn);
    expect(onUpdate).toHaveBeenCalledWith(
      "block-cat",
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({ label: "Category 3" }),
        ]),
      })
    );
  });

  it("calls onUpdate when adding a new item", () => {
    const onUpdate = vi.fn();
    render(<CategorizationBlock block={makeBlock()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(onUpdate).toHaveBeenCalledWith(
      "block-cat",
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ content: "" }),
        ]),
      })
    );
  });

  it("renders drag-drop zones in dragdrop mode", () => {
    render(<CategorizationBlock block={makeBlock({ mode: "dragdrop" })} onUpdate={vi.fn()} />);
    // Category zone titles should appear in the learner preview
    const plants = screen.getAllByText("Plants");
    expect(plants.length).toBeGreaterThan(0);
    // Pills for items should appear in the pool
    expect(screen.getByText("Oak tree")).toBeInTheDocument();
  });
});
