/**
 * KnowledgeCheckBlock.test.jsx
 *
 * Tests for the KnowledgeCheckBlock eLearning block component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import KnowledgeCheckBlock from "../KnowledgeCheckBlock";

function makeBlock(overrides = {}) {
  return {
    id: "block-kc",
    type: "knowledge-check",
    prompt: "",
    options: ["Option A", "Option B", "Option C"],
    correctIndex: 0,
    ...overrides,
  };
}

describe("KnowledgeCheckBlock", () => {
  it("renders the 'Knowledge Check' section header", () => {
    render(<KnowledgeCheckBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Knowledge Check")).toBeInTheDocument();
  });

  it("shows '(no scoring)' subtitle", () => {
    render(<KnowledgeCheckBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("(no scoring)")).toBeInTheDocument();
  });

  it("renders the Question textarea", () => {
    render(<KnowledgeCheckBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(
      screen.getByPlaceholderText(/Ask a quick comprehension question/i)
    ).toBeInTheDocument();
  });

  it("renders all options as inputs", () => {
    const block = makeBlock({ options: ["Alpha", "Beta", "Gamma"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("Alpha")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Beta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Gamma")).toBeInTheDocument();
  });

  it("calls onUpdate when a question is typed", () => {
    const onUpdate = vi.fn();
    render(<KnowledgeCheckBlock block={makeBlock()} onUpdate={onUpdate} />);
    const textarea = screen.getByPlaceholderText(/Ask a quick comprehension question/i);
    fireEvent.change(textarea, { target: { value: "What is 2+2?" } });
    expect(onUpdate).toHaveBeenCalledWith(
      "block-kc",
      expect.objectContaining({ prompt: "What is 2+2?" })
    );
  });

  it("calls onUpdate with updated option value when option input changes", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ options: ["Old", "B", "C"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByDisplayValue("Old"), { target: { value: "New" } });
    expect(onUpdate).toHaveBeenCalledWith(
      "block-kc",
      expect.objectContaining({ options: ["New", "B", "C"] })
    );
  });

  it("calls onUpdate with updated correctIndex when circle button is clicked", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ options: ["A", "B", "C"], correctIndex: 0 });
    render(<KnowledgeCheckBlock block={block} onUpdate={onUpdate} />);
    // There are 3 circle buttons (one per option); click the second
    const circles = screen.getAllByRole("button").filter((b) => b.className.includes("rounded-full"));
    fireEvent.click(circles[1]);
    expect(onUpdate).toHaveBeenCalledWith(
      "block-kc",
      expect.objectContaining({ correctIndex: 1 })
    );
  });

  it("adds an option when '+ Add option' is clicked", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ options: ["A", "B", "C"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("+ Add option"));
    expect(onUpdate).toHaveBeenCalledWith(
      "block-kc",
      expect.objectContaining({ options: ["A", "B", "C", ""] })
    );
  });

  it("removes an option when its Trash button is clicked (if > 2 options)", () => {
    const onUpdate = vi.fn();
    const block = makeBlock({ options: ["A", "B", "C"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={onUpdate} />);
    // The Trash buttons in the options list are icon buttons with no text content
    // and are NOT disabled (options.length > 2). Find by not-disabled + no text.
    const allButtons = screen.getAllByRole("button");
    const trashButtons = allButtons.filter((b) => !b.disabled && b.textContent.trim() === "");
    // There are 3 trash buttons (one per option) + the circle buttons
    // but circle buttons also have no text. Differentiate by data-slot + class.
    // The Trash2 buttons have class containing "size-9" (from ghost icon size).
    const iconTrashButtons = allButtons.filter(
      (b) => !b.disabled && b.dataset.slot === "button" && /size-9/.test(b.className)
    );
    fireEvent.click(iconTrashButtons[0]);
    expect(onUpdate).toHaveBeenCalledWith(
      "block-kc",
      expect.objectContaining({ options: ["B", "C"] })
    );
  });

  it("disables trash buttons when only 2 options remain", () => {
    const block = makeBlock({ options: ["A", "B"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={vi.fn()} />);
    const iconTrashButtons = screen
      .getAllByRole("button")
      .filter((b) => b.dataset.slot === "button" && /size-9/.test(b.className));
    iconTrashButtons.forEach((b) => expect(b).toBeDisabled());
  });

  it("shows the learner preview section when prompt is set", () => {
    const block = makeBlock({ prompt: "What is 2+2?", options: ["3", "4", "5"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={vi.fn()} />);
    expect(screen.getByText("Learner preview")).toBeInTheDocument();
    // The prompt appears in both the editor textarea and the preview paragraph
    const instances = screen.getAllByText("What is 2+2?");
    expect(instances.length).toBeGreaterThanOrEqual(1);
  });

  it("hides learner preview when prompt is empty", () => {
    const block = makeBlock({ prompt: "" });
    render(<KnowledgeCheckBlock block={block} onUpdate={vi.fn()} />);
    expect(screen.queryByText("Learner preview")).not.toBeInTheDocument();
  });

  it("shows 'Reset preview' after a learner preview option is clicked", () => {
    const block = makeBlock({ prompt: "Q?", options: ["A", "B", "C"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={vi.fn()} />);

    // Preview options are in the "Learner preview" section
    const previewArea = screen.getByText("Learner preview").closest("div");
    const previewButtons = previewArea.querySelectorAll("button");
    // First button is option A
    fireEvent.click(previewButtons[0]);

    expect(screen.getByText("Reset preview")).toBeInTheDocument();
  });

  it("resets preview state when 'Reset preview' is clicked", () => {
    const block = makeBlock({ prompt: "Q?", options: ["A", "B", "C"] });
    render(<KnowledgeCheckBlock block={block} onUpdate={vi.fn()} />);

    const previewArea = screen.getByText("Learner preview").closest("div");
    const previewButtons = previewArea.querySelectorAll("button");
    fireEvent.click(previewButtons[0]);
    fireEvent.click(screen.getByText("Reset preview"));

    expect(screen.queryByText("Reset preview")).not.toBeInTheDocument();
  });
});
