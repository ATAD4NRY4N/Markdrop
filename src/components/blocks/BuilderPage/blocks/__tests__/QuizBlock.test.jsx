/**
 * QuizBlock.test.jsx
 *
 * Tests for the QuizBlock eLearning block component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizBlock from "../QuizBlock";

function makeQuestion(overrides = {}) {
  return {
    id: "q-test",
    type: "mcq",
    prompt: "What is React?",
    options: ["A library", "A framework", "A database"],
    correctIndex: 0,
    feedbackCorrect: "Correct!",
    feedbackIncorrect: "Wrong!",
    points: 1,
    ...overrides,
  };
}

function makeBlock(overrides = {}) {
  return {
    id: "block-quiz",
    type: "quiz",
    title: "Chapter Quiz",
    passThreshold: 80,
    questions: [makeQuestion()],
    ...overrides,
  };
}

describe("QuizBlock", () => {
  it("renders the 'Quiz' section header", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText("Quiz")).toBeInTheDocument();
  });

  it("shows question count in the header", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText(/1 question/)).toBeInTheDocument();
  });

  it("shows total points in the header", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByText(/1 pts/)).toBeInTheDocument();
  });

  it("shows the quiz title input pre-filled", () => {
    render(<QuizBlock block={makeBlock({ title: "My Quiz" })} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("My Quiz")).toBeInTheDocument();
  });

  it("calls onUpdate when quiz title changes", () => {
    const onUpdate = vi.fn();
    render(<QuizBlock block={makeBlock({ title: "Old title" })} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByDisplayValue("Old title"), {
      target: { value: "New title" },
    });
    expect(onUpdate).toHaveBeenCalledWith(
      "block-quiz",
      expect.objectContaining({ title: "New title" })
    );
  });

  it("shows a 'Preview' button in edit mode", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByTitle("Preview")).toBeInTheDocument();
  });

  it("switches to preview mode when 'Preview' button is clicked", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    // In preview mode the button switches to "Edit"
    expect(screen.getByTitle("Edit")).toBeInTheDocument();
  });

  it("shows question prompt in editor mode", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("What is React?")).toBeInTheDocument();
  });

  it("renders MCQ option inputs in editor mode", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    expect(screen.getByDisplayValue("A library")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A framework")).toBeInTheDocument();
  });

  it("calls onUpdate when a question prompt changes", () => {
    const onUpdate = vi.fn();
    render(<QuizBlock block={makeBlock()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByDisplayValue("What is React?"), {
      target: { value: "What is Vue?" },
    });
    expect(onUpdate).toHaveBeenCalledWith(
      "block-quiz",
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({ prompt: "What is Vue?" }),
        ]),
      })
    );
  });

  it("adds a second question when 'Add Question' is clicked", () => {
    const onUpdate = vi.fn();
    render(<QuizBlock block={makeBlock()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("Add Question"));
    expect(onUpdate).toHaveBeenCalledWith(
      "block-quiz",
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({ type: "mcq" }), // original
          expect.objectContaining({ type: "mcq" }), // new
        ]),
      })
    );
    const call = onUpdate.mock.calls[0][1];
    expect(call.questions).toHaveLength(2);
  });

  it("shows 2 questions and 2 pts in header after adding a question", () => {
    const block = makeBlock({
      questions: [makeQuestion(), makeQuestion({ id: "q-2", prompt: "Q2" })],
    });
    render(<QuizBlock block={block} onUpdate={vi.fn()} />);
    expect(screen.getByText(/2 questions/)).toBeInTheDocument();
    expect(screen.getByText(/2 pts/)).toBeInTheDocument();
  });

  // ── Preview mode ───────────────────────────────────────────────────────────

  it("shows the question prompt in preview mode", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    // The prompt is rendered as "{index + 1}. {prompt}" across sibling text nodes
    expect(screen.getByText(/What is React\?/)).toBeInTheDocument();
  });

  it("renders MCQ option buttons in preview mode", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    expect(screen.getByText("A library")).toBeInTheDocument();
    expect(screen.getByText("A framework")).toBeInTheDocument();
  });

  it("shows Submit button initially disabled in preview mode (nothing selected)", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    const submitBtn = screen.getByText("Submit").closest("button");
    expect(submitBtn).toBeDisabled();
  });

  it("Submit becomes enabled after selecting an MCQ option in preview", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    // Click the first option button in the preview
    fireEvent.click(screen.getByText("A library"));
    const submitBtn = screen.getByText("Submit").closest("button");
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows correct feedback after submitting the right MCQ answer in preview", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    fireEvent.click(screen.getByText("A library")); // correctIndex: 0
    fireEvent.click(screen.getByText("Submit").closest("button"));
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("shows incorrect feedback after submitting the wrong MCQ answer in preview", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    fireEvent.click(screen.getByText("A framework")); // wrong
    fireEvent.click(screen.getByText("Submit").closest("button"));
    expect(screen.getByText("Wrong!")).toBeInTheDocument();
  });

  it("Reset button returns preview to initial state", () => {
    render(<QuizBlock block={makeBlock()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    fireEvent.click(screen.getByText("A library"));
    fireEvent.click(screen.getByText("Submit").closest("button"));
    fireEvent.click(screen.getByText("Reset"));

    // Submit should be disabled again (nothing selected after reset)
    const submitBtn = screen.getByText("Submit").closest("button");
    expect(submitBtn).toBeDisabled();
  });

  // ── True/False questions ───────────────────────────────────────────────────

  it("renders True/False buttons in preview for a tf question", () => {
    const block = makeBlock({
      questions: [makeQuestion({ type: "tf", correctTF: "True" })],
    });
    render(<QuizBlock block={block} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    expect(screen.getByText("True")).toBeInTheDocument();
    expect(screen.getByText("False")).toBeInTheDocument();
  });

  it("enables Submit after clicking True in preview", () => {
    const block = makeBlock({
      questions: [makeQuestion({ type: "tf", correctTF: "True", prompt: "React is declarative?" })],
    });
    render(<QuizBlock block={block} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    fireEvent.click(screen.getByText("True"));
    expect(screen.getByText("Submit").closest("button")).not.toBeDisabled();
  });

  // ── Fill in the Blank questions ────────────────────────────────────────────

  it("renders a text input in preview for a fitb question", () => {
    const block = makeBlock({
      questions: [
        makeQuestion({
          type: "fitb",
          prompt: "React is a ___.",
          acceptedAnswers: ["library"],
        }),
      ],
    });
    render(<QuizBlock block={block} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    expect(screen.getByPlaceholderText(/Type your answer/i)).toBeInTheDocument();
  });

  it("enables Submit after typing in fitb preview", () => {
    const block = makeBlock({
      questions: [
        makeQuestion({ type: "fitb", prompt: "React is ___.", acceptedAnswers: ["fast"] }),
      ],
    });
    render(<QuizBlock block={block} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByTitle("Preview"));
    const input = screen.getByPlaceholderText(/Type your answer/i);
    fireEvent.change(input, { target: { value: "fast" } });
    expect(screen.getByText("Submit").closest("button")).not.toBeDisabled();
  });
});
