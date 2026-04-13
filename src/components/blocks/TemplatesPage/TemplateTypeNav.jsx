import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const TEMPLATE_TYPE_LINKS = [
  { label: "Course Templates", href: "/templates/courses" },
  { label: "Block Templates", href: "/templates/blocks" },
];

export default function TemplateTypeNav() {
  const location = useLocation();

  return (
    <>
      <div className="border-r border-b border-[#cecece] dark:border-[#16181d]" />

      <div className="border-b border-[#cecece] dark:border-[#16181d] bg-background">
        <div className="flex items-center gap-2 overflow-x-auto px-6 py-4">
          {TEMPLATE_TYPE_LINKS.map((link) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-md border px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-l border-b border-[#cecece] dark:border-[#16181d]" />
    </>
  );
}