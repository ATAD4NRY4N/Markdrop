import { createContext, useCallback, useContext, useState } from "react";

const getSupabase = async () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const { supabase } = await import("@/lib/supabase");
    return supabase;
  } catch {
    return null;
  }
};

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    const supabase = await getSupabase();
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error("fetchCourses error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourse = useCallback(async (id) => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setCurrentCourse(data);
      return data;
    } catch (err) {
      console.error("fetchCourse error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (title, description = "") => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("courses")
        .insert({ title, description })
        .select()
        .single();
      if (error) throw error;
      setCourses((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("createCourse error:", err);
      return null;
    }
  }, []);

  const updateCourse = useCallback(async (id, updates) => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setCourses((prev) => prev.map((c) => (c.id === id ? data : c)));
      if (currentCourse?.id === id) setCurrentCourse(data);
      return data;
    } catch (err) {
      console.error("updateCourse error:", err);
      return null;
    }
  }, [currentCourse]);

  const deleteCourse = useCallback(async (id) => {
    const supabase = await getSupabase();
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (currentCourse?.id === id) setCurrentCourse(null);
      return true;
    } catch (err) {
      console.error("deleteCourse error:", err);
      return false;
    }
  }, [currentCourse]);

  const fetchModules = useCallback(async (courseId) => {
    const supabase = await getSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      console.error("fetchModules error:", err);
    }
  }, []);

  const createModule = useCallback(async (courseId, title) => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    try {
      const { data: existing } = await supabase
        .from("course_modules")
        .select("order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: false })
        .limit(1);
      const nextOrder = existing?.length ? (existing[0].order_index ?? -1) + 1 : 0;
      const { data, error } = await supabase
        .from("course_modules")
        .insert({ course_id: courseId, title, content: [], order_index: nextOrder })
        .select()
        .single();
      if (error) throw error;
      setModules((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("createModule error:", err);
      return null;
    }
  }, []);

  const updateModule = useCallback(async (id, updates) => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setModules((prev) => prev.map((m) => (m.id === id ? data : m)));
      return data;
    } catch (err) {
      console.error("updateModule error:", err);
      return null;
    }
  }, []);

  const deleteModule = useCallback(async (id) => {
    const supabase = await getSupabase();
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("course_modules").delete().eq("id", id);
      if (error) throw error;
      setModules((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (err) {
      console.error("deleteModule error:", err);
      return false;
    }
  }, []);

  const reorderModules = useCallback(async (reordered) => {
    setModules(reordered);
    const supabase = await getSupabase();
    if (!supabase) return;
    try {
      await Promise.all(
        reordered.map((m, i) =>
          supabase
            .from("course_modules")
            .update({ order_index: i })
            .eq("id", m.id)
        )
      );
    } catch (err) {
      console.error("reorderModules error:", err);
    }
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        currentCourse,
        modules,
        loading,
        fetchCourses,
        fetchCourse,
        createCourse,
        updateCourse,
        deleteCourse,
        fetchModules,
        createModule,
        updateModule,
        deleteModule,
        reorderModules,
        setCurrentCourse,
        setModules,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourse must be used within CourseProvider");
  return context;
};
