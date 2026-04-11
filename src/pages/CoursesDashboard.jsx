import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Play, FileText, LayoutTemplate, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function CoursesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) {
          // If the table doesn't exist yet, just act like empty
          if (error.message.includes("does not exist") || error.code === "42P01") {
            setCourses([]);
            setError("Database requires migration. Please run 'npx supabase db push'.");
            return;
          }
          throw error;
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

  const handleCreateCourse = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to create a course.");
      return;
    }
    
    // We navigate to /course to create a new one, passing some state or doing creation there, 
    // but typically a blank course is created then redirected to editor.
    try {
      const newCourseData = {
        title: "Untitled Course",
        description: "A new standard course",
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("courses")
        .insert([newCourseData])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Course created!");
      navigate(`/course/${data.id}`);
    } catch (createError) {
      if (createError.message?.includes("does not exist") || createError.code === "42P01") {
         toast.error("Database tables not found. Run migrations first.");
         return;
      }
      toast.error("Failed to create course.");
      console.error(createError);
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses Dashboard</h1>
            <p className="text-neutral-400 mt-2">Manage your e-learning courses and modules.</p>
          </div>
          <Button onClick={handleCreateCourse} className="gap-2">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-neutral-800 border-neutral-700 animate-pulse h-48" />
            ))}
          </div>
        ) : courses.length === 0 && !error ? (
          <div className="text-center py-20 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
            <LayoutTemplate className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="text-neutral-400 mt-1 mb-6">Create your first interactive course to get started.</p>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-neutral-800/80 border-neutral-700 overflow-hidden hover:border-neutral-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="text-neutral-400 mt-1 line-clamp-2">
                        {course.description || "No description provided."}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700 text-neutral-200">
                        <DropdownMenuItem onClick={() => navigate(`/course/${course.id}`)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Course
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
                </CardHeader>
                <CardFooter className="bg-neutral-900/50 pt-4 flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent border-neutral-600 hover:bg-neutral-800" asChild>
                    <Link to={`/course/${course.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Editor
                    </Link>
                  </Button>
                  <Button variant="default" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
