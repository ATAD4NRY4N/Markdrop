import {
  Accessibility,
  ArrowLeftRight,
  ArrowRight,
  Brain,
  Brush,
  CheckCircle2,
  CreditCard,
  GitBranch,
  Globe,
  HelpCircle,
  Image,
  Kanban,
  Keyboard,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  Layers,
  MessageSquare,
  Network,
  Package,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  Target,
  Type,
  Users,
  Users2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { FEATURES_BY_GROUP } from "@/config/featuresData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

// ── Icon resolver ─────────────────────────────────────────────────────────────

const ICONS = {
  Accessibility, Brush, Brain, Rocket, Users2, Network, Zap,
  Layers, LayoutTemplate, LayoutGrid, Palette,
  HelpCircle, Type, ArrowLeftRight, Target, Kanban, CreditCard,
  Package, Globe,
  Users, MessageSquare,
  GitBranch, CheckCircle2,
  LayoutDashboard, Search,
  ShieldCheck, ImageWithText: Image, Keyboard, Languages,
};

function Icon({ name, className }) {
  const Comp = ICONS[name];
  return Comp ? <Comp className={className} /> : null;
}

// ── Group accent colors ───────────────────────────────────────────────────────

const GROUP_COLORS = {
  authoring:     { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  assessments:   { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-600 dark:text-blue-400",     border: "border-blue-200 dark:border-blue-800",     badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  export:        { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  collaboration: { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-800",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  adaptive:      { bg: "bg-rose-100 dark:bg-rose-900/30",     text: "text-rose-600 dark:text-rose-400",     border: "border-rose-200 dark:border-rose-800",     badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  productivity:  { bg: "bg-slate-100 dark:bg-slate-800/50",   text: "text-slate-600 dark:text-slate-400",   border: "border-slate-200 dark:border-slate-700",   badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  accessibility: { bg: "bg-teal-100 dark:bg-teal-900/30",     text: "text-teal-600 dark:text-teal-400",     border: "border-teal-200 dark:border-teal-800",     badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
};

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ feature, colors }) {
  return (
    <motion.div {...staggerItem}>
      <Link
        to={`/features/${feature.slug}`}
        className={`group flex flex-col gap-3 rounded-xl border ${colors.border} bg-card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full`}
      >
        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${colors.bg} ${colors.text} shrink-0`}>
          <Icon name={feature.icon} className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {feature.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {feature.tagline}
          </p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${colors.text} mt-auto`}>
          <span>Explore</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

// ── Content pane ──────────────────────────────────────────────────────────────

function Content() {
  return (
    <>
      {/* decorative corner label */}
      <div className="relative overflow-hidden border-r border-[#cecece] dark:border-[#16181d]">
        <motion.div
          className="absolute top-0 right-0 w-auto h-auto px-2 py-1.5 sm:px-2.5 sm:py-2 border-l border-b border-[#cecece] dark:border-[#16181d] lg:flex items-center justify-center hidden"
          {...fadeInUp}
        >
          <span className="font-mono text-[0.55rem] sm:text-[0.65rem] md:text-xs text-black dark:text-white whitespace-nowrap leading-tight">
            features.md
          </span>
        </motion.div>
      </div>

      <motion.div
        className="overflow-y-auto px-4 sm:px-6 md:px-8 py-8 md:py-12"
        {...staggerContainer}
      >
        <div className="max-w-5xl mx-auto space-y-14">

          {/* Hero */}
          <motion.section className="space-y-4" {...staggerItem}>
            <Badge variant="outline" className="text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-700 text-xs">
              Full Feature Overview
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white leading-tight">
              Everything you need to<br className="hidden sm:block" /> build great eLearning
            </h1>
            <p className="text-lg text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-2xl">
              CourseForge is a visual, block-based authoring studio with rich assessments, adaptive
              learning, SCORM export, built-in collaboration, and full localization support —
              purpose-built for instructional designers and developers alike.
            </p>
          </motion.section>

          {/* Feature groups */}
          {FEATURES_BY_GROUP.map((group) => {
            const colors = GROUP_COLORS[group.id] || GROUP_COLORS.productivity;
            return (
              <motion.section key={group.id} className="space-y-5" {...staggerItem}>
                {/* Group header */}
                <div className="flex items-start gap-3">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${colors.bg} ${colors.text} shrink-0 mt-0.5`}>
                    <Icon name={group.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">
                      {group.title}
                    </h2>
                    <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mt-0.5 max-w-2xl">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Feature cards grid */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-0 sm:pl-13"
                  variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
                  initial="initial"
                  animate="animate"
                >
                  {group.features.map((feature) => (
                    <FeatureCard key={feature.slug} feature={feature} colors={colors} />
                  ))}
                </motion.div>
              </motion.section>
            );
          })}

          {/* CTA footer */}
          <motion.section
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-6 sm:p-8"
            {...staggerItem}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Ready to start building?
              </h3>
              <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                Create your first course — no credit card required.
              </p>
            </div>
            <Link
              to="/course"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors shrink-0"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.section>

        </div>
      </motion.div>

      <div className="flex items-center justify-center px-4 md:px-8 border-l border-[#cecece] dark:border-[#16181d]" />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  return (
    <motion.div
      className="w-full h-screen grid grid-rows-[7vh_93vh_5vh] grid-cols-[5%_90%_5%] md:grid-cols-[10%_80%_10%] lg:grid-cols-[15%_70%_15%] overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      <Content />
      <Footer />
    </motion.div>
  );
}
