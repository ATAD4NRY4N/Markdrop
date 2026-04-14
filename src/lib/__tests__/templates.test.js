import { beforeEach, describe, expect, it, vi } from "vitest";

function makeChainMock() {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}

const mockChain = makeChainMock();
const fromMock = vi.fn(() => mockChain);
const createModuleMock = vi.fn();
const updateCourseMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

vi.mock("@/lib/storage", () => ({
  createCourse: vi.fn(),
  createModule: createModuleMock,
  deleteCourse: vi.fn(),
  updateCourse: updateCourseMock,
}));

const { getTemplatePermissions, resolveTemplateEditorCourse, updateTemplate } = await import("@/lib/templates");

beforeEach(() => {
  vi.clearAllMocks();
  mockChain.maybeSingle.mockResolvedValue({ data: null, error: null });
  mockChain.single.mockResolvedValue({ data: null, error: null });
  createModuleMock.mockReset();
  createModuleMock.mockImplementation(async (courseId, title, order, blocksJson) => ({
    id: `module-${order}`,
    course_id: courseId,
    title,
    order,
    blocks_json: blocksJson,
  }));
  updateCourseMock.mockReset();
});

describe("resolveTemplateEditorCourse", () => {
  it("reuses an existing valid companion course", async () => {
    mockChain.maybeSingle.mockResolvedValueOnce({
      data: { id: "course-1", user_id: "user-1", is_template: true },
      error: null,
    });

    const result = await resolveTemplateEditorCourse(
      { id: "template-1", course_id: "course-1", title: "Template" },
      "user-1",
    );

    expect(result).toEqual({ success: true, courseId: "course-1", repaired: false, copied: false });
    expect(mockChain.insert).not.toHaveBeenCalled();
  });

  it("repairs a stale companion course link before opening the editor", async () => {
    mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockChain.single
      .mockResolvedValueOnce({
        data: { id: "course-2", user_id: "user-1", is_template: true },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "template-1", course_id: "course-2" },
        error: null,
      });

    const result = await resolveTemplateEditorCourse(
      {
        id: "template-1",
        user_id: "user-1",
        course_id: "missing-course",
        title: "Recovered Template",
        description: "Recovered description",
      },
      "user-1",
    );

    expect(result).toEqual({ success: true, courseId: "course-2", repaired: true, copied: false });
    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(fromMock).toHaveBeenCalledWith("templates");
    expect(mockChain.insert).toHaveBeenNthCalledWith(1, {
      user_id: "user-1",
      title: "Recovered Template",
      description: "Recovered description",
      is_template: true,
    });
    expect(createModuleMock).toHaveBeenCalledWith(
      "course-2",
      "Module 1",
      0,
      "[]",
    );
    expect(mockChain.update).toHaveBeenCalledWith({ course_id: "course-2" });
  });

  it("creates an editable copy when opening a built-in template", async () => {
    mockChain.single
      .mockResolvedValueOnce({
        data: {
          id: "template-copy-1",
          title: "Product Onboarding Sprint",
          description: "Built-in starter",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "course-4", user_id: "user-1", is_template: true },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "template-copy-1", course_id: "course-4" },
        error: null,
      });

    const result = await resolveTemplateEditorCourse(
      {
        id: "builtin-course-template-product-onboarding-sprint",
        is_builtin: true,
        title: "Product Onboarding Sprint",
        description: "Built-in starter",
        category: "onboarding",
        content: "[]",
        images: [],
        tags: ["onboarding"],
        modules: [
          {
            key: "welcome",
            title: "Welcome",
            blocks: [{ id: "b1", type: "paragraph", content: "Hello" }],
          },
        ],
      },
      "user-1",
    );

    expect(result).toEqual({ success: true, courseId: "course-4", repaired: false, copied: true });
    expect(mockChain.insert).toHaveBeenNthCalledWith(1, {
      title: "Product Onboarding Sprint",
      description: "Built-in starter",
      category: "onboarding",
      content: "[]",
      thumbnail: undefined,
      images: [],
      tags: ["onboarding"],
      user_id: "user-1",
    });
    expect(mockChain.insert).toHaveBeenNthCalledWith(2, {
      user_id: "user-1",
      title: "Product Onboarding Sprint",
      description: "Built-in starter",
      is_template: true,
    });
    expect(createModuleMock).toHaveBeenCalledWith(
      "course-4",
      "Welcome",
      0,
      expect.any(String),
    );
    const builtInBlocks = JSON.parse(createModuleMock.mock.calls[0][3]);
    expect(builtInBlocks).toHaveLength(1);
    expect(builtInBlocks[0]).toEqual(
      expect.objectContaining({ type: "paragraph", content: "Hello" }),
    );
  });
});

describe("getTemplatePermissions", () => {
  it("allows full editing for a template row owned by the current user", async () => {
    const result = await getTemplatePermissions(
      { id: "template-1", title: "Template", user_id: "user-1", course_id: null },
      "user-1",
    );

    expect(result).toEqual({
      canManageTemplate: true,
      canEditLayout: true,
      editCreatesCopy: false,
    });
  });

  it("allows built-in templates to open as editable copies for signed-in users", async () => {
    const result = await getTemplatePermissions(
      { id: "builtin-1", title: "Built-in", is_builtin: true },
      "user-1",
    );

    expect(result).toEqual({
      canManageTemplate: false,
      canEditLayout: true,
      editCreatesCopy: true,
    });
  });

  it("allows layout editing when the user owns the linked template course even if the template row owner is missing", async () => {
    mockChain.maybeSingle.mockResolvedValueOnce({
      data: { id: "course-1", user_id: "user-1", is_template: true },
      error: null,
    });

    const result = await getTemplatePermissions(
      { id: "template-1", title: "Template", user_id: null, course_id: "course-1" },
      "user-1",
    );

    expect(result).toEqual({
      canManageTemplate: false,
      canEditLayout: true,
      editCreatesCopy: false,
    });
  });

  it("allows forking a public template when there is no accessible editor course", async () => {
    mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await getTemplatePermissions(
      { id: "template-2", title: "Shared Template", user_id: "other-user", course_id: "missing-course" },
      "user-1",
    );

    expect(result).toEqual({
      canManageTemplate: false,
      canEditLayout: true,
      editCreatesCopy: true,
    });
  });
});

describe("updateTemplate", () => {
  it("keeps metadata updates working when the linked template course is stale", async () => {
    mockChain.single
      .mockResolvedValueOnce({
        data: {
          id: "template-1",
          title: "Updated Template",
          description: "Updated description",
          user_id: "user-1",
          course_id: "missing-course",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "course-3", user_id: "user-1", is_template: true },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "template-1", course_id: "course-3" },
        error: null,
      });
    mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await updateTemplate("template-1", {
      title: "Updated Template",
      description: "Updated description",
    });

    expect(result.success).toBe(true);
    expect(updateCourseMock).not.toHaveBeenCalled();
    expect(mockChain.update).toHaveBeenNthCalledWith(1, {
      title: "Updated Template",
      description: "Updated description",
    });
    expect(mockChain.update).toHaveBeenNthCalledWith(2, { course_id: "course-3" });
  });
});