/**
 * Builder.jsx — redirects to the unified CourseBuilder at /course.
 *
 * The standalone markdown builder has been merged into the Course Builder
 * so that all lesson authoring happens within a course context.
 */
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Builder() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Redirect legacy /builder and /builder/:id to /course
    navigate("/course", { replace: true });
  }, [id, navigate]);

  return null;
}
