import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, Copy, Edit2, FileText, GraduationCap,
  LayoutTemplate, MoreVertical, Play, Plus, Search, Trash2,
  Globe, Lock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { duplicateCourse } from "@/lib/storage";

// ─── helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const moduleCount = (course) => course.course_modules?.[0]?.count ?? 0;

// ─── component ───────────────────────────────────────────────────────────────
export default function CoursesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState("all");   // "all" | "draft" | "published"
  const [search, setSearch]           = useState("");
  const [duplicating, setDuplicating] = useState(new Set());

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    async function fetchCourses() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("courses")
          .select("*, course_modules(count)")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (fetchError) {
          if (fetchError.message.includes("does not exist") || fetchError.code === "42P01") {
            setCourses([]);
            setError("Database requires migration. Run 'npx supabase db push'.");
            return;
          }
          throw fetchError;
        }
        setCourses(data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Database tables may not exist.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [user]);

  // ── derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     courses.length,
    draft:     courses.filter((c) => (c.status ?? "draft") === "draft").length,
    published: courses.filter((c) => c.status === "published").length,
  }), [courses]);

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (filter !== "all") {
      list = list.filter((c) => (c.status ?? "draft") === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) ||
               (c.description || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [courses, filter, search]);

  // ── actions ────────────────────────────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!user?.id) { toast.error("You must be logged in to create a course."); return; }
    try {
      const { data, error: insertError } = await supabase
        .from("courses")
        .insert([{ title: "Untitled Course", description: "", user_id: user.id }])
        .select()
        .single();
      if (insertError) throw insertError;
      toast.success("Course created!");
      navigate(`/course/${data.id}`);
    } catch (err) {
      if (err.message?.includes("does not exist") || err.code === "42P01") {
        toast.error("Database tables not found. Run migrations first."); return;
      }
      toast.error("Failed to create course.");
      console.error(err);
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    try {
      const { error: delError } = await supabase.from("courses").delete().eq("id", courseId);
      if (delError) throw delError;
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course.");
    }
  };

  const handleDuplicate = async (course) => {
    if (!user?.id) return;
    setDuplicating((prev) => new Set(prev).add(course.id));
    try {
      const copy = await duplicateCourse(course.id, user.id);
      const { data } = await supabase
        .from("courses")
        .select("*, course_modules(count)")
        .eq("id", copy.id)
        .single();
      if (data) setCourses((prev) => [data, ...prev]);
      toast.success(`"${course.title}" duplicated.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate course.");
    } finally {
      setDuplicating((prev) => { const next = new Set(prev); next.delete(course.id); return next; });
    }
  };

  const handleToggleStatus = async (course) => {
    const next = (course.status ?? "draft") === "draft" ? "published" : "draft";
    try {
      const { data, error: upErr } = await supabase
        .from("courses")
        .update({ status: next })
        .eq("id", course.id)
        .select("*, course_modules(count)")
        .single();
      if (upErr) throw upErr;
      setCourses((prev) => prev.map((c) => (c.id === course.id ? data : c)));
      toast.success(`Course marked as ${next}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update course status.");
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-neutral-400 mt-1">Manage your e-learning courses and modules.</p>
          </div>
          <Button onClick={handleCreateCourse} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* ── Stats row ── */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total",     value: stats.total,     icon: GraduationCap, color: "text-neutral-300" },
              { label: "Drafts",    value: stats.draft,     icon: Lock,          color: "text-amber-400" },
              { label: "Published", value: stats.published, icon: Globe,         color: "text-emerald-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-neutral-800/60 border border-neutral-700/60 rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                <div>
                  <p className="text-xl font-bold leading-none">{value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters + Search ── */}
        {!loading && courses.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Tabs value={filter} onValueChange={setFilter} className="shrink-0">
              <TabsList className="bg-neutral-800 border border-neutral-700">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
                <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
              <Input
                placeholder="Search courses…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-neutral-800 border-neutral-700 placeholder:text-neutral-500 focus-visible:ring-neutral-600"
              />
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-neutral-800/40 rounded-xl border border-neutral-700/50">
            <LayoutTemplate className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            {courses.length === 0 ? (
              <>
                <h3 className="text-lg font-medium">No courses yet</h3>
                <p className="text-neutral-400 mt-1 mb-6">Create your first interactive course to get started.</p>
                <Button onClick={handleCreateCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">No matches</h3>
                <p className="text-neutral-400 mt-1">
                  {search ? `No courses match "${search}"` : `No ${filter} courses.`}
                </p>
              </>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => {
                const status    = course.status ?? "draft";
                const isDraft   = status === "draft";
                const count     = moduleCount(course);
                const isCopying = duplicating.has(course.id);

                return (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-neutral-800/80 border-neutral-700 overflow-hidden h-full flex flex-col hover:border-neutral-500 transition-colors">
                      <CardHeader className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            {/* Status badge */}
                            <Badge
                              variant="outline"
                              className={
                                isDraft
                                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] mb-2"
                                  : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] mb-2"
                              }
                            >
                              {isDraft ? <Lock className="h-2.5 w-2.5 mr-1" /> : <Globe className="h-2.5 w-2.5 mr-1" />}
                              {isDraft ? "Draft" : "Published"}
                            </Badge>

                            <CardTitle className="text-base leading-snug line-clamp-2 mb-1">
                              {course.title}
                            </CardTitle>
                            <CardDescription className="text-neutral-400 line-clamp-2 text-sm">
                              {course.description || "No description provided."}
                            </CardDescription>
                          </div>

                          {/* Actions dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-neutral-400 hover:text-white"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700 text-neutral-200 w-48">
                              <DropdownMenuItem onClick={() => navigate(`/course/${course.id}`)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(course)}
                                disabled={isCopying}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {isCopying ? "Duplicating…" : "Duplicate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(course)}>
                                {isDraft
                                  ? <><Globe  className="h-4 w-4 mr-2" />Publish</>
                                  : <><Lock   className="h-4 w-4 mr-2" />Unpublish</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-neutral-700" />
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-300 focus:bg-red-400/10"
                                onClick={() => handleDelete(course.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {count} {count === 1 ? "module" : "modules"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(course.updated_at)}
                          </span>
                        </div>
                      </CardHeader>

                      <CardFooter className="bg-neutral-900/50 pt-3 pb-3 px-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent border-neutral-600 hover:bg-neutral-800 text-sm h-8"
                          asChild
                        >
                          <Link to={`/course/${course.id}`}>
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            Editor
                          </Link>
                        </Button>
                        <Button variant="default" className="flex-1 text-sm h-8">
                          <Play className="h-3.5 w-3.5 mr-1.5" />
                          Preview
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
