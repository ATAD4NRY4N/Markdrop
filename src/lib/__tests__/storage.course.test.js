/**
 * storage.course.test.js
 *
 * Unit tests for the Course and Course Module CRUD functions in storage.js.
 * The Supabase client is fully mocked so no real network calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock the supabase module before importing storage functions ───────────────
// Each builder method returns `this` so calls can be chained, then we
// override the terminal `.single()` / `.order()` to return the resolved value.

function makeChainMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return chain;
}

const mockChain = makeChainMock();
const fromMock = vi.fn(() => mockChain);

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

// Import after mocking
const {
  createCourse,
  getUserCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createModule,
  getCourseModules,
  updateModule,
  deleteModule,
  reorderModules,
} = await import("@/lib/storage");

// ── Helpers ───────────────────────────────────────────────────────────────────

const fakeCourse = {
  id: "course-1",
  user_id: "user-1",
  title: "My Course",
  description: "desc",
  scorm_version: "1.2",
  pass_threshold: 80,
  max_attempts: 0,
};

const fakeModule = {
  id: "mod-1",
  course_id: "course-1",
  title: "Module 1",
  order: 0,
  blocks_json: "[]",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Reset chain mocks to fresh defaults
  mockChain.single.mockResolvedValue({ data: null, error: null });
  mockChain.order.mockResolvedValue({ data: [], error: null });
});

// ── createCourse ──────────────────────────────────────────────────────────────

describe("createCourse", () => {
  it("calls supabase.from('courses').insert(...).select().single()", async () => {
    mockChain.single.mockResolvedValueOnce({ data: fakeCourse, error: null });
    const result = await createCourse("user-1", "My Course", "desc", "1.2", 80, 0);

    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(mockChain.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      title: "My Course",
      description: "desc",
      scorm_version: "1.2",
      pass_threshold: 80,
      max_attempts: 0,
    });
    expect(result).toEqual(fakeCourse);
  });

  it("throws on Supabase error", async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });
    await expect(createCourse("u", "T")).rejects.toEqual({ message: "DB error" });
  });

  it("uses defaults for optional parameters", async () => {
    mockChain.single.mockResolvedValueOnce({ data: fakeCourse, error: null });
    await createCourse("user-1", "My Course");
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "",
        scorm_version: "1.2",
        pass_threshold: 80,
        max_attempts: 0,
      })
    );
  });
});

// ── getUserCourses ────────────────────────────────────────────────────────────

describe("getUserCourses", () => {
  it("queries courses table filtered by user_id and ordered by updated_at desc", async () => {
    mockChain.order.mockResolvedValueOnce({ data: [fakeCourse], error: null });
    const result = await getUserCourses("user-1");

    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(mockChain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(mockChain.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(result).toEqual([fakeCourse]);
  });

  it("throws on Supabase error", async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });
    await expect(getUserCourses("u")).rejects.toEqual({ message: "Not found" });
  });
});

// ── getCourseById ─────────────────────────────────────────────────────────────

describe("getCourseById", () => {
  it("queries courses table by id and calls .single()", async () => {
    mockChain.single.mockResolvedValueOnce({ data: fakeCourse, error: null });
    const result = await getCourseById("course-1");

    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(mockChain.eq).toHaveBeenCalledWith("id", "course-1");
    expect(result).toEqual(fakeCourse);
  });

  it("throws when course not found", async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    await expect(getCourseById("no-such-id")).rejects.toEqual({ code: "PGRST116" });
  });
});

// ── updateCourse ──────────────────────────────────────────────────────────────

describe("updateCourse", () => {
  it("calls update on courses table with correct id and updates", async () => {
    const updated = { ...fakeCourse, title: "New Title" };
    mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

    const result = await updateCourse("course-1", { title: "New Title" });

    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(mockChain.update).toHaveBeenCalledWith({ title: "New Title" });
    expect(mockChain.eq).toHaveBeenCalledWith("id", "course-1");
    expect(result).toEqual(updated);
  });

  it("throws on Supabase error", async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { message: "Update failed" } });
    await expect(updateCourse("course-1", {})).rejects.toEqual({ message: "Update failed" });
  });
});

// ── deleteCourse ──────────────────────────────────────────────────────────────

describe("deleteCourse", () => {
  it("calls delete on courses table filtered by id", async () => {
    // delete().eq() resolves with no data (just an error field)
    mockChain.eq.mockResolvedValueOnce({ error: null });
    await deleteCourse("course-1");

    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(mockChain.delete).toHaveBeenCalled();
    expect(mockChain.eq).toHaveBeenCalledWith("id", "course-1");
  });

  it("throws on Supabase error", async () => {
    mockChain.eq.mockResolvedValueOnce({ error: { message: "Delete failed" } });
    await expect(deleteCourse("course-1")).rejects.toEqual({ message: "Delete failed" });
  });
});

// ── createModule ──────────────────────────────────────────────────────────────

describe("createModule", () => {
  it("inserts into course_modules with correct fields", async () => {
    mockChain.single.mockResolvedValueOnce({ data: fakeModule, error: null });
    const result = await createModule("course-1", "Module 1", 0, "[]");

    expect(fromMock).toHaveBeenCalledWith("course_modules");
    expect(mockChain.insert).toHaveBeenCalledWith({
      course_id: "course-1",
      title: "Module 1",
      order: 0,
      blocks_json: "[]",
    });
    expect(result).toEqual(fakeModule);
  });

  it("uses defaults for optional parameters", async () => {
    mockChain.single.mockResolvedValueOnce({ data: fakeModule, error: null });
    await createModule("course-1", "Mod");
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ order: 0, blocks_json: "[]" })
    );
  });

  it("throws on Supabase error", async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { message: "Insert failed" } });
    await expect(createModule("c", "T")).rejects.toEqual({ message: "Insert failed" });
  });
});

// ── getCourseModules ──────────────────────────────────────────────────────────

describe("getCourseModules", () => {
  it("queries course_modules by course_id ordered by order asc", async () => {
    mockChain.order.mockResolvedValueOnce({ data: [fakeModule], error: null });
    const result = await getCourseModules("course-1");

    expect(fromMock).toHaveBeenCalledWith("course_modules");
    expect(mockChain.eq).toHaveBeenCalledWith("course_id", "course-1");
    expect(mockChain.order).toHaveBeenCalledWith("order", { ascending: true });
    expect(result).toEqual([fakeModule]);
  });

  it("throws on error", async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: { message: "err" } });
    await expect(getCourseModules("c")).rejects.toEqual({ message: "err" });
  });
});

// ── updateModule ──────────────────────────────────────────────────────────────

describe("updateModule", () => {
  it("updates the module and returns the updated row", async () => {
    const updated = { ...fakeModule, title: "Updated Module" };
    mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

    const result = await updateModule("mod-1", { title: "Updated Module" });

    expect(fromMock).toHaveBeenCalledWith("course_modules");
    expect(mockChain.update).toHaveBeenCalledWith({ title: "Updated Module" });
    expect(mockChain.eq).toHaveBeenCalledWith("id", "mod-1");
    expect(result.title).toBe("Updated Module");
  });

  it("throws on error", async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { message: "err" } });
    await expect(updateModule("m", {})).rejects.toEqual({ message: "err" });
  });
});

// ── deleteModule ──────────────────────────────────────────────────────────────

describe("deleteModule", () => {
  it("calls delete on course_modules filtered by id", async () => {
    mockChain.eq.mockResolvedValueOnce({ error: null });
    await deleteModule("mod-1");

    expect(fromMock).toHaveBeenCalledWith("course_modules");
    expect(mockChain.delete).toHaveBeenCalled();
    expect(mockChain.eq).toHaveBeenCalledWith("id", "mod-1");
  });

  it("throws on error", async () => {
    mockChain.eq.mockResolvedValueOnce({ error: { message: "Delete failed" } });
    await expect(deleteModule("m")).rejects.toEqual({ message: "Delete failed" });
  });
});

// ── reorderModules ────────────────────────────────────────────────────────────

describe("reorderModules", () => {
  it("calls update for each module id with the correct order index", async () => {
    // reorderModules fires N independent update calls; each resolves with the chain
    // Reset so each eq() call resolves successfully
    mockChain.eq.mockResolvedValue({ error: null });

    await reorderModules(["mod-1", "mod-2", "mod-3"]);

    // update should have been called once per module id
    expect(mockChain.update).toHaveBeenCalledTimes(3);
    expect(mockChain.update).toHaveBeenNthCalledWith(1, { order: 0 });
    expect(mockChain.update).toHaveBeenNthCalledWith(2, { order: 1 });
    expect(mockChain.update).toHaveBeenNthCalledWith(3, { order: 2 });
  });

  it("handles empty array without error", async () => {
    await expect(reorderModules([])).resolves.not.toThrow();
  });
});
