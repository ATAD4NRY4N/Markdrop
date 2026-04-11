import { useTheme } from "@/components/ThemeProvider";

// Inline SVG mark — a lightning bolt (forge) in a rounded violet square
const CourseForgeIcon = ({ className }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-9 w-9"}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="8" fill="#7c3aed" />
    {/* Lightning bolt, scaled from 100×100 reference (×0.36) */}
    <path
      d="M20.2 4.3 L12.2 18.7 L17.3 18.7 L10.1 31.7 L24.5 17.3 L19.4 17.3 L25.9 4.3 Z"
      fill="white"
      fillOpacity="0.95"
    />
  </svg>
);

// Full wordmark: icon + "Course" + "Forge"
export const Logo = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="flex items-center gap-2" style={{ userSelect: "none" }}>
      <CourseForgeIcon className="h-8 w-8 shrink-0" />
      <span
        style={{
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          fontSize: "1.125rem",
          lineHeight: 1,
          letterSpacing: "-0.025em",
        }}
      >
        <span style={{ fontWeight: 400, color: isDark ? "#e2e8f0" : "#1e293b" }}>Course</span>
        <span style={{ fontWeight: 700, color: "#7c3aed" }}>Forge</span>
      </span>
    </div>
  );
};

// Icon-only mark (for compact / favicon contexts)
export const Icon = ({ className }) => <CourseForgeIcon className={className} />;
