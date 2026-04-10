/**
 * FlashcardBlock.test.jsx
 *
 * Tests for the FlashcardBlock eLearning block component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FlashcardBlock from "../FlashcardBlock";

function makeBlock(overrides = {}) {
  return { id: "block-fc", type: "flashcard", front: "", back: "", ...overrides };
}

describe("FlashcardBlock", () => {
  it("renders the 'Flashcard' section header", () => {
    render(<FlashcardBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Flashcard")).toBeInTheDocument();
  });

  it("renders Front and Back labels", () => {
    render(<FlashcardBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("shows front textarea with current value", () => {
    render(<FlashcardBlock block={makeBlock({ front: "What is React?" })} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("What is React?")).toBeInTheDocument();
  });

  it("shows back textarea with current value", () => {
    render(<FlashcardBlock block={makeBlock({ back: "A JavaScript UI library" })} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("A JavaScript UI library")).toBeInTheDocument();
  });

  it("calls onUpdate with updated front when front textarea changes", () => {
    const onUpdate = vi.fn();
    render(<FlashcardBlock block={makeBlock({ front: "Old front" })} onUpdate={onUpdate} />);

    fireEvent.change(screen.getByDisplayValue("Old front"), {
      target: { value: "New front" },
    });

    expect(onUpdate).toHaveBeenCalledWith(
      "block-fc",
      expect.objectContaining({ front: "New front" })
    );
  });

  it("calls onUpdate with updated back when back textarea changes", () => {
    const onUpdate = vi.fn();
    render(<FlashcardBlock block={makeBlock({ back: "Old back" })} onUpdate={onUpdate} />);

    fireEvent.change(screen.getByDisplayValue("Old back"), {
      target: { value: "New back" },
    });

    expect(onUpdate).toHaveBeenCalledWith(
      "block-fc",
      expect.objectContaining({ back: "New back" })
    );
  });

  it("does not show the preview card when both front and back are empty", () => {
    render(<FlashcardBlock block={makeBlock({ front: "", back: "" })} onUpdate={vi.fn()} />);
    expect(screen.queryByText(/click to flip/i)).not.toBeInTheDocument();
  });

  it("shows preview card when front has content", () => {
    render(
      <FlashcardBlock block={makeBlock({ front: "A question", back: "" })} onUpdate={vi.fn()} />
    );
    // The preview card button should be present
    expect(screen.getByRole("button", { name: /click to flip/i })).toBeInTheDocument();
    // The front content appears in both the textarea and the preview paragraph
    const matches = screen.getAllByText("A question");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("preview starts showing the front side", () => {
    render(
      <FlashcardBlock block={makeBlock({ front: "Front text", back: "Back text" })} onUpdate={vi.fn()} />
    );
    // The preview label span contains "front — click to flip"
    expect(screen.getByText(/front — click to flip/i)).toBeInTheDocument();
    // The preview paragraph shows front content
    const previewCard = screen.getByRole("button", { name: /click to flip/i });
    expect(previewCard).toHaveTextContent("Front text");
  });

  it("flips to back when the preview card is clicked", () => {
    render(
      <FlashcardBlock block={makeBlock({ front: "Front text", back: "Back text" })} onUpdate={vi.fn()} />
    );

    const previewCard = screen.getByRole("button", { name: /click to flip/i });
    fireEvent.click(previewCard);

    expect(screen.getByText(/back — click to flip/i)).toBeInTheDocument();
    expect(previewCard).toHaveTextContent("Back text");
  });

  it("flips back to front on second click", () => {
    render(
      <FlashcardBlock block={makeBlock({ front: "Front text", back: "Back text" })} onUpdate={vi.fn()} />
    );

    const previewCard = screen.getByRole("button", { name: /click to flip/i });
    fireEvent.click(previewCard); // → back
    fireEvent.click(previewCard); // → front again

    expect(screen.getByText(/front — click to flip/i)).toBeInTheDocument();
    expect(previewCard).toHaveTextContent("Front text");
  });
});
