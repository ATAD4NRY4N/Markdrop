import { motion } from "motion/react";
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

function Content() {
  return (
    <>
      <div className="relative overflow-hidden border-r border-[#cecece] dark:border-[#16181d]">
        <motion.div
          className="absolute top-0 right-0 w-auto h-auto px-2 py-1.5 sm:px-2.5 sm:py-2 border-l border-b border-[#cecece] dark:border-[#16181d] lg:flex items-center justify-center hidden"
          {...fadeInUp}
        >
          <span className="font-mono text-[0.55rem] sm:text-[0.65rem] md:text-xs text-black dark:text-white whitespace-nowrap leading-tight">
            about_us.md
          </span>
        </motion.div>
      </div>

      <motion.div
        className="overflow-y-auto px-4 sm:px-6 md:px-8 py-8 md:py-12"
        {...staggerContainer}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.section className="space-y-4" {...staggerItem}>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
              About CourseForge
            </h1>
            <p className="text-lg text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              CourseForge is a modern, visual eLearning authoring studio built for instructional
              designers, trainers, and developers who want to create professional, standards-compliant
              courses — without the enterprise price tag. From first draft to final SCORM export,
              everything you need is in one place.
            </p>
          </motion.section>

          <motion.section className="space-y-4" {...staggerItem}>
            <h2 className="text-3xl font-bold text-black dark:text-white">Our Mission</h2>
            <p className="text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              We believe that building great eLearning should be fast, visual, and accessible to
              everyone — not just teams with expensive enterprise software. CourseForge bridges the
              gap between creative authoring and LMS-ready output, giving you a real-time preview as
              you build and a polished SCORM package at the end. Whether you're crafting a compliance
              module, an onboarding course, or a full training curriculum, CourseForge is here to
              make it efficient and enjoyable.
            </p>
          </motion.section>

          <motion.section className="space-y-4" {...staggerItem}>
            <h2 className="text-3xl font-bold text-black dark:text-white">
              What Makes Us Different
            </h2>
            <ul className="space-y-4 text-base text-[#6b7280] dark:text-[#9ca3af]">
              <li className="flex gap-3">
                <span className="text-black dark:text-white font-semibold shrink-0">
                  🎯 Block-Based Authoring:
                </span>
                <span>
                  Drag and drop rich content blocks — quizzes, flashcards, hotspots, branching
                  scenarios, and more — to build engaging modules without writing a line of code.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-black dark:text-white font-semibold shrink-0">
                  ⚡ One-Click SCORM Export:
                </span>
                <span>
                  Generate SCORM 1.2 and 2004 4th Edition packages instantly, ready for Moodle,
                  Cornerstone, TalentLMS, Docebo, or any standards-compliant LMS.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-black dark:text-white font-semibold shrink-0">
                  🧠 Adaptive Learning Paths:
                </span>
                <span>
                  Set score-based checkpoint rules that automatically route learners through required
                  or optional variant paths — all tracked in SCORM suspend_data.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-black dark:text-white font-semibold shrink-0">
                  👥 Built-In Collaboration:
                </span>
                <span>
                  Invite editors and reviewers, share review links, and manage threaded comments
                  with priority and status tracking — all without leaving the tool.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-black dark:text-white font-semibold shrink-0">
                  🎨 Custom Themes &amp; Branding:
                </span>
                <span>
                  Apply per-course fonts, colors, and layouts to match your organization's brand.
                  Preview changes live before exporting.
                </span>
              </li>
            </ul>
          </motion.section>

          <motion.section className="space-y-4" {...staggerItem}>
            <h2 className="text-3xl font-bold text-black dark:text-white">Built for eLearning Creators</h2>
            <p className="text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              CourseForge is built by developers who've experienced the friction of traditional
              authoring tools — slow exports, clunky UIs, and per-seat pricing that puts advanced
              features out of reach. We set out to create an authoring experience that's genuinely
              delightful: fast, opinionated where it helps, and flexible where it matters.
            </p>
          </motion.section>

          <motion.section className="space-y-4" {...staggerItem}>
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Open Source &amp; Community
            </h2>
            <p className="text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              CourseForge is proudly open source. We believe in transparency, collaboration, and
              giving back to the community. Contributions, bug reports, and feature ideas are always
              welcome. Together, we're building the best eLearning authoring tool for modern teams.
            </p>
          </motion.section>

          <motion.section className="space-y-4" {...staggerItem}>
            <h2 className="text-3xl font-bold text-black dark:text-white">The Road Ahead</h2>
            <p className="text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              We're constantly improving CourseForge based on real user feedback. Our roadmap includes
              an analytics dashboard for hosted courses, AI-assisted content suggestions, a richer
              block library, and deeper LMS integrations. We're excited to have you on this journey.
            </p>
          </motion.section>

          <motion.section className="space-y-4" {...staggerItem}>
            <h2 className="text-3xl font-bold text-black dark:text-white">Get in Touch</h2>
            <p className="text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Have questions, suggestions, or just want to say hi? We'd love to hear from you!
            </p>
            <div className="space-y-3">
              <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                <span className="text-black dark:text-white font-semibold">Email:</span>{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                  hello@courseforge.dev
                </code>
              </p>
              <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                <span className="text-black dark:text-white font-semibold">GitHub:</span>{" "}
                <a
                  href="https://github.com/rakheOmar/CourseForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  github.com/rakheOmar/CourseForge
                </a>
              </p>
            </div>
          </motion.section>
        </div>
      </motion.div>

      <div className="flex items-center justify-center px-4 md:px-8 border-l border-[#cecece] dark:border-[#16181d]" />
    </>
  );
}

export default function AboutPage() {
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
