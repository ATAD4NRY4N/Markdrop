/**
 * scormUtils.js
 *
 * Client-side SCORM 1.2 and SCORM 2004 4th Edition package generator.
 * Produces a self-contained ZIP file (imsmanifest.xml + SCO HTML files)
 * ready for upload to any SCORM-conformant LMS.
 */

import JSZip from "jszip";
import { marked } from "marked";

// ---------------------------------------------------------------------------
// Block → HTML conversion (reused from exportUtils patterns)
// ---------------------------------------------------------------------------

let _htmlIdCounter = 0;
function nextHtmlId(prefix) {
  _htmlIdCounter += 1;
  return `${prefix}_${_htmlIdCounter}`;
}

function blockToHtml(block) {
  switch (block.type) {
    case "h1":
      return `<h1>${escHtml(block.content)}</h1>`;
    case "h2":
      return `<h2>${escHtml(block.content)}</h2>`;
    case "h3":
      return `<h3>${escHtml(block.content)}</h3>`;
    case "h4":
      return `<h4>${escHtml(block.content)}</h4>`;
    case "h5":
      return `<h5>${escHtml(block.content)}</h5>`;
    case "h6":
      return `<h6>${escHtml(block.content)}</h6>`;
    case "paragraph":
      return `<p>${marked.parseInline(block.content || "")}</p>`;
    case "blockquote":
      return `<blockquote><p>${marked.parseInline(block.content || "")}</p></blockquote>`;
    case "alert": {
      const alertType = (block.alertType || "note").toUpperCase();
      const colorMap = {
        NOTE: "#3b82f6",
        TIP: "#22c55e",
        IMPORTANT: "#a855f7",
        WARNING: "#f59e0b",
        CAUTION: "#ef4444",
      };
      const color = colorMap[alertType] || "#6b7280";
      return `<div style="border-left:4px solid ${color};padding:0.75rem 1rem;background:${color}18;border-radius:0 0.375rem 0.375rem 0;margin:1rem 0"><strong style="color:${color}">${alertType}</strong><p style="margin:0.5rem 0 0">${marked.parseInline(block.content || "")}</p></div>`;
    }
    case "code":
      return marked.parse(block.content || "");
    case "html":
      return block.content || "";
    case "ul":
      return marked.parse(block.content || "");
    case "ol":
      return marked.parse(block.content || "");
    case "task-list":
      return marked.parse(block.content || "");
    case "separator":
      return "<hr/>";
    case "image": {
      const attrs = [`src="${escHtml(block.content)}" alt="${escHtml(block.alt || "")}"`];
      if (block.width) attrs.push(`width="${escHtml(block.width)}"`);
      if (block.height) attrs.push(`height="${escHtml(block.height)}"`);
      const img = `<img ${attrs.join(" ")} style="max-width:100%;height:auto"/>`;
      if (block.align === "center") return `<p style="text-align:center">${img}</p>`;
      if (block.align === "right") return `<p style="text-align:right">${img}</p>`;
      return `<p>${img}</p>`;
    }
    case "link":
      return `<p><a href="${escHtml(block.url || "#")}">${escHtml(block.content)}</a></p>`;
    case "table":
      return marked.parse(block.content || "");
    case "math":
      return marked.parse(block.content || "");
    case "diagram":
      return marked.parse(block.content || "");

    // eLearning blocks
    case "learning-objective": {
      const items = (block.objectives || []).filter(Boolean);
      if (!items.length) return "";
      return `<div class="learning-objectives"><strong>🎯 Learning Objectives</strong><ul>${items.map((o) => `<li>${escHtml(o)}</li>`).join("")}</ul></div>`;
    }
    case "progress-marker":
      return `<div class="progress-marker"><span>🚩 ${escHtml(block.label || "Checkpoint")}</span></div>`;
    case "course-nav":
      return `<div class="course-nav"><button class="btn-prev" onclick="prevModule()">${escHtml(block.prevLabel || "← Previous")}</button><button class="btn-next" onclick="nextModule()"${block.locked ? ' data-locked="true"' : ""}>${escHtml(block.nextLabel || "Next →")}</button></div>`;
    case "branching":
      return buildBranchingHtml(block);
    case "flashcard":
      return buildFlashcardHtml(block);
    case "knowledge-check":
      return buildKnowledgeCheckHtml(block);
    case "quiz":
      return buildQuizHtml(block);
    case "time-requirements":
      return buildTimeRequirementsHtml(block);
    case "categorization":
      return buildCategorizationHtml(block);

    default:
      return `<p>${marked.parseInline(block.content || "")}</p>`;
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildFlashcardHtml(block) {
  const id = nextHtmlId("fc");
  return `<div class="flashcard" id="${id}" onclick="flipCard('${id}')">
  <div class="flashcard-inner">
    <div class="flashcard-front"><p>${escHtml(block.front || "(Front)")}</p></div>
    <div class="flashcard-back"><p>${escHtml(block.back || "(Back)")}</p></div>
  </div>
  <p class="flashcard-hint">Click to flip</p>
</div>`;
}

function buildBranchingHtml(block) {
  const choices = (block.choices || []).map((c, i) => {
    const letter = String.fromCharCode(65 + i);
    return `<button class="branch-btn" onclick="branchChoice('${escHtml(c.targetLabel || "")}')"><strong>${letter}.</strong> ${escHtml(c.label || `Choice ${letter}`)}</button>`;
  });
  return `<div class="branching">
  <p class="branching-prompt">${escHtml(block.prompt || "")}</p>
  <div class="branch-choices">${choices.join("\n")}</div>
</div>`;
}

function buildKnowledgeCheckHtml(block) {
  const qid = nextHtmlId("kc");
  const opts = (block.options || [])
    .map(
      (opt, i) => `
    <button class="mc-option" onclick="kcAnswer('${qid}',${i},${block.correctIndex ?? 0})" data-idx="${i}">
      ${escHtml(opt || `Option ${i + 1}`)}
    </button>`
    )
    .join("");
  return `<div class="knowledge-check" id="${qid}">
  <p class="kc-prompt">${escHtml(block.prompt || "Knowledge Check")}</p>
  <div class="mc-options">${opts}</div>
  <div class="kc-feedback" id="${qid}_fb" style="display:none"></div>
</div>`;
}

function buildQuizHtml(block) {
  const qid = nextHtmlId("quiz");
  const questions = block.questions || [];
  const totalPts = questions.reduce((s, q) => s + (q.points ?? 1), 0);

  const questionsHtml = questions
    .map((q, qi) => {
      const qqid = `${qid}_q${qi}`;
      const type = q.type || "mcq";

      let inputsHtml = "";
      if (type === "mcq") {
        inputsHtml = (q.options || [])
          .map(
            (opt, oi) => `
        <label class="mc-label">
          <input type="radio" name="${qqid}" value="${oi}" />
          ${escHtml(opt || `Option ${oi + 1}`)}
        </label>`
          )
          .join("");
      } else if (type === "tf") {
        inputsHtml = `
        <label class="mc-label"><input type="radio" name="${qqid}" value="True" /> True</label>
        <label class="mc-label"><input type="radio" name="${qqid}" value="False" /> False</label>`;
      } else if (type === "fitb") {
        inputsHtml = `<input type="text" id="${qqid}_text" class="fitb-input" placeholder="Your answer…" />`;
      }

      return `<div class="quiz-question" id="${qqid}">
  <p class="q-prompt"><strong>Q${qi + 1}.</strong> ${escHtml(q.prompt || "")}</p>
  <div class="q-inputs">${inputsHtml}</div>
  <div class="q-feedback" id="${qqid}_fb" style="display:none"></div>
</div>`;
    })
    .join("\n");

  const correctAnswers = JSON.stringify(
    questions.map((q) => {
      if ((q.type || "mcq") === "mcq") return { type: "mcq", correct: q.correctIndex ?? 0 };
      if (q.type === "tf") return { type: "tf", correct: q.correctTF ?? "True" };
      if (q.type === "fitb")
        return {
          type: "fitb",
          accepted: (q.acceptedAnswers || []).map((a) => a.toLowerCase().trim()),
        };
      return { type: "mcq", correct: 0 };
    })
  );

  const feedbacks = JSON.stringify(
    questions.map((q) => ({
      correct: q.feedbackCorrect || "Correct!",
      incorrect: q.feedbackIncorrect || "Incorrect.",
    }))
  );

  const points = JSON.stringify(questions.map((q) => q.points ?? 1));

  return `<div class="quiz-block" id="${qid}" data-total-pts="${totalPts}" data-pass="${block.passThreshold ?? 80}">
  <p class="quiz-title"><strong>${escHtml(block.title || "Quiz")}</strong></p>
  ${questionsHtml}
  <button class="btn-submit-quiz" onclick="submitQuiz('${qid}',${correctAnswers},${feedbacks},${points})">Submit Quiz</button>
  <div class="quiz-result" id="${qid}_result" style="display:none"></div>
</div>`;
}

function buildTimeRequirementsHtml(block) {
  const tid = nextHtmlId("tr");
  const requiredSeconds = (block.requiredMinutes ?? 2) * 60;
  const showProgress = block.showProgress !== false;
  const hideOnCompleted = block.hideOnCompleted ?? false;
  return `<div class="time-requirement" id="${tid}" data-required="${requiredSeconds}" data-show-progress="${showProgress}" data-hide-completed="${hideOnCompleted}">
  <div class="tr-header">⏱ Time Requirement</div>
  <div class="tr-body" id="${tid}_body">
    <p class="tr-message">Please spend at least <strong>${escHtml(String(block.requiredMinutes ?? 2))} minute(s)</strong> on this section before continuing.</p>
    ${
      showProgress
        ? `<div class="tr-progress-wrap" id="${tid}_wrap">
      <div class="tr-progress-labels"><span id="${tid}_elapsed">0:00 elapsed</span><span id="${tid}_remaining">${Math.floor(requiredSeconds / 60)}:00 remaining</span></div>
      <div class="tr-progress-bar"><div class="tr-progress-fill" id="${tid}_fill" style="width:0%"></div></div>
    </div>`
        : ""
    }
  </div>
  <div class="tr-complete" id="${tid}_complete" style="display:none">⏱ Time requirement met — you may continue.</div>
  <script>
  (function(){
    var el = document.getElementById('${tid}');
    var required = ${requiredSeconds};
    var elapsed = 0;
    var hideOnComplete = ${hideOnCompleted};
    var iv = setInterval(function(){
      elapsed++;
      ${
        showProgress
          ? `
      var pct = Math.min(100, Math.round(elapsed/required*100));
      var fill = document.getElementById('${tid}_fill');
      if(fill) fill.style.width = pct+'%';
      var em = document.getElementById('${tid}_elapsed');
      var rm = document.getElementById('${tid}_remaining');
      var rem = Math.max(0, required - elapsed);
      if(em) em.textContent = Math.floor(elapsed/60)+':'+(elapsed%60<10?'0':'')+(elapsed%60)+' elapsed';
      if(rm) rm.textContent = Math.floor(rem/60)+':'+(rem%60<10?'0':'')+(rem%60)+' remaining';
      `
          : ""
      }
      if(elapsed >= required){
        clearInterval(iv);
        var body = document.getElementById('${tid}_body');
        var complete = document.getElementById('${tid}_complete');
        if(hideOnComplete && el) { el.style.display='none'; } else { if(body) body.style.display='none'; if(complete) complete.style.display='block'; }
        if(typeof scormSet === 'function') { scormSet(_scorm && _scorm.version==='1.2' ? 'cmi.core.lesson_status' : 'cmi.completion_status', 'completed'); scormCommit(); }
      }
    }, 1000);
  })();
  </script>
</div>`;
}

function buildCategorizationHtml(block) {
  const cid = nextHtmlId("cat");
  const categories = block.categories || [];
  const items = block.items || [];
  const mode = block.mode || "checklist";
  const prompt = block.prompt || "Sort the following items into the correct categories:";

  const correctMap = JSON.stringify(Object.fromEntries(items.map((it) => [it.id, it.categoryId])));

  if (mode === "checklist") {
    const headerCols = categories
      .map((c) => `<th class="cat-col-header">${escHtml(c.label)}</th>`)
      .join("");
    const itemRows = items
      .map((it) => {
        const radioInputs = categories
          .map(
            (c) =>
              `<td class="cat-radio-cell"><input type="radio" name="${cid}_${escHtml(it.id)}" value="${escHtml(c.id)}" /></td>`
          )
          .join("");
        return `<tr id="${cid}_row_${escHtml(it.id)}"><td class="cat-item-cell">${escHtml(it.content || "(empty)")}</td>${radioInputs}</tr>`;
      })
      .join("\n");

    return `<div class="categorization" id="${cid}">
  <p class="cat-prompt">${escHtml(prompt)}</p>
  <table class="cat-table">
    <thead><tr><th class="cat-item-header">Item</th>${headerCols}</tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <button class="btn-submit-cat" onclick="submitCategorization('${cid}',${correctMap})">Submit</button>
  <div class="cat-result" id="${cid}_result" style="display:none"></div>
</div>`;
  }

  // drag-drop mode: simplified for SCORM (no native DnD, use click-to-assign)
  const categoryZones = categories
    .map(
      (c, idx) =>
        `<div class="cat-zone" id="${cid}_zone_${escHtml(c.id)}" data-cat="${escHtml(c.id)}" onclick="catZoneClick('${cid}','${escHtml(c.id)}')">
  <p class="cat-zone-title" style="color:${["#3b82f6", "#22c55e", "#a855f7", "#f59e0b"][idx % 4]}">${escHtml(c.label)}</p>
</div>`
    )
    .join("\n");

  const itemPills = items
    .map(
      (it) =>
        `<button class="cat-pill" id="${cid}_pill_${escHtml(it.id)}" data-item="${escHtml(it.id)}" onclick="catPillClick('${cid}','${escHtml(it.id)}')">${escHtml(it.content || "(empty)")}</button>`
    )
    .join("\n");

  return `<div class="categorization" id="${cid}">
  <p class="cat-prompt">${escHtml(prompt)}</p>
  <div class="cat-zones">${categoryZones}</div>
  <div class="cat-pool" id="${cid}_pool">${itemPills}</div>
  <button class="btn-submit-cat" onclick="submitCategorization('${cid}',${correctMap})">Submit</button>
  <div class="cat-result" id="${cid}_result" style="display:none"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// Full SCO HTML page builder
// ---------------------------------------------------------------------------

const SCORM_RUNTIME_SHIM = `
var _scorm = null;
function findAPI(win) {
  var attempts = 0;
  while (!win.API && !win.API_1484_11 && win.parent && win.parent !== win && attempts < 10) {
    win = win.parent; attempts++;
  }
  if (win.API_1484_11) return { version: "2004", api: win.API_1484_11 };
  if (win.API) return { version: "1.2", api: win.API };
  return null;
}
function initSCORM() {
  _scorm = findAPI(window);
  if (!_scorm) return false;
  if (_scorm.version === "1.2") _scorm.api.LMSInitialize("");
  else _scorm.api.Initialize("");
  return true;
}
function scormSet(key, value) {
  if (!_scorm) return;
  if (_scorm.version === "1.2") _scorm.api.LMSSetValue(key, value);
  else _scorm.api.SetValue(key, value);
}
function scormGet(key) {
  if (!_scorm) return "";
  if (_scorm.version === "1.2") return _scorm.api.LMSGetValue(key);
  return _scorm.api.GetValue(key);
}
function scormCommit() {
  if (!_scorm) return;
  if (_scorm.version === "1.2") _scorm.api.LMSSave("");
  else _scorm.api.Commit("");
}
function scormFinish(status) {
  if (!_scorm) return;
  if (_scorm.version === "1.2") {
    _scorm.api.LMSSetValue("cmi.core.lesson_status", status);
    _scorm.api.LMSFinish("");
  } else {
    _scorm.api.SetValue("cmi.completion_status", "completed");
    _scorm.api.SetValue("cmi.success_status", status === "passed" ? "passed" : "failed");
    _scorm.api.Terminate("");
  }
}
var _startTime = Date.now();
var _idCounter = 0;
function getSessionTime(version) {
  var secs = Math.round((Date.now() - _startTime) / 1000);
  var h = Math.floor(secs / 3600);
  var m = Math.floor((secs % 3600) / 60);
  var s = secs % 60;
  if (version === "1.2") {
    // SCORM 1.2 requires CMITimespan: HH:MM:SS.SS
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s) + ".00";
  }
  // SCORM 2004: ISO 8601 duration PT##H##M##SS
  return "PT" + (h ? h + "H" : "") + (m ? m + "M" : "") + s + "S";
}
function pad2(n) { return n < 10 ? "0" + n : "" + n; }
window.addEventListener("load", function() { initSCORM(); });
window.addEventListener("beforeunload", function() {
  if (_scorm) {
    try {
      scormSet(
        _scorm.version === "1.2" ? "cmi.core.session_time" : "cmi.session_time",
        getSessionTime(_scorm.version)
      );
      scormCommit();
    } catch(e) {}
  }
});
`;

const QUIZ_ENGINE_JS = `
function kcAnswer(qid, chosen, correct) {
  var container = document.getElementById(qid);
  var fb = document.getElementById(qid + "_fb");
  var btns = container.querySelectorAll(".mc-option");
  btns.forEach(function(b) { b.disabled = true; });
  if (chosen === correct) {
    btns[chosen].style.background = "#22c55e22";
    btns[chosen].style.borderColor = "#22c55e";
    if (fb) { fb.textContent = "Correct!"; fb.style.color = "#16a34a"; fb.style.display = "block"; }
  } else {
    btns[chosen].style.background = "#ef444422";
    btns[chosen].style.borderColor = "#ef4444";
    if (btns[correct]) { btns[correct].style.background = "#22c55e22"; btns[correct].style.borderColor = "#22c55e"; }
    if (fb) { fb.textContent = "Incorrect."; fb.style.color = "#dc2626"; fb.style.display = "block"; }
  }
}
function flipCard(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle("flipped");
}
function branchChoice(targetLabel) {
  alert("Navigating to: " + (targetLabel || "next module"));
}
function nextModule() { history.forward(); }
function prevModule() { history.back(); }
function submitQuiz(qid, answers, feedbacks, points) {
  var container = document.getElementById(qid);
  var totalPts = parseFloat(container.dataset.totalPts) || 1;
  var passThreshold = parseFloat(container.dataset.pass) || 80;
  var earned = 0;
  answers.forEach(function(a, qi) {
    var qqid = qid + "_q" + qi;
    var fb = document.getElementById(qqid + "_fb");
    var correct = false;
    if (a.type === "mcq") {
      var selected = container.querySelector('input[name="' + qqid + '"]:checked');
      correct = selected && parseInt(selected.value) === a.correct;
    } else if (a.type === "tf") {
      var sel = container.querySelector('input[name="' + qqid + '"]:checked');
      correct = sel && sel.value === a.correct;
    } else if (a.type === "fitb") {
      var inp = document.getElementById(qqid + "_text");
      correct = inp && a.accepted.indexOf(inp.value.trim().toLowerCase()) !== -1;
    }
    if (correct) earned += points[qi] || 1;
    if (fb) {
      fb.textContent = correct ? feedbacks[qi].correct : feedbacks[qi].incorrect;
      fb.style.color = correct ? "#16a34a" : "#dc2626";
      fb.style.display = "block";
    }
  });
  var rawScore = totalPts ? Math.round((earned / totalPts) * 100) : 0;
  var passed = rawScore >= passThreshold;
  var resultEl = document.getElementById(qid + "_result");
  if (resultEl) {
    resultEl.style.display = "block";
    resultEl.innerHTML = "<strong>Score: " + rawScore + "%</strong> &mdash; " + (passed ? "✅ Passed" : "❌ Failed");
    resultEl.style.color = passed ? "#16a34a" : "#dc2626";
  }
  var submitBtn = container.querySelector(".btn-submit-quiz");
  if (submitBtn) submitBtn.disabled = true;
  // Report to SCORM
  if (_scorm) {
    var scaledScore = (earned / (totalPts || 1)).toFixed(4);
    scormSet(_scorm.version === "1.2" ? "cmi.core.score.raw" : "cmi.score.raw", rawScore);
    scormSet(_scorm.version === "1.2" ? "cmi.core.score.scaled" : "cmi.score.scaled", scaledScore);
    scormFinish(passed ? "passed" : "failed");
  }
}
var _catSelected = null;
function catPillClick(cid, itemId) {
  _catSelected = itemId;
  var pills = document.querySelectorAll('#' + cid + '_pool .cat-pill');
  pills.forEach(function(p) { p.classList.remove('cat-pill-selected'); });
  var pill = document.getElementById(cid + '_pill_' + itemId);
  if (pill) pill.classList.add('cat-pill-selected');
}
function catZoneClick(cid, catId) {
  if (!_catSelected) return;
  var pill = document.getElementById(cid + '_pill_' + _catSelected);
  if (pill) {
    var zone = document.getElementById(cid + '_zone_' + catId);
    if (zone) zone.appendChild(pill);
    pill.classList.remove('cat-pill-selected');
    pill.setAttribute('data-assigned', catId);
  }
  _catSelected = null;
}
function submitCategorization(cid, correctMap) {
  var container = document.getElementById(cid);
  var total = Object.keys(correctMap).length;
  var correct = 0;
  Object.keys(correctMap).forEach(function(itemId) {
    var correctCat = correctMap[itemId];
    var assignedCat = null;
    // checklist mode
    var radios = container.querySelectorAll('input[name="' + cid + '_' + itemId + '"]');
    if (radios.length > 0) {
      radios.forEach(function(r) { if(r.checked) assignedCat = r.value; r.disabled = true; });
    } else {
      // drag-drop mode
      var pill = document.getElementById(cid + '_pill_' + itemId);
      if (pill) assignedCat = pill.getAttribute('data-assigned');
    }
    var row = document.getElementById(cid + '_row_' + itemId);
    if (assignedCat === correctCat) {
      correct++;
      if (row) row.style.background = '#dcfce7';
    } else {
      if (row) row.style.background = '#fee2e2';
    }
  });
  var pct = total ? Math.round(correct / total * 100) : 0;
  var resultEl = document.getElementById(cid + '_result');
  if (resultEl) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<strong>' + correct + '/' + total + ' correct (' + pct + '%)</strong>';
    resultEl.style.color = pct >= 80 ? '#16a34a' : '#dc2626';
  }
  var btn = container.querySelector('.btn-submit-cat');
  if (btn) btn.disabled = true;
  if (_scorm) {
    scormSet(_scorm.version === '1.2' ? 'cmi.core.score.raw' : 'cmi.score.raw', pct);
    scormFinish(pct >= 80 ? 'passed' : 'failed');
  }
}
`;

const SCORM_CSS = `
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #fafafa; color: #1a1a1a; overflow-x: hidden; }
.sco-wrapper { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem; }

/* Elegant Staggered Animations */
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.sco-wrapper > * {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.sco-wrapper > *:nth-child(1) { animation-delay: 0.1s; }
.sco-wrapper > *:nth-child(2) { animation-delay: 0.15s; }
.sco-wrapper > *:nth-child(3) { animation-delay: 0.2s; }
.sco-wrapper > *:nth-child(4) { animation-delay: 0.25s; }
.sco-wrapper > *:nth-child(5) { animation-delay: 0.3s; }
.sco-wrapper > *:nth-child(n+6) { animation-delay: 0.35s; }

h1,h2,h3,h4,h5,h6 { margin: 1.25rem 0 0.5rem; line-height: 1.3; }
h1 { font-size: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
p { line-height: 1.7; margin: 0.75rem 0; }
a { color: #2563eb; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em; }
blockquote { border-left: 4px solid #6b7280; margin-left: 0; padding-left: 1rem; color: #4b5563; }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
th, td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; }
th { background: #f3f4f6; font-weight: 600; }
img { max-width: 100%; height: auto; border-radius: 4px; }
hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
/* eLearning elements */
.learning-objectives { background: #ecfdf5; border-left: 4px solid #22c55e; padding: 1rem; border-radius: 0 6px 6px 0; margin: 1rem 0; }
.learning-objectives ul { margin: 0.5rem 0 0; padding-left: 1.5rem; }
.progress-marker { display: flex; align-items: center; justify-content: center; margin: 1.5rem 0; }
.progress-marker span { background: #fff7ed; border: 1px solid #fb923c; border-radius: 20px; padding: 0.25rem 1rem; font-size: 0.875rem; color: #c2410c; }
.course-nav { display: flex; justify-content: space-between; margin: 2rem 0; gap: 1rem; }
.btn-prev, .btn-next { padding: 0.5rem 1.25rem; border-radius: 6px; border: 1px solid #d1d5db; cursor: pointer; font-size: 0.875rem; background: #fff; transition: transform 0.15s, background 0.15s, box-shadow 0.15s; }
.btn-next { background: #2563eb; color: #fff; border-color: #2563eb; transform-origin: center; }
.btn-next:hover { background: #1d4ed8; transform: scale(1.03); box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4); }
.btn-prev:hover { background: #f3f4f6; transform: translateX(-2px); }
/* Quiz */
.quiz-block { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
.quiz-title { font-size: 1.125rem; margin-bottom: 1rem; }
.quiz-question { margin-bottom: 1.5rem; }
.q-prompt { font-weight: 500; margin-bottom: 0.75rem; }
.q-inputs { display: flex; flex-direction: column; gap: 0.5rem; }
.mc-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; }
.mc-label:hover { background: #f8fafc; }
.fitb-input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; }
.q-feedback { margin-top: 0.5rem; font-size: 0.875rem; font-weight: 500; }
.btn-submit-quiz { background: #7c3aed; color: #fff; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; transition: transform 0.15s, background 0.15s; }
.btn-submit-quiz:hover:not(:disabled) { background: #6d28d9; transform: translateY(-1px); }
.btn-submit-quiz:disabled { background: #a78bfa; cursor: default; }

.quiz-result { margin-top: 1rem; font-size: 1rem; }
/* Knowledge check */
.knowledge-check { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
.kc-prompt { font-weight: 500; margin-bottom: 0.75rem; }
.mc-options { display: flex; flex-direction: column; gap: 0.5rem; }
.mc-option { background: #fff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 0.5rem 0.75rem; cursor: pointer; text-align: left; font-size: 0.875rem; transition: transform 0.15s, background 0.15s, border-color 0.15s; }
.mc-option:hover { background: #f8fafc; border-color: #3b82f6; transform: translateX(4px); }
.mc-option:hover:not(:disabled) { background: #dbeafe; }
.kc-feedback { margin-top: 0.5rem; font-size: 0.875rem; font-weight: 500; }
/* Flashcard */
.flashcard { perspective: 800px; cursor: pointer; margin: 1rem 0; }
.flashcard-inner { position: relative; width: 100%; min-height: 120px; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
.flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
.flashcard:hover:not(.flipped) .flashcard-inner { transform: scale(1.02); }
.flashcard-front, .flashcard-back { position: absolute; width: 100%; min-height: 120px; backface-visibility: hidden; background: #fff; border: 2px solid #fbbf24; border-radius: 8px; padding: 1.5rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.flashcard-back { transform: rotateY(180deg); background: #fffbeb; }
.flashcard-hint { text-align: center; font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
/* Branching */
.branching { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
.branching-prompt { font-weight: 500; margin-bottom: 1rem; }
.branch-choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
.branch-btn { background: #fff; border: 2px solid #818cf8; border-radius: 8px; padding: 0.75rem 1rem; cursor: pointer; font-size: 0.875rem; text-align: left; transition: transform 0.15s, background 0.15s, box-shadow 0.15s; }
.branch-btn:hover { background: #e0e7ff; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
/* Time Requirement */
.time-requirement { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem 1.5rem; margin: 1.5rem 0; }
.tr-header { font-weight: 600; color: #1d4ed8; margin-bottom: 0.75rem; }
.tr-message { margin: 0 0 0.75rem; }
.tr-progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: #6b7280; margin-bottom: 0.25rem; }
.tr-progress-bar { height: 8px; background: #dbeafe; border-radius: 4px; overflow: hidden; }
.tr-progress-fill { height: 100%; background: #3b82f6; transition: width 0.5s; }
.tr-complete { color: #15803d; font-weight: 500; }
/* Categorization */
.categorization { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
.cat-prompt { font-weight: 500; margin-bottom: 1rem; }
.cat-table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
.cat-item-header, .cat-col-header { padding: 0.5rem 0.75rem; border-bottom: 2px solid #e5e7eb; text-align: center; font-weight: 600; }
.cat-item-header { text-align: left; }
.cat-item-cell { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
.cat-radio-cell { text-align: center; padding: 0.5rem; border-bottom: 1px solid #f3f4f6; }
.cat-zones { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
.cat-zone { border: 2px dashed #d1d5db; border-radius: 8px; padding: 0.75rem; min-height: 80px; cursor: pointer; }
.cat-zone-title { font-size: 0.875rem; font-weight: 600; margin: 0 0 0.5rem; }
.cat-pool { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.cat-pill { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 16px; padding: 0.375rem 0.875rem; font-size: 0.8125rem; cursor: pointer; transition: background 0.15s; }
.cat-pill:hover { background: #e5e7eb; }
.cat-pill-selected { background: #dbeafe; border-color: #3b82f6; }
.btn-submit-cat { background: #7c3aed; color: #fff; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; margin-top: 0.5rem; }
.btn-submit-cat:hover { background: #6d28d9; }
.btn-submit-cat:disabled { background: #a78bfa; cursor: default; }
.cat-result { margin-top: 0.75rem; font-size: 0.9375rem; }
/* Slide navigation bar */
.slide-nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1.5rem; background: #f8fafc; border-top: 1px solid #e5e7eb; }
.slide-nav-bar.nav-top { border-top: none; border-bottom: 1px solid #e5e7eb; }
.nav-bar-btn { background: #fff; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.375rem 0.875rem; cursor: pointer; font-size: 0.875rem; color: #374151; text-decoration: none; display: inline-block; }
.nav-bar-btn:hover { background: #f3f4f6; }
.nav-bar-btn[aria-disabled="true"] { opacity: 0.35; pointer-events: none; }
.nav-bar-indicator { font-size: 0.8125rem; color: #6b7280; }
.sco-outer { display: flex; flex-direction: column; min-height: 100vh; }
.sco-outer .sco-wrapper { flex: 1; }
`;

function buildNavBarHtml(moduleIndex, totalModules, position) {
  const isFirst = moduleIndex === 0;
  const isLast = moduleIndex === totalModules - 1;
  const prevHref = isFirst ? "#" : `../module_${moduleIndex}/index.html`;
  const nextHref = isLast ? "#" : `../module_${moduleIndex + 2}/index.html`;
  const posClass = position === "top" ? "nav-top" : "";
  return `<nav class="slide-nav-bar ${posClass}" aria-label="Course navigation">
  <a href="${prevHref}" class="nav-bar-btn"${isFirst ? ` aria-disabled="true"` : ""}>&larr; Previous</a>
  <span class="nav-bar-indicator">${moduleIndex + 1} / ${totalModules}</span>
  <a href="${nextHref}" class="nav-bar-btn"${isLast ? ` aria-disabled="true"` : ""}>Next &rarr;</a>
</nav>`;
}

function buildScoHtml(module, courseTitle, cssOverride = "", navBarOptions = null) {
  const blocks = (() => {
    try {
      return JSON.parse(module.blocks_json || "[]");
    } catch {
      return [];
    }
  })();

  const bodyHtml = blocks.map((b) => blockToHtml(b)).join("\n");

  const navEnabled = navBarOptions && navBarOptions.position && navBarOptions.position !== "none";
  const navHtml = navEnabled
    ? buildNavBarHtml(navBarOptions.moduleIndex, navBarOptions.totalModules, navBarOptions.position)
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escHtml(module.title || "Module")} — ${escHtml(courseTitle || "Course")}</title>
<style>
${SCORM_CSS}
${cssOverride}
</style>
</head>
<body>
${navEnabled ? '<div class="sco-outer">' : ""}
${navEnabled && navBarOptions.position === "top" ? navHtml : ""}
<div class="sco-wrapper">
${bodyHtml}
</div>
${navEnabled && navBarOptions.position === "bottom" ? navHtml : ""}
${navEnabled ? "</div>" : ""}
<script>
${SCORM_RUNTIME_SHIM}
${QUIZ_ENGINE_JS}
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// SCORM 1.2 manifest
// ---------------------------------------------------------------------------

function generateManifest12(course, modules) {
  const identifier = `MARKDROP_${(course.id || "course").replace(/-/g, "").slice(0, 16)}`;
  const orgId = `${identifier}_ORG`;

  const items = modules
    .map((m, i) => {
      const resId = `res_${i + 1}`;
      return `      <item identifier="item_${i + 1}" identifierref="${resId}">
        <title>${escHtml(m.title || `Module ${i + 1}`)}</title>
      </item>`;
    })
    .join("\n");

  const resources = modules
    .map((m, i) => {
      const resId = `res_${i + 1}`;
      const href = `module_${i + 1}/index.html`;
      return `    <resource identifier="${resId}" type="webcontent" adlcp:scormtype="sco" href="${href}">
      <file href="${href}"/>
    </resource>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="${orgId}">
    <organization identifier="${orgId}">
      <title>${escHtml(course.title || "Course")}</title>
${items}
    </organization>
  </organizations>
  <resources>
${resources}
  </resources>
</manifest>`;
}

// ---------------------------------------------------------------------------
// SCORM 2004 4th Edition manifest
// ---------------------------------------------------------------------------

function generateManifest2004(course, modules) {
  const identifier = `MARKDROP_${(course.id || "course").replace(/-/g, "").slice(0, 16)}`;
  const orgId = `${identifier}_ORG`;

  const items = modules
    .map((m, i) => {
      const resId = `res_${i + 1}`;
      return `      <item identifier="item_${i + 1}" identifierref="${resId}">
        <title>${escHtml(m.title || `Module ${i + 1}`)}</title>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true"/>
        </imsss:sequencing>
      </item>`;
    })
    .join("\n");

  const resources = modules
    .map((m, i) => {
      const resId = `res_${i + 1}`;
      const href = `module_${i + 1}/index.html`;
      return `    <resource identifier="${resId}" type="webcontent" adlcp:scormType="sco" href="${href}">
      <file href="${href}"/>
    </resource>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" version="1"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                      http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                      http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="${orgId}">
    <organization identifier="${orgId}" adlseq:objectivesGlobalToSystem="false">
      <title>${escHtml(course.title || "Course")}</title>
${items}
    </organization>
  </organizations>
  <resources>
${resources}
  </resources>
</manifest>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate and download a SCORM 1.2 package.
 * @param {object} course - course record from Supabase
 * @param {Array}  modules - ordered array of course_modules records
 * @param {object} [options] - export options (e.g. navBar: { position: 'bottom' })
 */
export async function exportToScorm12(course, modules, options = {}) {
  return _buildAndDownload(course, modules, "1.2", options);
}

/**
 * Generate and download a SCORM 2004 4th Edition package.
 * @param {object} [options] - export options (e.g. navBar: { position: 'bottom' })
 */
export async function exportToScorm2004(course, modules, options = {}) {
  return _buildAndDownload(course, modules, "2004", options);
}

async function _buildAndDownload(course, modules, version, options = {}) {
  if (!modules || modules.length === 0) throw new Error("No modules to export");

  const navBarPosition = options.navBar?.position || "none";

  const zip = new JSZip();
  const manifestXml =
    version === "1.2" ? generateManifest12(course, modules) : generateManifest2004(course, modules);

  zip.file("imsmanifest.xml", manifestXml);

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const navBarOptions =
      navBarPosition !== "none"
        ? { position: navBarPosition, moduleIndex: i, totalModules: modules.length }
        : null;
    const html = buildScoHtml(mod, course.title || "Course", "", navBarOptions);
    zip.file(`module_${i + 1}/index.html`, html);
  }

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
  const safeName = (course.title || "course").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  const shortId = (course.id || "").slice(0, 8);
  const filename = `${safeName}${shortId ? `_${shortId}` : ""}_scorm${version.replace(".", "")}_${new Date().toISOString().slice(0, 10)}.zip`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}

/**
 * Build a preview HTML string for a single module (no SCORM API calls).
 * Used by CoursePreview component.
 */
export function buildPreviewHtml(module, courseTitle) {
  return buildScoHtml(module, courseTitle || "Preview");
}

// ---------------------------------------------------------------------------
// Test-only exports (prefixed with _ to signal internal use)
// ---------------------------------------------------------------------------
export {
  escHtml as _escHtml,
  blockToHtml as _blockToHtml,
  generateManifest12 as _generateManifest12,
  generateManifest2004 as _generateManifest2004,
};
