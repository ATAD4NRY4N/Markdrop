import { createContext, useCallback, useContext, useState } from "react";
import {
  createCourse,
  createModule,
  deleteCourse,
  deleteModule,
  getCourseById,
  getCourseModules,
  reorderModules,
  updateCourse,
  updateModule,
} from "@/lib/storage";

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  // Sections: [{id, title, moduleIds: []}]
  const [sections, setSections] = useState([]);

  // Load a course and its modules by ID
  const loadCourse = useCallback(async (courseId) => {
    const [loadedCourse, loadedModules] = await Promise.all([
      getCourseById(courseId),
      getCourseModules(courseId),
    ]);
    setCourse(loadedCourse);
    setModules(loadedModules);
    // Load sections from course metadata
    try {
      const parsedSections = JSON.parse(loadedCourse.sections_json || "[]");
      setSections(Array.isArray(parsedSections) ? parsedSections : []);
    } catch {
      setSections([]);
    }
    if (loadedModules.length > 0) {
      setActiveModuleId(loadedModules[0].id);
    }
    return { course: loadedCourse, modules: loadedModules };
  }, []);

  // Initialize a brand-new course for a user
  const initNewCourse = useCallback(async (userId, title = "Untitled Course") => {
    setIsSaving(true);
    try {
      const newCourse = await createCourse(userId, title);
      const firstModule = await createModule(newCourse.id, "Module 1", 0, "[]");
      setCourse(newCourse);
      setModules([firstModule]);
      setActiveModuleId(firstModule.id);
      return newCourse;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Save course metadata
  const saveCourse = useCallback(
    async (updates) => {
      if (!course?.id) return;
      setIsSaving(true);
      try {
        const updated = await updateCourse(course.id, updates);
        setCourse(updated);
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [course]
  );

  // Save the blocks of the currently active module
  const saveActiveModuleBlocks = useCallback(
    async (blocks) => {
      if (!activeModuleId) return;
      setIsSaving(true);
      try {
        const blocksJson = JSON.stringify(blocks);
        const updated = await updateModule(activeModuleId, { blocks_json: blocksJson });
        setModules((prev) => prev.map((m) => (m.id === activeModuleId ? updated : m)));
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [activeModuleId]
  );

  // Add a new module to the end
  const addModule = useCallback(
    async (title = `Module ${modules.length + 1}`) => {
      if (!course?.id) return;
      const newModule = await createModule(course.id, title, modules.length, "[]");
      setModules((prev) => [...prev, newModule]);
      setActiveModuleId(newModule.id);
      return newModule;
    },
    [course, modules.length]
  );

  // Rename a module
  const renameModule = useCallback(async (moduleId, title) => {
    const updated = await updateModule(moduleId, { title });
    setModules((prev) => prev.map((m) => (m.id === moduleId ? updated : m)));
  }, []);

  // Delete a module
  const removeModule = useCallback(
    async (moduleId) => {
      await deleteModule(moduleId);
      const remaining = modules.filter((m) => m.id !== moduleId);
      setModules(remaining);
      if (activeModuleId === moduleId) {
        setActiveModuleId(remaining[0]?.id ?? null);
      }
    },
    [modules, activeModuleId]
  );

  // Reorder modules after drag-and-drop
  const reorderModuleList = useCallback(async (newModules) => {
    setModules(newModules);
    await reorderModules(newModules.map((m) => m.id));
  }, []);

  // Get the blocks for the active module (parsed JSON)
  const getActiveModuleBlocks = useCallback(() => {
    const mod = modules.find((m) => m.id === activeModuleId);
    if (!mod) return [];
    try {
      return JSON.parse(mod.blocks_json || "[]");
    } catch {
      return [];
    }
  }, [modules, activeModuleId]);

  // Update blocks locally (without persisting) — for live editing
  const setActiveModuleBlocksLocal = useCallback(
    (blocks) => {
      if (!activeModuleId) return;
      const blocksJson = JSON.stringify(blocks);
      setModules((prev) =>
        prev.map((m) => (m.id === activeModuleId ? { ...m, blocks_json: blocksJson } : m))
      );
    },
    [activeModuleId]
  );

  const destroyCourse = useCallback(async () => {
    if (!course?.id) return;
    await deleteCourse(course.id);
    setCourse(null);
    setModules([]);
    setActiveModuleId(null);
    setSections([]);
  }, [course]);

  // Section management helpers — sections are persisted in courses.sections_json
  const persistSections = useCallback(
    async (newSections) => {
      setSections(newSections);
      if (course?.id) {
        try {
          await updateCourse(course.id, { sections_json: JSON.stringify(newSections) });
        } catch {
          // Non-critical — persist best-effort
        }
      }
    },
    [course]
  );

  const addSection = useCallback(
    async (title = "New Section") => {
      const newSection = { id: `sec-${Date.now()}`, title, moduleIds: [] };
      await persistSections([...sections, newSection]);
      return newSection;
    },
    [sections, persistSections]
  );

  const renameSection = useCallback(
    async (sectionId, title) => {
      await persistSections(sections.map((s) => (s.id === sectionId ? { ...s, title } : s)));
    },
    [sections, persistSections]
  );

  const removeSection = useCallback(
    async (sectionId) => {
      await persistSections(sections.filter((s) => s.id !== sectionId));
    },
    [sections, persistSections]
  );

  const assignModuleToSection = useCallback(
    async (moduleId, sectionId) => {
      // Remove from all sections first
      const cleaned = sections.map((s) => ({
        ...s,
        moduleIds: s.moduleIds.filter((id) => id !== moduleId),
      }));
      if (sectionId === null) {
        // Unassign — module is now "unsectioned"
        await persistSections(cleaned);
      } else {
        await persistSections(
          cleaned.map((s) =>
            s.id === sectionId ? { ...s, moduleIds: [...s.moduleIds, moduleId] } : s
          )
        );
      }
    },
    [sections, persistSections]
  );

  return (
    <CourseContext.Provider
      value={{
        course,
        setCourse,
        modules,
        setModules,
        activeModuleId,
        setActiveModuleId,
        isSaving,
        loadCourse,
        initNewCourse,
        saveCourse,
        saveActiveModuleBlocks,
        addModule,
        renameModule,
        removeModule,
        reorderModuleList,
        getActiveModuleBlocks,
        setActiveModuleBlocksLocal,
        destroyCourse,
        // Sections
        sections,
        addSection,
        renameSection,
        removeSection,
        assignModuleToSection,
        persistSections,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used within a CourseProvider");
  return ctx;
}
