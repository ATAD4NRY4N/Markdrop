import JSZip from "jszip";

const imsManifest = (course) => `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.markdrop.${course.id}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${escapeXml(course.title)}</title>
      ${(course.modules || [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(
          (mod) => `<item identifier="item_${mod.id}" identifierref="res_${mod.id}">
        <title>${escapeXml(mod.title)}</title>
      </item>`
        )
        .join("\n      ")}
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_index" type="webcontent" href="index.html">
      <file href="index.html"/>
      <file href="scormdriver.js"/>
    </resource>
    ${(course.modules || [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(
        (mod) => `<resource identifier="res_${mod.id}" type="webcontent" adlcp:scormtype="sco" href="modules/${mod.id}.html">
      <file href="modules/${mod.id}.html"/>
      <file href="scormdriver.js"/>
    </resource>`
      )
      .join("\n    ")}
  </resources>
</manifest>`;

const escapeXml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const scormDriver = `var API = null;

function findAPI(win) {
  var attempts = 0;
  while (win.API == null && win.parent != null && win.parent != win) {
    attempts++;
    if (attempts > 7) break;
    win = win.parent;
  }
  return win.API;
}

function getAPI() {
  if (API == null) API = findAPI(window);
  if (API == null && window.opener != null) API = findAPI(window.opener);
  return API;
}

function doInitialize() {
  var api = getAPI();
  if (api) {
    api.LMSInitialize("");
    api.LMSSetValue("cmi.core.lesson_status", "incomplete");
  }
}

function doFinish() {
  var api = getAPI();
  if (api) {
    api.LMSSetValue("cmi.core.lesson_status", "completed");
    api.LMSSetValue("cmi.core.exit", "");
    api.LMSCommit("");
    api.LMSFinish("");
  }
}

window.addEventListener("load", doInitialize);
window.addEventListener("beforeunload", doFinish);
`;

const moduleHtml = (course, mod) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeXml(mod.title)} — ${escapeXml(course.title)}</title>
  <script src="../scormdriver.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    .nav { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
    .nav a { color: #3b82f6; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #3b82f6; border-radius: 0.375rem; }
    .nav a:hover { background: #eff6ff; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { font-family: monospace; }
    blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #6b7280; margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>${escapeXml(mod.title)}</h1>
  <div id="content">
    <p>${escapeXml(typeof mod.content === "string" ? mod.content : JSON.stringify(mod.content || []))}</p>
  </div>
  <div class="nav">
    <span>${mod._prevId ? `<a href="${mod._prevId}.html">← Previous</a>` : ""}</span>
    <a href="../index.html">Course Index</a>
    <span>${mod._nextId ? `<a href="${mod._nextId}.html">Next →</a>` : ""}</span>
  </div>
</body>
</html>`;

const indexHtml = (course) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeXml(course.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    p.desc { color: #6b7280; margin-bottom: 2rem; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 0.75rem; }
    li a { display: flex; align-items: center; gap: 0.5rem; color: #3b82f6; text-decoration: none; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
    li a:hover { background: #eff6ff; border-color: #3b82f6; }
    .num { color: #9ca3af; font-size: 0.875rem; min-width: 1.5rem; }
  </style>
</head>
<body>
  <h1>${escapeXml(course.title)}</h1>
  ${course.description ? `<p class="desc">${escapeXml(course.description)}</p>` : ""}
  <ul>
    ${(course.modules || [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(
        (mod, i) =>
          `<li><a href="modules/${mod.id}.html"><span class="num">${i + 1}.</span> ${escapeXml(mod.title)}</a></li>`
      )
      .join("\n    ")}
  </ul>
</body>
</html>`;

export async function generateScormPackage(course) {
  const zip = new JSZip();

  zip.file("imsmanifest.xml", imsManifest(course));
  zip.file("scormdriver.js", scormDriver);
  zip.file("index.html", indexHtml(course));

  const sortedModules = (course.modules || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const modulesFolder = zip.folder("modules");
  sortedModules.forEach((mod, i) => {
    const enriched = {
      ...mod,
      _prevId: i > 0 ? sortedModules[i - 1].id : null,
      _nextId: i < sortedModules.length - 1 ? sortedModules[i + 1].id : null,
    };
    modulesFolder.file(`${mod.id}.html`, moduleHtml(course, enriched));
  });

  return zip.generateAsync({ type: "blob" });
}

export async function downloadScormPackage(course) {
  const blob = await generateScormPackage(course);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(course.title || "course").replace(/[^\w\s-]/g, "").replace(/\s+/g, "_")}_scorm.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
