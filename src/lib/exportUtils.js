import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { marked } from "marked";

// ---------------------------------------------------------------------------
// MARP utilities
// ---------------------------------------------------------------------------

/**
 * Convert a single block (non-MARP-specific) to its markdown representation.
 * Shared between blocksToMarkdown and blocksToMarpMarkdown.
 */
const blockToMarkdown = (block) => {
  switch (block.type) {
    case "h1":
      return `# ${block.content}`;
    case "h2":
      return `## ${block.content}`;
    case "h3":
      return `### ${block.content}`;
    case "h4":
      return `#### ${block.content}`;
    case "h5":
      return `##### ${block.content}`;
    case "h6":
      return `###### ${block.content}`;
    case "paragraph":
      return block.content;
    case "grid": {
      const rawCols = block.columns || [];
      // Migrate old {type, content} format
      const columns = rawCols.map((col, i) => {
        if (Array.isArray(col.blocks)) return col;
        const b =
          col.type === "image"
            ? { type: "image", content: col.content || "", alt: "" }
            : { type: "paragraph", content: col.content || "" };
        return { blocks: [b] };
      });

      const PREFIX = { h1: "# ", h2: "## ", h3: "### ", h4: "#### ", h5: "##### ", h6: "###### " };
      const getCellText = (col) =>
        (col.blocks || [])
          .map((b) => {
            if (b.type === "separator") return "---";
            if (b.type === "image") return `![${b.alt || ""}](${b.content || ""})`;
            if (b.type === "alert")
              return `> [!${(b.alertType || "note").toUpperCase()}]\n> ${b.content || ""}`;
            return (PREFIX[b.type] || "") + (b.content || "");
          })
          .join("\n\n");

      // Render as an HTML flex row (markdown has no native multi-col support)
      const colWidth = `${Math.floor(100 / Math.max(columns.length, 1))}%`;
      const cells = columns
        .map(
          (col) =>
            `<div style="width:${colWidth};display:inline-block;vertical-align:top;padding-right:12px">${getCellText(col).replace(/\n\n/g, "<br><br>")}</div>`
        )
        .join("");
      return `<div style="display:flex;flex-wrap:wrap">${cells}</div>\n\n`;
    }
    case "blockquote":
      return `> ${block.content}`;
    case "alert": {
      const alertType = (block.alertType || "note").toUpperCase();
      const content = block.content || "";
      const lines = content.split("\n");
      const quotedLines = lines.map((line) => `> ${line}`).join("\n");
      return `> [!${alertType}]\n${quotedLines}`;
    }
    case "code":
      return block.content;
    case "html":
      return block.content;
    case "math":
      return block.content;
    case "diagram":
      return block.content;
    case "ul":
      return block.content;
    case "ol":
      return block.content;
    case "task-list":
      return block.content;
    case "separator":
      return "---";
    case "image": {
      const align = block.align || "left";
      let imageMarkdown;
      if (block.width || block.height) {
        const attrs = [`src="${block.content}"`];
        if (block.alt) attrs.push(`alt="${block.alt}"`);
        if (block.width) attrs.push(`width="${block.width}"`);
        if (block.height) attrs.push(`height="${block.height}"`);
        imageMarkdown = `<img ${attrs.join(" ")} />`;
      } else {
        imageMarkdown = `![${block.alt || ""}](${block.content})`;
      }
      if (align === "center") return `<p align="center">\n\n${imageMarkdown}\n\n</p>`;
      if (align === "right") return `<p align="right">\n\n${imageMarkdown}\n\n</p>`;
      return imageMarkdown;
    }
    case "link":
      return `[${block.content}](${block.url || ""})`;
    case "table":
      return block.content;
    default:
      return block.content || "";
  }
};

/**
 * Convert blocks (MARP mode) to a valid MARP markdown string.
 * Handles MARP-specific block types: marp-frontmatter, slide,
 * marp-slide-directive, marp-bg-image, marp-style.
 * All standard block types fall through to blockToMarkdown.
 */
export const blocksToMarpMarkdown = (blocks) => {
  if (!blocks || blocks.length === 0) return "";

  const parts = [];

  for (const block of blocks) {
    switch (block.type) {
      case "marp-frontmatter": {
        const lines = ["---", "marp: true"];
        if (block.theme) lines.push(`theme: ${block.theme}`);
        if (block.size) lines.push(`size: '${block.size}'`);
        if (block.paginate) lines.push("paginate: true");
        if (block.header) lines.push(`header: '${block.header}'`);
        if (block.footer) lines.push(`footer: '${block.footer}'`);
        if (block.backgroundColor) lines.push(`backgroundColor: '${block.backgroundColor}'`);
        if (block.color) lines.push(`color: '${block.color}'`);
        lines.push("---");
        parts.push(lines.join("\n"));
        break;
      }
      case "slide":
        parts.push("---");
        break;
      case "marp-slide-directive": {
        const directives = block.directives || [];
        const comments = directives
          .filter((d) => d.key && d.value)
          .map((d) => `<!-- ${d.key}: ${d.value} -->`);
        if (comments.length > 0) parts.push(comments.join("\n"));
        break;
      }
      case "marp-bg-image": {
        if (!block.content) break;
        let alt = block.position || "bg";
        if (block.opacity) alt += ` opacity:${block.opacity}`;
        parts.push(`![${alt}](${block.content})`);
        break;
      }
      case "marp-style": {
        if (block.content) parts.push(`<style>\n${block.content}\n</style>`);
        break;
      }
      default:
        parts.push(blockToMarkdown(block));
        break;
    }
  }

  return parts.filter(Boolean).join("\n\n");
};

/**
 * Export blocks as a MARP-compatible .md file.
 */
export const exportToMarpMarkdown = (blocks, filename = "presentation.md") => {
  if (!blocks || blocks.length === 0) throw new Error("No content to export");

  const markdown = blocksToMarpMarkdown(blocks);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Build a self-contained HTML slide deck from blocks.
 * Uses a simple slide-based layout (no marp-core dependency).
 */
const buildMarpSlidesHTML = (blocks) => {
  // Collect settings and CSS
  const frontmatter = blocks.find((b) => b.type === "marp-frontmatter");
  const customCss = blocks
    .filter((b) => b.type === "marp-style" && b.content)
    .map((b) => b.content)
    .join("\n");

  const isWide = !frontmatter || !frontmatter.size || frontmatter.size === "16:9";
  const globalBg = frontmatter?.backgroundColor || "#ffffff";
  const globalColor = frontmatter?.color || "#1a1a1a";
  const showPageNumbers = !!frontmatter?.paginate;
  const globalHeader = frontmatter?.header || "";
  const globalFooter = frontmatter?.footer || "";

  // Split into slides
  const slideGroups = [];
  let current = [];
  for (const block of blocks) {
    if (block.type === "marp-frontmatter") continue;
    if (block.type === "slide") {
      slideGroups.push(current);
      current = [];
    } else {
      current.push(block);
    }
  }
  slideGroups.push(current);

  const slidesHtml = slideGroups.map((slideBlocks, idx) => {
    // Per-slide directives
    const directives = {};
    for (const block of slideBlocks) {
      if (block.type === "marp-slide-directive") {
        for (const d of block.directives || []) {
          if (d.key && d.value) directives[d.key] = d.value;
        }
      }
    }

    const bgBlock = slideBlocks.find((b) => b.type === "marp-bg-image" && b.content);
    const bgStyle = bgBlock
      ? `background-image:url('${bgBlock.content}');background-size:cover;background-position:center;`
      : "";
    const slideColor = directives._color || globalColor;
    const slideBg = directives._backgroundColor || globalBg;
    const header = directives._header || globalHeader;
    const footer = directives._footer || globalFooter;

    const contentBlocks = slideBlocks.filter(
      (b) => b.type !== "marp-slide-directive" && b.type !== "marp-bg-image" && b.type !== "marp-style"
    );
    const mdContent = contentBlocks.map((b) => blockToMarkdown(b)).filter(Boolean).join("\n\n");
    const htmlContent = marked.parse(mdContent || "", { breaks: true, gfm: true });

    return `
  <section id="slide-${idx}" class="slide${idx === 0 ? " active" : ""}" style="background-color:${slideBg};color:${slideColor};${bgStyle}">
    ${header ? `<div class="slide-header" style="color:${slideColor}">${header}</div>` : ""}
    <div class="slide-content">${htmlContent}</div>
    ${footer ? `<div class="slide-footer" style="color:${slideColor}">${footer}</div>` : ""}
    ${showPageNumbers ? `<div class="slide-number" style="color:${slideColor}">${idx + 1}</div>` : ""}
  </section>`;
  });

  const aspectPadding = isWide ? "56.25%" : "75%";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Markdrop Presentation</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #111; display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont,
           'Segoe UI', Roboto, sans-serif; }
    .slide-wrapper { width: 90vw; max-width: 960px; position: relative; padding-top: ${aspectPadding}; }
    .slide { position: absolute; inset: 0; flex-direction: column; overflow: hidden;
             display: none; opacity: 0; transition: opacity 0.35s ease; }
    .slide.active { display: flex; opacity: 1; }
    .slide.slide-out { display: flex; opacity: 0; }
    .slide-header { position: absolute; top: 1.5rem; left: 3.5rem; right: 3.5rem;
                    font-size: 0.75rem; opacity: 0.7; }
    .slide-footer { position: absolute; bottom: 1.5rem; left: 3.5rem; right: 3.5rem;
                    font-size: 0.75rem; opacity: 0.7; }
    .slide-number { position: absolute; bottom: 1.5rem; right: 2rem;
                    font-size: 0.75rem; opacity: 0.5; }
    .slide-content { flex: 1; display: flex; flex-direction: column; justify-content: center;
                     padding: 3.5rem 4rem; overflow: hidden; }
    .slide-content h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 700;
                        margin-bottom: 1rem; line-height: 1.2; }
    .slide-content h2 { font-size: clamp(1.2rem, 3vw, 2rem); font-weight: 600; margin-bottom: 0.75rem; }
    .slide-content h3 { font-size: clamp(1rem, 2.5vw, 1.5rem); font-weight: 600; margin-bottom: 0.5rem; }
    .slide-content p { margin-bottom: 0.75rem; line-height: 1.6; }
    .slide-content ul, .slide-content ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
    .slide-content li { margin-bottom: 0.3rem; }
    .slide-content code { background: rgba(0,0,0,0.15); padding: 0.15em 0.4em; border-radius: 3px;
                          font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em; }
    .slide-content pre { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 6px;
                         margin-bottom: 0.75rem; overflow: auto; }
    .slide-content pre code { background: transparent; padding: 0; }
    .slide-content blockquote { border-left: 4px solid currentColor; padding-left: 1rem;
                                opacity: 0.8; margin-bottom: 0.75rem; }
    .slide-content table { border-collapse: collapse; width: 100%; margin-bottom: 0.75rem; }
    .slide-content th, .slide-content td { border: 1px solid rgba(128,128,128,0.4);
                                           padding: 0.5rem 0.75rem; }
    .slide-content th { background: rgba(0,0,0,0.1); font-weight: 600; }
    .slide-content img { max-width: 100%; height: auto; border-radius: 4px; }
    .controls { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; color: #aaa; }
    .controls button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                       color: #fff; padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer;
                       font-size: 0.875rem; transition: background 0.2s; }
    .controls button:hover { background: rgba(255,255,255,0.2); }
    .controls button:disabled { opacity: 0.3; cursor: default; }
    #slide-counter { font-size: 0.875rem; min-width: 60px; text-align: center; }
    ${customCss}
  </style>
</head>
<body>
  <div class="slide-wrapper">
    ${slidesHtml.join("\n")}
  </div>
  <div class="controls">
    <button id="prev-btn" onclick="navigate(-1)" disabled>← Prev</button>
    <span id="slide-counter">1 / ${slideGroups.length}</span>
    <button id="next-btn" onclick="navigate(1)">Next →</button>
  </div>
  <script>
    var current = 0;
    var total = ${slideGroups.length};
    var slides = document.querySelectorAll('.slide');
    function navigate(dir) {
      var prev = slides[current];
      prev.classList.add('slide-out');
      setTimeout(function() { prev.classList.remove('active', 'slide-out'); }, 350);
      current = Math.max(0, Math.min(total - 1, current + dir));
      slides[current].classList.add('active');
      document.getElementById('slide-counter').textContent = (current + 1) + ' / ' + total;
      document.getElementById('prev-btn').disabled = current === 0;
      document.getElementById('next-btn').disabled = current === total - 1;
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(-1);
    });
    if (total <= 1) document.getElementById('next-btn').disabled = true;
  </script>
</body>
</html>`;
};

/**
 * Export blocks as a self-contained HTML slide presentation.
 */
export const exportToMarpHTML = (blocks, filename = "presentation.html") => {
  if (!blocks || blocks.length === 0) throw new Error("No content to export");

  const html = buildMarpSlidesHTML(blocks);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

marked.setOptions({
  breaks: true,
  gfm: true,
  silent: true,
});

const ATTRIBUTION_FOOTER = `

---

<div align="center">
  <sub>Created with <a href="https://markdrop.vercel.app">Markdrop</a> | <a href="https://github.com/rakheOmar/Markdrop">⭐ Star on GitHub</a></sub>
</div>`;

export const blocksToMarkdown = (blocks, includeAttribution = true) => {
  if (!blocks || blocks.length === 0) {
    return "";
  }

  const content = blocks
    .map((block) => {
      switch (block.type) {
        case "h1":
          return `# ${block.content}`;
        case "h2":
          return `## ${block.content}`;
        case "h3":
          return `### ${block.content}`;
        case "h4":
          return `#### ${block.content}`;
        case "h5":
          return `##### ${block.content}`;
        case "h6":
          return `###### ${block.content}`;
        case "paragraph":
          return block.content;
        case "blockquote":
          return `> ${block.content}`;
        case "alert": {
          const alertType = (block.alertType || "note").toUpperCase();
          const content = block.content || "";
          const lines = content.split("\n");
          const quotedLines = lines.map((line) => `> ${line}`).join("\n");
          return `> [!${alertType}]\n${quotedLines}`;
        }
        case "code":
          return block.content;
        case "html":
          return block.content;
        case "ul":
          return block.content;
        case "ol":
          return block.content;
        case "task-list":
          return block.content;
        case "separator":
          return "---";
        case "image": {
          const align = block.align || "left";
          let imageMarkdown;

          if (block.width || block.height) {
            const attrs = [`src="${block.content}"`];
            if (block.alt) attrs.push(`alt="${block.alt}"`);
            if (block.width) attrs.push(`width="${block.width}"`);
            if (block.height) attrs.push(`height="${block.height}"`);
            imageMarkdown = `<img ${attrs.join(" ")} />`;
          } else {
            imageMarkdown = `![${block.alt || ""}](${block.content})`;
          }

          if (align === "center") {
            return `<p align="center">\n\n${imageMarkdown}\n\n</p>`;
          } else if (align === "right") {
            return `<p align="right">\n\n${imageMarkdown}\n\n</p>`;
          }
          return imageMarkdown;
        }
        case "link":
          return `[${block.content}](${block.url || ""})`;
        case "table":
          return block.content;
        case "shield-badge": {
          const label = block.label || "label";
          const message = block.message || "message";
          const color = block.badgeColor || "blue";
          let url = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}`;
          const params = [];
          if (block.style && block.style !== "flat") {
            params.push(`style=${block.style}`);
          }
          if (block.logo) {
            params.push(`logo=${encodeURIComponent(block.logo)}`);
          }
          if (params.length > 0) {
            url += `?${params.join("&")}`;
          }
          return `![${label}: ${message}](${url})`;
        }
        case "skill-icons": {
          const icons = block.icons || "js,html,css";
          let url = `https://skillicons.dev/icons?i=${icons}`;
          if (block.theme && block.theme !== "dark") {
            url += `&theme=${block.theme}`;
          }
          if (block.perLine && block.perLine !== "15") {
            url += `&perline=${block.perLine}`;
          }
          return `![Skill Icons](${url})`;
        }
        default:
          return block.content || "";
      }
    })
    .filter(Boolean)
    .join("\n\n");

  return includeAttribution ? content + ATTRIBUTION_FOOTER : content;
};

// ---------------------------------------------------------------------------
// Animation helpers for HTML export
// ---------------------------------------------------------------------------

const ANIM_KEYFRAMES = `
@keyframes _md_fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes _md_fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
@keyframes _md_slideInLeft { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:none } }
@keyframes _md_slideInRight { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:none } }
@keyframes _md_zoomIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
`;

const ANIM_NAME_MAP = {
  fadeIn: "_md_fadeIn",
  fadeInUp: "_md_fadeInUp",
  slideInLeft: "_md_slideInLeft",
  slideInRight: "_md_slideInRight",
  zoomIn: "_md_zoomIn",
};

/**
 * Build the CSS for all animated blocks and return an IntersectionObserver
 * script that triggers animations when elements enter the viewport.
 */
const buildAnimationExtras = (blocks) => {
  const hasAny = blocks.some((b) => b.animation && b.animation.type && b.animation.type !== "none");
  if (!hasAny) return { css: "", script: "" };

  const css = `
${ANIM_KEYFRAMES}
[data-md-anim] { opacity: 0; }
[data-md-anim].md-anim-ready { opacity: 1; animation-fill-mode: both; animation-timing-function: ease-out; }
`;

  const script = `
(function() {
  var els = document.querySelectorAll('[data-md-anim]');
  if (!els.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        var el = e.target;
        var name = el.getAttribute('data-md-anim');
        var dur = el.getAttribute('data-md-dur') || '0.5';
        var delay = el.getAttribute('data-md-delay') || '0';
        el.style.animationName = name;
        el.style.animationDuration = dur + 's';
        el.style.animationDelay = delay + 's';
        el.classList.add('md-anim-ready');
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(el) { obs.observe(el); });
})();
`;

  return { css, script };
};

/**
 * Wrap an HTML string in an animation div if the block has an animation set.
 */
const wrapWithAnimation = (htmlStr, block) => {
  const anim = block.animation;
  if (!anim || !anim.type || anim.type === "none") return htmlStr;
  const animName = ANIM_NAME_MAP[anim.type];
  if (!animName) return htmlStr;
  const dur = (anim.duration ?? 0.5).toFixed(2);
  const delay = (anim.delay ?? 0).toFixed(2);
  return `<div data-md-anim="${animName}" data-md-dur="${dur}" data-md-delay="${delay}">${htmlStr}</div>`;
};

export const blocksToHTML = (blocks, includeAttribution = true, includeAnimations = true) => {
  if (!blocks || blocks.length === 0) {
    return getHTMLTemplate("", includeAttribution);
  }

  try {
    const labelMap = {
      js: "JS",
      javascript: "JS",
      ts: "TS",
      typescript: "TS",
      html: "HTML5",
      css: "CSS",
    };

    // Render each block's markdown individually so we can wrap with animation divs
    const blockHtmlParts = blocks.map((block) => {
      const singleMd = blockToMarkdown(block);
      if (!singleMd) return "";
      const html = marked.parse(singleMd, { breaks: true, gfm: true });
      const container = document.createElement("div");
      container.innerHTML = html;
      container.querySelectorAll("pre > code").forEach((codeEl) => {
        const cls = codeEl.className || "";
        const match = cls.match(/language-([a-z0-9+#]+)/i);
        const lang = match ? match[1].toLowerCase() : "";
        const label = labelMap[lang] || (lang ? lang.toUpperCase() : "");
        if (!label) return;
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        const badge = document.createElement("span");
        badge.textContent = label;
        badge.style.cssText =
          "position:absolute;top:8px;right:8px;font-size:10px;padding:2px 6px;border-radius:6px;";
        if (lang === "js" || lang === "javascript") {
          badge.style.background = "#fbbf24";
          badge.style.color = "#111827";
        } else if (lang === "html") {
          badge.style.background = "#f97316";
          badge.style.color = "#ffffff";
        } else if (lang === "css") {
          badge.style.background = "#3b82f6";
          badge.style.color = "#ffffff";
        } else if (lang === "ts" || lang === "typescript") {
          badge.style.background = "#2563eb";
          badge.style.color = "#ffffff";
        } else {
          badge.style.background = "#e5e7eb";
          badge.style.color = "#6b7280";
        }
        const pre = codeEl.parentElement;
        pre.parentElement?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(badge);
      });
      const rendered = container.innerHTML;
      return includeAnimations ? wrapWithAnimation(rendered, block) : rendered;
    });

    const attribution = includeAttribution
      ? marked.parse(
          `\n\n---\n\n<div align="center"><sub>Created with <a href="https://markdrop.vercel.app">Markdrop</a> | <a href="https://github.com/rakheOmar/Markdrop">⭐ Star on GitHub</a></sub></div>`,
          { breaks: true, gfm: true }
        )
      : "";

    const content = blockHtmlParts.filter(Boolean).join("\n") + attribution;
    const animExtras = includeAnimations ? buildAnimationExtras(blocks) : { css: "", script: "" };
    return getHTMLTemplate(content, false, animExtras);
  } catch (error) {
    console.error("Error converting blocks to HTML:", error);
    const fallbackHTML = blocks
      .map((block) => {
        if (block.type === "html") return block.content;
        return `<p>${escapeHtml(block.content || "")}</p>`;
      })
      .join("\n");
    return getHTMLTemplate(fallbackHTML, includeAttribution);
  }
};

const getHTMLTemplate = (content, includeAttribution = true, animExtras = { css: "", script: "" }) => {
  const attribution = includeAttribution
    ? `
    <hr style="margin: 3rem 0 2rem; border: none; border-top: 1px solid #e5e7eb;">
    <div style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 2rem;">
        <p>Created with <a href="https://markdrop.vercel.app" style="color: #0366d6; text-decoration: none;">Markdrop</a> | 
        <a href="https://github.com/rakheOmar/Markdrop" style="color: #0366d6; text-decoration: none;">⭐ Star on GitHub</a></p>
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdrop Document</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 2em;
            margin-bottom: 1em;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 1.875rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 1rem; }
        h2 { font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 1rem; }
        h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        h4 { font-size: 1.125rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        h5 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        h6 { font-size: 0.875rem; color: #6b7280; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        p { margin-bottom: 1rem; line-height: 1.75; }
        blockquote {
            margin: 1rem 0;
            padding-left: 1rem;
            color: #6b7280;
            border-left: 4px solid #e5e7eb;
        }
        code {
            padding: 0.15em 0.4em;
            margin: 0;
            font-size: 0.875rem;
            background-color: #f3f4f6;
            border-radius: 4px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        pre {
            padding: 16px;
            overflow: auto;
            font-size: 0.875rem;
            line-height: 1.6;
            background-color: #f3f4f6;
            border-radius: 8px;
            margin: 1rem 0;
        }
        pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            display: block;
            white-space: pre-wrap;
        }
        ul, ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            margin: 1rem 0;
        }
        table th, table td {
            padding: 10px 16px;
            border: 1px solid #e5e7eb;
        }
        table th {
            font-weight: 600;
            background-color: #f3f4f6;
        }
        img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
            border-radius: 6px;
            display: block;
        }
        hr {
            height: 0;
            border: none;
            border-top: 4px solid #e5e7eb;
            margin: 2rem 0;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .task-list-item { list-style: none; }
        .task-list-item input[type="checkbox"] { margin-right: 0.5em; vertical-align: middle; }
        @media print {
            body { margin: 0; padding: 20px; }
            h1, h2 { page-break-after: avoid; }
            pre, blockquote { page-break-inside: avoid; }
        }
        ${animExtras.css || ""}
    </style>
</head>
<body>
    ${content}
    ${attribution}
    ${animExtras.script ? `<script>${animExtras.script}<\/script>` : ""}
</body>
</html>`;
};

const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

export const exportToPDF = async (blocks, filename = "document.pdf", includeAttribution = true) => {
  if (!blocks || blocks.length === 0) {
    throw new Error("No content to export");
  }

  const htmlContent = blocksToHTML(blocks, includeAttribution);
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "800px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("PDF export timed out"));
    }, 30000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    const handleLoad = async () => {
      try {
        await new Promise((r) => setTimeout(r, 1500));

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !iframeDoc.body) {
          cleanup();
          reject(new Error("Unable to access iframe content"));
          return;
        }

        const body = iframeDoc.body;
        const canvas = await html2canvas(body, {
          scale: 1.5,
          useCORS: true,
          allowTaint: false,
          imageTimeout: 15000,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc) => {
            const clonedBody = clonedDoc.body;
            if (clonedBody) {
              clonedBody.style.width = "800px";
              clonedBody.style.overflow = "visible";
            }
          },
        });

        const imgData = canvas.toDataURL("image/png", 0.92);
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          pdf.addPage();
          const yPosition = -(heightLeft - imgHeight);
          pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        cleanup();
        pdf.save(filename);
        resolve(true);
      } catch (error) {
        cleanup();
        console.error("PDF generation error:", error);
        reject(new Error("Failed to generate PDF: " + (error.message || "Unknown error")));
      }
    };

    iframe.onload = handleLoad;
    iframe.onerror = () => {
      cleanup();
      reject(new Error("Failed to load iframe"));
    };

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      } else {
        cleanup();
        reject(new Error("Unable to initialize iframe"));
      }
    } catch (error) {
      cleanup();
      reject(new Error("Failed to write HTML to iframe: " + error.message));
    }
  });
};

export const exportToHTML = (
  blocks,
  filename = "document.html",
  includeAttribution = true,
  includeAnimations = true
) => {
  if (!blocks || blocks.length === 0) {
    throw new Error("No content to export");
  }

  try {
    const htmlContent = blocksToHTML(blocks, includeAttribution, includeAnimations);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("HTML export error:", error);
    throw new Error("Failed to export HTML: " + error.message);
  }
};

export const exportToMarkdown = (blocks, filename = "document.md", includeAttribution = true) => {
  if (!blocks || blocks.length === 0) {
    throw new Error("No content to export");
  }

  try {
    const markdown = blocksToMarkdown(blocks, includeAttribution);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Markdown export error:", error);
    throw new Error("Failed to export Markdown: " + error.message);
  }
};
