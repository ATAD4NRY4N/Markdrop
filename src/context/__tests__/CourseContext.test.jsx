/**
 * CourseContext.test.jsx
 *
 * Tests for the CourseContext / CourseProvider hook that manages course state.
 * All Supabase-backed storage functions are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act, renderHook } from "@testing-library/react";

// ── Mock storage functions ────────────────────────────────────────────────────

const mockCreateCourse = vi.fn();
const mockCreateModule = vi.fn();
const mockGetCourseById = vi.fn();
const mockGetCourseModules = vi.fn();
const mockUpdateCourse = vi.fn();
const mockUpdateModule = vi.fn();
const mockDeleteCourse = vi.fn();
const mockDeleteModule = vi.fn();
const mockReorderModules = vi.fn();

vi.mock("@/lib/storage", () => ({
  createCourse: (...a) => mockCreateCourse(...a),
  createModule: (...a) => mockCreateModule(...a),
  getCourseById: (...a) => mockGetCourseById(...a),
  getCourseModules: (...a) => mockGetCourseModules(...a),
  updateCourse: (...a) => mockUpdateCourse(...a),
  updateModule: (...a) => mockUpdateModule(...a),
  deleteCourse: (...a) => mockDeleteCourse(...a),
  deleteModule: (...a) => mockDeleteModule(...a),
  reorderModules: (...a) => mockReorderModules(...a),
}));

// Import after mocking
const { CourseProvider, useCourse } = await import("@/context/CourseContext");

// ── Helper ────────────────────────────────────────────────────────────────────

function renderCourse() {
  return renderHook(() => useCourse(), {
    wrapper: ({ children }) => <CourseProvider>{children}</CourseProvider>,
  });
}

const COURSE = {
  id: "course-001",
  user_id: "user-001",
  title: "Test Course",
  description: "",
  scorm_version: "1.2",
  pass_threshold: 80,
  max_attempts: 0,
};

const MODULE_A = { id: "mod-001", course_id: "course-001", title: "Module 1", order: 0, blocks_json: "[]" };
const MODULE_B = { id: "mod-002", course_id: "course-001", title: "Module 2", order: 1, blocks_json: "[]" };

beforeEach(() => {
  vi.clearAllMocks();
});

// ── useCourse must be within provider ─────────────────────────────────────────

describe("useCourse", () => {
  it("throws when used outside CourseProvider", () => {
    // Suppress React's error boundary noise
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCourse())).toThrow(
      "useCourse must be used within a CourseProvider"
    );
    errorSpy.mockRestore();
  });
});

// ── initNewCourse ─────────────────────────────────────────────────────────────

describe("initNewCourse", () => {
  it("creates a course + first module and sets state", async () => {
    mockCreateCourse.mockResolvedValueOnce(COURSE);
    mockCreateModule.mockResolvedValueOnce(MODULE_A);

    const { result } = renderCourse();

    await act(async () => {
      await result.current.initNewCourse("user-001", "Test Course");
    });

    expect(mockCreateCourse).toHaveBeenCalledWith("user-001", "Test Course");
    expect(mockCreateModule).toHaveBeenCalledWith(COURSE.id, "Module 1", 0, "[]");
    expect(result.current.course).toEqual(COURSE);
    expect(result.current.modules).toEqual([MODULE_A]);
    expect(result.current.activeModuleId).toBe(MODULE_A.id);
  });

  it("clears isSaving after completion", async () => {
    mockCreateCourse.mockResolvedValueOnce(COURSE);
    mockCreateModule.mockResolvedValueOnce(MODULE_A);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.initNewCourse("user-001", "Test Course");
    });

    expect(result.current.isSaving).toBe(false);
  });
});

// ── loadCourse ────────────────────────────────────────────────────────────────

describe("loadCourse", () => {
  it("loads course and modules from Supabase and sets active to first module", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A, MODULE_B]);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });

    expect(result.current.course).toEqual(COURSE);
    expect(result.current.modules).toEqual([MODULE_A, MODULE_B]);
    expect(result.current.activeModuleId).toBe(MODULE_A.id);
  });

  it("returns the loaded data", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A]);

    const { result } = renderCourse();
    let returnValue;
    await act(async () => {
      returnValue = await result.current.loadCourse("course-001");
    });

    expect(returnValue).toEqual({ course: COURSE, modules: [MODULE_A] });
  });

  it("does not set activeModuleId if no modules exist", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([]);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });

    expect(result.current.activeModuleId).toBeNull();
  });
});

// ── saveCourse ────────────────────────────────────────────────────────────────

describe("saveCourse", () => {
  it("calls updateCourse and updates the course state", async () => {
    mockCreateCourse.mockResolvedValueOnce(COURSE);
    mockCreateModule.mockResolvedValueOnce(MODULE_A);
    const updated = { ...COURSE, title: "New Title" };
    mockUpdateCourse.mockResolvedValueOnce(updated);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.initNewCourse("user-001", "Test Course");
    });
    await act(async () => {
      await result.current.saveCourse({ title: "New Title" });
    });

    expect(mockUpdateCourse).toHaveBeenCalledWith(COURSE.id, { title: "New Title" });
    expect(result.current.course.title).toBe("New Title");
  });

  it("does nothing if no course is loaded", async () => {
    const { result } = renderCourse();
    await act(async () => {
      await result.current.saveCourse({ title: "X" });
    });
    expect(mockUpdateCourse).not.toHaveBeenCalled();
  });
});

// ── saveActiveModuleBlocks ────────────────────────────────────────────────────

describe("saveActiveModuleBlocks", () => {
  it("serializes blocks and calls updateModule", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A]);
    const updatedMod = { ...MODULE_A, blocks_json: '[{"type":"h1","content":"Hi"}]' };
    mockUpdateModule.mockResolvedValueOnce(updatedMod);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });
    await act(async () => {
      await result.current.saveActiveModuleBlocks([{ type: "h1", content: "Hi" }]);
    });

    expect(mockUpdateModule).toHaveBeenCalledWith(MODULE_A.id, {
      blocks_json: '[{"type":"h1","content":"Hi"}]',
    });
    expect(result.current.modules[0].blocks_json).toBe(updatedMod.blocks_json);
  });

  it("does nothing if no active module", async () => {
    const { result } = renderCourse();
    await act(async () => {
      await result.current.saveActiveModuleBlocks([]);
    });
    expect(mockUpdateModule).not.toHaveBeenCalled();
  });
});

// ── addModule ─────────────────────────────────────────────────────────────────

describe("addModule", () => {
  it("creates a new module and appends it, making it active", async () => {
    mockCreateCourse.mockResolvedValueOnce(COURSE);
    mockCreateModule
      .mockResolvedValueOnce(MODULE_A) // first module from initNewCourse
      .mockResolvedValueOnce(MODULE_B); // second module from addModule

    const { result } = renderCourse();
    await act(async () => {
      await result.current.initNewCourse("user-001", "Test Course");
    });
    await act(async () => {
      await result.current.addModule("Module 2");
    });

    expect(result.current.modules).toHaveLength(2);
    expect(result.current.modules[1]).toEqual(MODULE_B);
    expect(result.current.activeModuleId).toBe(MODULE_B.id);
  });

  it("does nothing if no course loaded", async () => {
    const { result } = renderCourse();
    await act(async () => {
      await result.current.addModule("New Module");
    });
    expect(mockCreateModule).not.toHaveBeenCalled();
  });
});

// ── renameModule ──────────────────────────────────────────────────────────────

describe("renameModule", () => {
  it("updates the module title in state", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A]);
    const renamed = { ...MODULE_A, title: "Renamed" };
    mockUpdateModule.mockResolvedValueOnce(renamed);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });
    await act(async () => {
      await result.current.renameModule(MODULE_A.id, "Renamed");
    });

    expect(mockUpdateModule).toHaveBeenCalledWith(MODULE_A.id, { title: "Renamed" });
    expect(result.current.modules[0].title).toBe("Renamed");
  });
});

// ── removeModule ──────────────────────────────────────────────────────────────

describe("removeModule", () => {
  it("deletes the module and removes it from state", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A, MODULE_B]);
    mockDeleteModule.mockResolvedValueOnce(undefined);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });
    await act(async () => {
      await result.current.removeModule(MODULE_B.id);
    });

    expect(mockDeleteModule).toHaveBeenCalledWith(MODULE_B.id);
    expect(result.current.modules).toHaveLength(1);
    expect(result.current.modules[0].id).toBe(MODULE_A.id);
  });

  it("switches active module when the active module is deleted", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A, MODULE_B]);
    mockDeleteModule.mockResolvedValueOnce(undefined);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });
    // activeModuleId is MODULE_A after load; delete MODULE_A → should switch to MODULE_B
    await act(async () => {
      await result.current.removeModule(MODULE_A.id);
    });

    expect(result.current.activeModuleId).toBe(MODULE_B.id);
  });

  it("sets activeModuleId to null when last module is deleted", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A]);
    mockDeleteModule.mockResolvedValueOnce(undefined);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });
    await act(async () => {
      await result.current.removeModule(MODULE_A.id);
    });

    expect(result.current.activeModuleId).toBeNull();
    expect(result.current.modules).toHaveLength(0);
  });
});

// ── reorderModuleList ─────────────────────────────────────────────────────────

describe("reorderModuleList", () => {
  it("updates local state and calls reorderModules with new id order", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A, MODULE_B]);
    mockReorderModules.mockResolvedValueOnce(undefined);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });
    await act(async () => {
      await result.current.reorderModuleList([MODULE_B, MODULE_A]);
    });

    expect(result.current.modules[0].id).toBe(MODULE_B.id);
    expect(mockReorderModules).toHaveBeenCalledWith([MODULE_B.id, MODULE_A.id]);
  });
});

// ── getActiveModuleBlocks ─────────────────────────────────────────────────────

describe("getActiveModuleBlocks", () => {
  it("returns parsed JSON blocks for the active module", async () => {
    const blocks = [{ type: "h1", content: "Hello" }];
    const modWithBlocks = { ...MODULE_A, blocks_json: JSON.stringify(blocks) };
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([modWithBlocks]);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });

    expect(result.current.getActiveModuleBlocks()).toEqual(blocks);
  });

  it("returns [] when no active module", async () => {
    const { result } = renderCourse();
    expect(result.current.getActiveModuleBlocks()).toEqual([]);
  });

  it("returns [] on malformed JSON", async () => {
    const badMod = { ...MODULE_A, blocks_json: "{{invalid}}" };
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([badMod]);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });

    expect(result.current.getActiveModuleBlocks()).toEqual([]);
  });
});

// ── setActiveModuleBlocksLocal ────────────────────────────────────────────────

describe("setActiveModuleBlocksLocal", () => {
  it("updates the active module's blocks_json without calling Supabase", async () => {
    mockGetCourseById.mockResolvedValueOnce(COURSE);
    mockGetCourseModules.mockResolvedValueOnce([MODULE_A]);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.loadCourse("course-001");
    });

    const newBlocks = [{ type: "paragraph", content: "Live edit" }];
    act(() => {
      result.current.setActiveModuleBlocksLocal(newBlocks);
    });

    expect(result.current.getActiveModuleBlocks()).toEqual(newBlocks);
    expect(mockUpdateModule).not.toHaveBeenCalled();
  });

  it("does nothing if no active module", () => {
    const { result } = renderCourse();
    act(() => {
      result.current.setActiveModuleBlocksLocal([{ type: "h1" }]);
    });
    expect(result.current.modules).toHaveLength(0);
  });
});

// ── destroyCourse ─────────────────────────────────────────────────────────────

describe("destroyCourse", () => {
  it("deletes the course and clears all state", async () => {
    mockCreateCourse.mockResolvedValueOnce(COURSE);
    mockCreateModule.mockResolvedValueOnce(MODULE_A);
    mockDeleteCourse.mockResolvedValueOnce(undefined);

    const { result } = renderCourse();
    await act(async () => {
      await result.current.initNewCourse("user-001", "Test Course");
    });
    await act(async () => {
      await result.current.destroyCourse();
    });

    expect(mockDeleteCourse).toHaveBeenCalledWith(COURSE.id);
    expect(result.current.course).toBeNull();
    expect(result.current.modules).toHaveLength(0);
    expect(result.current.activeModuleId).toBeNull();
  });

  it("does nothing if no course loaded", async () => {
    const { result } = renderCourse();
    await act(async () => {
      await result.current.destroyCourse();
    });
    expect(mockDeleteCourse).not.toHaveBeenCalled();
  });
});
