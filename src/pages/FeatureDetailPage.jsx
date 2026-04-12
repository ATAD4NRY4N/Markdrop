import {
  Accessibility,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Brain,
  Brush,
  CheckCircle,
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
  MonitorSmartphone,
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
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { FEATURE_GROUPS, FEATURES_BY_GROUP, FEATURES_BY_SLUG } from "@/config/featuresData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

// ── Icon resolver ─────────────────────────────────────────────────────────────

const ICONS = {
  Accessibility, Brush, Brain, Rocket, Users2, Network, Zap,
  Layers, LayoutTemplate, LayoutGrid, Palette, MonitorSmartphone,
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
  authoring:     { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800", divider: "bg-violet-500" },
  assessments:   { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-600 dark:text-blue-400",     border: "border-blue-200 dark:border-blue-800",     divider: "bg-blue-500" },
  export:        { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", divider: "bg-emerald-500" },
  collaboration: { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-800",   divider: "bg-amber-500" },
  adaptive:      { bg: "bg-rose-100 dark:bg-rose-900/30",     text: "text-rose-600 dark:text-rose-400",     border: "border-rose-200 dark:border-rose-800",     divider: "bg-rose-500" },
  productivity:  { bg: "bg-slate-100 dark:bg-slate-800/50",   text: "text-slate-600 dark:text-slate-400",   border: "border-slate-200 dark:border-slate-700",   divider: "bg-slate-500" },
  accessibility: { bg: "bg-teal-100 dark:bg-teal-900/30",     text: "text-teal-600 dark:text-teal-400",     border: "border-teal-200 dark:border-teal-800",     divider: "bg-teal-500" },
};

// ── 404 state ─────────────────────────────────────────────────────────────────

function FeatureNotFound() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm px-4">
        <p className="text-5xl">🔍</p>
        <h2 className="text-2xl font-bold text-black dark:text-white">Feature not found</h2>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
          We couldn't find a feature at that URL. Browse the full list on the Features page.
        </p>
        <Link
          to="/features"
          className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Features
        </Link>
      </div>
    </div>
  );
}

// ── Sidebar: other features in the same group ─────────────────────────────────

function RelatedSidebar({ currentSlug, groupId, colors }) {
  const group = FEATURES_BY_GROUP.find((g) => g.id === groupId);
  if (!group) return null;
  const groupMeta = FEATURE_GROUPS.find((g) => g.id === groupId);
  const siblings = group.features.filter((f) => f.slug !== currentSlug);
  if (!siblings.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full ${colors.divider}`} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {groupMeta?.title}
        </span>
      </div>
      <nav className="space-y-1">
        {siblings.map((f) => (
          <Link
            key={f.slug}
            to={`/features/${f.slug}`}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
          >
            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${colors.bg} ${colors.text} shrink-0`}>
              <Icon name={f.icon} className="h-3.5 w-3.5" />
            </div>
            <span className="truncate">{f.title}</span>
            <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
          </Link>
        ))}
      </nav>
      <Link
        to="/features"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All features
      </Link>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function FeatureContent({ feature }) {
  const colors = GROUP_COLORS[feature.group] || GROUP_COLORS.productivity;
  const groupMeta = FEATURE_GROUPS.find((g) => g.id === feature.group);
  const groupData = FEATURES_BY_GROUP.find((g) => g.id === feature.group);
  const featureIdx = groupData?.features.findIndex((f) => f.slug === feature.slug) ?? -1;
  const prevFeature = featureIdx > 0 ? groupData.features[featureIdx - 1] : null;
  const nextFeature = featureIdx < (groupData?.features.length ?? 0) - 1 ? groupData.features[featureIdx + 1] : null;

  return (
    <>
      {/* Decorative corner label */}
      <div className="relative overflow-hidden border-r border-[#cecece] dark:border-[#16181d]">
        <motion.div
          className="absolute top-0 right-0 w-auto h-auto px-2 py-1.5 sm:px-2.5 sm:py-2 border-l border-b border-[#cecece] dark:border-[#16181d] lg:flex items-center justify-center hidden"
          {...fadeInUp}
        >
          <span className="font-mono text-[0.55rem] sm:text-[0.65rem] md:text-xs text-black dark:text-white whitespace-nowrap leading-tight">
            features/{feature.slug}.md
          </span>
        </motion.div>
      </div>

      <motion.div
        className="overflow-y-auto px-4 sm:px-6 md:px-8 py-8 md:py-12"
        {...staggerContainer}
      >
        <div className="max-w-5xl mx-auto">

          {/* Two-column layout on large screens */}
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">

            {/* Sidebar (desktop) */}
            <motion.aside className="hidden lg:block pt-1 shrink-0" {...staggerItem}>
              <div className="sticky top-8 space-y-6">
                <Link
                  to="/features"
                  className={`flex items-center gap-2 text-sm font-medium ${colors.text} hover:opacity-80 transition-opacity`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Features
                </Link>
                <RelatedSidebar
                  currentSlug={feature.slug}
                  groupId={feature.group}
                  colors={colors}
                />
              </div>
            </motion.aside>

            {/* Main content */}
            <motion.main className="space-y-10 min-w-0" {...staggerItem}>

              {/* Breadcrumb (mobile) */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap lg:hidden">
                <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
                <span>/</span>
                <span className="capitalize">{groupMeta?.title}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{feature.title}</span>
              </div>

              {/* Hero */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs ${colors.text} border-current`}
                  >
                    {groupMeta?.title}
                  </Badge>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} shrink-0`}>
                    <Icon name={feature.icon} className="h-7 w-7" />
                  </div>
                  <div className="space-y-1 pt-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white leading-tight">
                      {feature.title}
                    </h1>
                    <p className={`text-base font-medium ${colors.text}`}>
                      {feature.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-2xl">
                  {feature.description}
                </p>

                {feature.cta && (
                  <Link
                    to={feature.cta.href}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
                  >
                    {feature.cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </section>

              {/* How it works */}
              <section className="space-y-5">
                <h2 className="text-xl font-bold text-black dark:text-white">How it works</h2>
                <ol className="space-y-4">
                  {feature.howItWorks.map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 mt-0.5 ${colors.bg} ${colors.text}`}>
                        {i + 1}
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p className="text-sm font-semibold text-black dark:text-white">
                          {item.step}
                        </p>
                        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Key highlights */}
              <section className="space-y-5">
                <h2 className="text-xl font-bold text-black dark:text-white">Key highlights</h2>
                <ul className="space-y-3">
                  {feature.highlights.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${colors.text}`} />
                      <span className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Prev / Next navigation */}
              {(prevFeature || nextFeature) && (
                <section className="border-t border-[#cecece] dark:border-[#16181d] pt-6">
                  <div className="flex items-center justify-between gap-4">
                    {prevFeature ? (
                      <Link
                        to={`/features/${prevFeature.slug}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-[45%]"
                      >
                        <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                        <span className="truncate">{prevFeature.title}</span>
                      </Link>
                    ) : <div />}
                    {nextFeature ? (
                      <Link
                        to={`/features/${nextFeature.slug}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-[45%] text-right justify-end"
                      >
                        <span className="truncate">{nextFeature.title}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ) : <div />}
                  </div>
                </section>
              )}

              {/* Mobile: related features */}
              <section className="lg:hidden border-t border-[#cecece] dark:border-[#16181d] pt-6">
                <RelatedSidebar
                  currentSlug={feature.slug}
                  groupId={feature.group}
                  colors={colors}
                />
              </section>

            </motion.main>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center px-4 md:px-8 border-l border-[#cecece] dark:border-[#16181d]" />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FeatureDetailPage() {
  const { slug } = useParams();
  const feature = FEATURES_BY_SLUG[slug];

  return (
    <motion.div
      className="w-full h-screen grid grid-rows-[7vh_93vh_5vh] grid-cols-[5%_90%_5%] md:grid-cols-[10%_80%_10%] lg:grid-cols-[15%_70%_15%] overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      {feature ? <FeatureContent feature={feature} /> : <FeatureNotFound />}
      <Footer />
    </motion.div>
  );
}
