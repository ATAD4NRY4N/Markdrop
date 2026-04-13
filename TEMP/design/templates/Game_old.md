---
no_theme: true
---

<!--marp
theme: gaia
_class: lead
paginate: true
backgroundColor: #fff
-->

# Ataccama Knowledge Quest: Journey to Ataccama Prime

---

<!-- _class: default -->

## Embark on Your Cosmic Odyssey!

Navigate through the Ataccama Solar System, where each sector holds valuable knowledge. Your spaceship (🚀) must reach the distant planet Ataccama Prime (🪐) by conquering data challenges. But beware - failed attempts create space junk (🪨) that blocks entire regions!

**Your Mission:** Answer questions correctly to unlock safe paths. Wrong answers 3 times block sectors permanently. Strategic navigation is key!

---

<!-- _class: default -->

<style>

  :root {
    --AtaElectricPink: rgb(241, 0, 144);
    --AtaElectricPurple: rgb(106, 44, 245);
    --AtaNavy: rgb(26, 12, 66);
    --AtaPlum: rgb(51, 4, 42);
    --AtaWhite: rgb(255, 255, 255);
    --AtaBlack: rgb(0, 0, 0);
    --AtaElectricPink90: rgb(243, 28, 156);
    --AtaElectricPink80: rgb(244, 57, 169);
    --AtaElectricPink70: rgb(246, 51, 181);
    --AtaElectricPink60: rgb(247, 113, 193);
    --AtaElectricPink50: rgb(249, 142, 206);
    --AtaElectricPink40: rgb(250, 170, 218);
    --AtaElectricPink30: rgb(252, 198, 230);
    --AtaElectricPink20: rgb(253, 227, 243);
    --AtaElectricPink10: rgb(254, 241, 249);
    --AtaElectricPurple90: rgb(123, 67, 246);
    --AtaElectricPurple80: rgb(139, 91, 247);
    --AtaElectricPurple70: rgb(156, 114, 248);
    --AtaElectricPurple60: rgb(172, 138, 249);
    --AtaElectricPurple50: rgb(189, 161, 251);
    --AtaElectricPurple40: rgb(205, 185, 252);
    --AtaElectricPurple30: rgb(222, 208, 253);
    --AtaElectricPurple20: rgb(238, 232, 254);
    --AtaElectricPurple10: rgb(247, 243, 255);
    --AtaNavy90: rgb(51, 39, 87);
    --AtaNavy80: rgb(77, 66, 108);
    --AtaNavy70: rgb(102, 93, 129);
    --AtaNavy60: rgb(128, 120, 150);
    --AtaNavy50: rgb(153, 147, 171);
    --AtaNavy40: rgb(179, 174, 192);
    --AtaNavy30: rgb(204, 201, 213);
    --AtaNavy20: rgb(221, 219, 227);
    --AtaNavy10: rgb(238, 237, 241);
    --AtaPlum90: rgb(74, 29, 66);
    --AtaPlum80: rgb(86, 57, 89);
    --AtaPlum70: rgb(119, 86, 113);
    --AtaPlum60: rgb(142, 114, 137);
    --AtaPlum50: rgb(164, 142, 160);
    --AtaPlum40: rgb(187, 170, 184);
    --AtaPlum30: rgb(210, 199, 208);
    --AtaPlum20: rgb(225, 218, 224);
    --AtaPlum10: rgb(240, 236, 239);
    --AtaBlack90: rgb(28, 28, 28);
    --AtaBlack80: rgb(57, 57, 57);
    --AtaBlack70: rgb(85, 85, 85);
    --AtaBlack60: rgb(113, 113, 113);
    --AtaBlack50: rgb(142, 142, 142);
    --AtaBlack40: rgb(170, 170, 170);
    --AtaBlack30: rgb(198, 198, 198);
    --AtaBlack20: rgb(227, 227, 227);
    --AtaBlack10: rgb(240, 240, 240);
    --AtaGreen: rgb(0, 245, 200);
    --AtaGreen80: rgb(51, 247, 211);
    --AtaGreen60: rgb(102, 249, 222);
    --AtaGreen40: rgb(153, 251, 233);
    --AtaGreen20: rgb(204, 253, 244);
    --AtaRed: rgb(247, 82, 80);
    --AtaRed80: rgb(249, 117, 115);
    --AtaRed60: rgb(250, 151, 150);
    --AtaRed40: rgb(252, 186, 185);
    --AtaRed20: rgb(253, 220, 220);
    --AtaBlue: rgb(51, 161, 253);
    --AtaBlue80: rgb(92, 180, 253);
    --AtaBlue60: rgb(133, 199, 254);
    --AtaBlue40: rgb(173, 217, 254);
    --AtaBlue20: rgb(214, 236, 255);
    --AtaYellow: rgb(253, 202, 64);
    --AtaYellow80: rgb(253, 213, 102);
    --AtaYellow60: rgb(254, 223, 140);
    --AtaYellow40: rgb(254, 234, 179);
    --AtaYellow20: rgb(255, 244, 217);
  }
  
  /* Reduce section padding for more space */
  section {
    padding: 40px 30px !important;
  }

  /* Layout for game board and level tracker */
  .game-layout {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 98%;
    max-width: 1600px;
    margin: 0 auto;
    gap: 12px;
  }

  .container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 8px;
    width: 65%;
    max-width: 800px;
    height: 75vh;
    max-height: 600px;
    background: radial-gradient(ellipse at center, #1a0c42 0%, #000 100%);
    padding: 12px;
    border: 2px solid #6a2cf5;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(106, 44, 245, 0.5);
    transition: background 0.5s ease;
  }
  
  /* Level Progress Tracker */
  .level-tracker {
    width: 30%;
    max-width: 380px;
    background: linear-gradient(180deg, #1a0c42 0%, #000 100%);
    padding: 10px;
    border: 2px solid #6a2cf5;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(106, 44, 245, 0.5);
    height: 75vh;
    max-height: 600px;
    overflow-y: auto;
  }
  
  .level-tracker h3 {
    color: #00f5c8;
    text-align: center;
    margin: 0 0 8px 0;
    font-size: 1em;
    padding-bottom: 6px;
    border-bottom: 2px solid #6a2cf5;
  }
  
  .level-item {
    display: flex;
    align-items: center;
    margin: 5px 0;
    padding: 6px 8px;
    background: rgba(106, 44, 245, 0.1);
    border: 2px solid #6a2cf5;
    border-radius: 5px;
    transition: all 0.3s ease;
    font-size: 0.75em;
  }
  
  .level-item.completed {
    background: rgba(0, 245, 200, 0.2);
    border-color: #00f5c8;
  }
  
  .level-item.current {
    background: rgba(241, 0, 144, 0.3);
    border-color: #f10094;
    box-shadow: 0 0 10px rgba(241, 0, 144, 0.5);
  }
  
  .level-item.locked {
    opacity: 0.4;
  }
  
  .level-icon {
    font-size: 1.3em;
    margin-right: 8px;
    min-width: 25px;
    text-align: center;
  }
  
  .level-info {
    flex: 1;
    color: #fff;
  }
  
  .level-name {
    font-weight: bold;
    font-size: 0.85em;
    margin-bottom: 2px;
  }
  
  .level-status {
    font-size: 0.7em;
    color: #ccc;
  }
  .pod {
    border: 2px solid #6a2cf5;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5vw;
    cursor: not-allowed;
    transition: background-color 0.3s ease, transform 0.2s ease, border-color 0.3s ease;
    background-color: transparent;
    width: 100%;
    height: 100%;
    min-height: 45px;
  }
  .pod.invisible {
    opacity: 0;
  }
  .pod:hover {
    background-color: #ccc;
  }
  .pod.adjacent {
    cursor: pointer;
    border-color: #f10094;
    border-width: 3px;
    box-shadow: 0 0 10px #f10094;
  }
  .pod.adjacent:hover {
    transform: scale(1.08);
    box-shadow: 0 0 12px #f10094;
  }
  .pod.player {
    background-color: #f10094;
    color: #fff;
    font-size: 2.2vw;
    box-shadow: 0 0 12px #f10094;
    border-color: #f10094;
  }
  .pod.start {
    background-color: #00f5c8;
    color: #fff;
    font-size: 2.2vw;
    cursor: not-allowed;
    border-color: #00f5c8;
    box-shadow: 0 0 12px #00f5c8;
  }
  .pod.goal {
    background-color: #6a2cf5;
    color: #fff;
    font-size: 2.2vw;
    box-shadow: 0 0 12px #6a2cf5;
    border-color: #6a2cf5;
  }
  .pod.unlocked {
    background-color: #00f5c8;
    color: #000;
    font-size: 1.5vw;
    border-color: #00f5c8;
  }
  .pod.blocked {
    background-color: #000;
    border-color: #f75250;
    color: #fff;
    cursor: not-allowed;
    font-size: 2vw;
    box-shadow: 0 0 10px #f75250;
  }
  .modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(26, 12, 66, 0.8);
  }
  .modal-content {
    background-color: #fff;
    margin: 8% auto;
    padding: 12px 18px;
    border: 1px solid #1a0c42;
    width: 90%;
    max-width: 1000px;
    border-radius: 8px;
    max-height: 80vh;
    overflow-y: auto;
  }
  .close {
    color: #000;
    float: right;
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
  }
  .close:hover,
  .close:focus {
    color: #f10094;
    text-decoration: none;
    cursor: pointer;
  }
  .question {
    color: #1a0c42;
    font-size: 0.95em;
    margin-bottom: 10px;
    line-height: 1.3;
    clear: both;
    padding-top: 5px;
  }
  
  /* Visual attempts tracker */
  .attempts-tracker {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
    padding: 8px;
    background: rgba(106, 44, 245, 0.1);
    border-radius: 6px;
  }
  
  .attempts-tracker-label {
    font-size: 0.85em;
    color: #1a0c42;
    font-weight: bold;
    margin-right: 5px;
  }
  
  .attempt-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
    transition: all 0.3s ease;
  }
  
  .attempt-indicator.available {
    background: #00f5c8;
    border: 2px solid #00f5c8;
    color: #fff;
    box-shadow: 0 0 5px rgba(0, 245, 200, 0.5);
  }
  
  .attempt-indicator.used {
    background: #f75250;
    border: 2px solid #f75250;
    color: #fff;
    box-shadow: 0 0 5px rgba(247, 82, 80, 0.5);
  }
  
  .attempt-indicator.unlimited {
    background: #ff9800;
    border: 2px solid #ff9800;
    color: #fff;
    box-shadow: 0 0 5px rgba(255, 152, 0, 0.5);
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  
  .answer-btn {
    background-color: #8c6ff7;
    border: 1px solid var(--AtaElectricPurple);
    padding: 7px 10px;
    margin: 4px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    font-size: 0.85em;
    line-height: 1.2;
  }
  .answer-btn:hover {
    background-color: #8c6ff7;
  }
  .progress {
    margin-top: 12px;
    text-align: center;
    color: #1a0c42;
    font-size: 0.8em;
  }
  
  /* Feedback message styling */
  .feedback-message {
    margin-top: 10px;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 0.85em;
    line-height: 1.2;
    text-align: center;
    font-weight: bold;
  }
  .audio-controls {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(26, 12, 66, 0.9);
    padding: 10px;
    border-radius: 8px;
    border: 2px solid #6a2cf5;
    box-shadow: 0 0 12px rgba(106, 44, 245, 0.5);
    z-index: 1000;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-width: auto;
  }
  .audio-controls .volume-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .audio-controls button {
    background-color: #6a2cf5;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
  }
  .audio-controls button:hover {
    background-color: #f10094;
  }
  .audio-controls button.muted {
    background-color: #f75250;
  }
  .audio-controls input[type="range"] {
    width: 80px;
  }
  .audio-controls label {
    color: #fff;
    font-size: 10px;
    text-align: center;
  }
  @keyframes confetti-fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  .confetti {
    position: fixed;
    width: 10px;
    height: 10px;
    background-color: #f10094;
    animation: confetti-fall 3s linear forwards;
    z-index: 9999;
  }
</style>

<div class="audio-controls">
  <div class="volume-container">
    <label for="volumeSlider">Volume</label>
    <input type="range" id="volumeSlider" min="0" max="100" value="0">
  </div>
  <button id="muteBtn" class="muted">🔇 Unmute</button>
</div>

<div class="game-layout">
  <div class="container" id="game-board">
    <p style="color: #000; font-size: 20px; font-weight: bold;">Game board loading...</p>
    <p style="color: #f00; font-size: 16px;">If you see this, the HTML is rendering but JavaScript hasn't run yet.</p>
  </div>
  
  <div class="level-tracker">
    <h3>🌌 Level Progress</h3>
    <div id="level-list"></div>
  </div>
</div>

<div id="quiz-modal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2 class="question" id="question"></h2>
    <div id="attempts-tracker" class="attempts-tracker"></div>
    <div id="answers"></div>
    <div class="progress" id="progress">Progress: 0/10</div>
  </div>
</div>

<!-- LESSON AUTHOR: Place .gift files in the same folder as Game.md -->
<!-- The game will auto-discover all .gift files and create levels -->
<!-- Level names are derived from filenames: "162DG01-Business_Glossary.gift" becomes "Business Glossary" -->
<script>
  // Auto-discovery configuration - no need to manually list files!
  window.GAME_AUTO_DISCOVER = true;
</script>

<script>
(function() {
  console.log('Script starting...');
  
  // ===== SCORM INTEGRATION & MOCK API =====
  // Mock SCORM API for local testing
  const mockScormAPI = {
    LMSInitialize: () => 'true',
    LMSFinish: () => 'true',
    LMSGetValue: (key) => {
      const mockData = {
        'cmi.core.student_id': 'student-demo-12345',
        'cmi.core.student_name': 'Demo, Student'
      };
      return mockData[key] || '';
    },
    LMSSetValue: (key, value) => 'true',
    LMSCommit: () => 'true',
    LMSGetLastError: () => '0',
    LMSGetErrorString: () => '',
    LMSGetDiagnostic: () => ''
  };

  // Detect SCORM API or use mock
  let scormAPI = null;
  if (window.API) {
    scormAPI = window.API;
    console.log('✅ SCORM API detected (LMS mode)');
  } else if (window.parent && window.parent.API) {
    scormAPI = window.parent.API;
    console.log('✅ SCORM API detected in parent (LMS mode)');
  } else {
    scormAPI = mockScormAPI;
    console.log('⚠️ No SCORM API found - using mock for local testing');
  }

  // Initialize SCORM
  if (window.SCORM) {
    window.SCORM.init();
  } else {
    scormAPI.LMSInitialize('');
  }

  // Get learner info using SCORM wrapper convenience methods
  const learnerId = window.SCORM ? window.SCORM.studentId() : scormAPI.LMSGetValue('cmi.core.student_id');
  const learnerName = window.SCORM ? window.SCORM.studentName() : scormAPI.LMSGetValue('cmi.core.student_name');
  console.log(`👤 Learner: ${learnerName} (ID: ${learnerId})`);
  
  // Log SCORM values for debugging
  console.log('SCORM cmi.core.student_id:', learnerId);
  console.log('SCORM cmi.core.student_name:', learnerName);

  // ===== METRICS CODE GENERATION =====
  const COURSE_PEPPER = 'scorm-ataccama-space-game-2025-q4';
  
  // Store metrics for all completed levels
  let allLevelMetrics = [];

  /**
   * SHA-256 hash function for browser
   */
  async function sha256(str) {
    const textBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate verifiable metrics code
   */
  async function generateMetricsCode(gameData, learnerId) {
    try {
      // 1. Convert metrics to JSON string
      const jsonPayload = JSON.stringify(gameData);
      
      // 2. Encode to Base64
      const base64Payload = btoa(jsonPayload);
      
      // 3. Create signature
      const dataToSign = `${learnerId}:${base64Payload}:${COURSE_PEPPER}`;
      const hash = await sha256(dataToSign);
      const signature = hash.substring(0, 8);
      
      // 4. Assemble final code
      const finalCode = `${base64Payload}.${signature}`;
      
      console.log('🔐 Metrics code generated successfully');
      return finalCode;
    } catch (error) {
      console.error('❌ Failed to generate metrics code:', error);
      return null;
    }
  }

  /**
   * Save current level metrics to the collection
   */
  function saveLevelMetrics(levelIndex, levelName, stats) {
    const levelMetrics = {
      level: levelIndex + 1,
      levelName: levelName,
      timeTaken: stats.timeTaken,
      totalAttempts: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      sectorsExplored: stats.sectorsExplored,
      spaceJunkCreated: stats.spaceJunkCreated,
      successRate: stats.successRate,
      timestamp: new Date().toISOString()
    };
    
    allLevelMetrics.push(levelMetrics);
    console.log(`📊 Saved metrics for Level ${levelIndex + 1}: "${levelName}"`);
  }
  
  // ===== GAME BACKGROUNDS =====
  // 30 unique space-themed backgrounds for levels
  const LEVEL_BACKGROUNDS = [
    'radial-gradient(ellipse at center, #1a0c42 0%, #000 100%)', // Deep space
    'radial-gradient(ellipse at center, #2a1a52 0%, #000 100%)', // Purple nebula
    'radial-gradient(ellipse at center, #421a52 0%, #0a0a0a 100%)', // Violet void
    'radial-gradient(ellipse at center, #1a2a52 0%, #000 100%)', // Blue giant
    'radial-gradient(ellipse at center, #521a42 0%, #000 100%)', // Magenta mist
    'radial-gradient(ellipse at center, #1a4252 0%, #000 100%)', // Cyan cosmos
    'radial-gradient(ellipse at center, #42521a 0%, #0a0a00 100%)', // Green galaxy
    'radial-gradient(ellipse at center, #52421a 0%, #0a0500 100%)', // Amber asteroid
    'radial-gradient(ellipse at center, #521a1a 0%, #000 100%)', // Red giant
    'radial-gradient(ellipse at center, #1a521a 0%, #000 100%)', // Emerald expanse
    'radial-gradient(ellipse at center, #2a2a52 0%, #000 100%)', // Indigo infinity
    'radial-gradient(ellipse at center, #522a2a 0%, #000 100%)', // Crimson cluster
    'radial-gradient(ellipse at center, #2a522a 0%, #000 100%)', // Jade Jupiter
    'radial-gradient(ellipse at center, #52522a 0%, #0a0a00 100%)', // Golden gate
    'radial-gradient(ellipse at center, #2a5252 0%, #000 100%)', // Teal territory
    'radial-gradient(ellipse at center, #522a52 0%, #000 100%)', // Plum planet
    'radial-gradient(ellipse at center, #3a1a52 0%, #000 100%)', // Ultra violet
    'radial-gradient(ellipse at center, #1a3a52 0%, #000 100%)', // Azure abyss
    'radial-gradient(ellipse at center, #521a3a 0%, #000 100%)', // Pink pulsar
    'radial-gradient(ellipse at center, #3a521a 0%, #0a0a00 100%)', // Lime light
    'radial-gradient(ellipse at center, #1a523a 0%, #000 100%)', // Mint meteor
    'radial-gradient(ellipse at center, #523a1a 0%, #0a0500 100%)', // Bronze belt
    'radial-gradient(ellipse at center, #3a3a52 0%, #000 100%)', // Periwinkle periphery
    'radial-gradient(ellipse at center, #523a3a 0%, #000 100%)', // Rust rings
    'radial-gradient(ellipse at center, #3a523a 0%, #000 100%)', // Sage sector
    'radial-gradient(ellipse at center, #52523a 0%, #0a0a00 100%)', // Khaki cluster
    'radial-gradient(ellipse at center, #3a5252 0%, #000 100%)', // Turquoise tide
    'radial-gradient(ellipse at center, #523a52 0%, #000 100%)', // Mauve milky way
    'radial-gradient(ellipse at center, #4a2a52 0%, #000 100%)', // Royal realm
    'radial-gradient(ellipse at center, #524a2a 0%, #0a0500 100%)'  // Ochre orbit
  ];
  
  function getLevelBackground(levelIndex) {
    return LEVEL_BACKGROUNDS[levelIndex % LEVEL_BACKGROUNDS.length];
  }
  
  // Function to derive level name from filename
  function getLevelName(filename) {
    // Remove .gift extension
    let name = filename.replace('.gift', '');
    // Check if there's a prefix before hyphen
    const hyphenIndex = name.indexOf('-');
    if (hyphenIndex > 0) {
      name = name.substring(hyphenIndex + 1);
    }
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    return name;
  }
  
  // GIFT Parser Function (adapted from mcq_script.js)
  function parseGIFT(giftText) {
    const questions = [];
    const blocks = giftText.split(/\n\s*\n/).filter(block => block.trim() !== '');
    console.log(`parseGIFT: Found ${blocks.length} potential question blocks.`);

    blocks.forEach((block, index) => {
      block = block.trim();
      const questionRegex = /^(?:::(.*?)::)?\s*(.*?)\s*\{(.*?)\}(?:####\s*(.*))?/s;
      const match = block.match(questionRegex);

      if (match) {
        const title = match[1] ? match[1].trim() : `Question ${index + 1}`;
        const questionText = match[2].trim();
        const choicesText = match[3];
        const feedback = match[4] ? match[4].trim() : '';

        const choices = [];
        let correctIndex = -1;
        const choiceRegex = /([=~])(?:%(-?\d+(?:\.\d+)?)%)?\s*([^\n]+)/g;
        let choiceMatch;
        let choiceCount = 0;

        while ((choiceMatch = choiceRegex.exec(choicesText)) !== null) {
          const isCorrect = choiceMatch[1] === '=';
          const choiceText = choiceMatch[3].trim();
          
          if (isCorrect) {
            correctIndex = choiceCount;
          }
          
          choices.push(choiceText);
          choiceCount++;
        }

        if (questionText && choices.length > 0 && correctIndex !== -1) {
          questions.push({
            question: questionText,
            answers: choices,
            correct: correctIndex
          });
          console.log(`Parsed question ${index + 1}: "${questionText}" with ${choices.length} choices, correct: ${correctIndex}`);
        } else {
          console.warn(`parseGIFT: Block ${index + 1} incomplete. Text: "${questionText}", Choices: ${choices.length}, Correct: ${correctIndex}`);
        }
      } else {
        console.warn(`parseGIFT: Block ${index + 1} does not match expected format.`);
      }
    });
    
    console.log(`parseGIFT: Returning ${questions.length} successfully parsed questions.`);
    return questions;
  }

  // Function to load questions from GIFT file
  async function loadQuestionsFromGIFT(giftPath) {
    console.log(`Loading questions from GIFT file: ${giftPath}`);
    try {
      const response = await fetch(giftPath);
      if (!response.ok) {
        throw new Error(`Failed to load GIFT file: ${response.statusText}`);
      }
      const giftData = await response.text();
      const parsedQuestions = parseGIFT(giftData);
      
      if (parsedQuestions.length === 0) {
        throw new Error('No valid questions found in GIFT file');
      }
      
      console.log(`Successfully loaded ${parsedQuestions.length} questions from GIFT file`);
      return parsedQuestions;
    } catch (error) {
      console.error('Error loading GIFT file:', error);
      throw error;
    }
  }
  
  // Auto-discover GIFT files in the same folder
  async function discoverGiftFiles() {
    console.log('Auto-discovering GIFT files...');
    let giftFiles = [];
    
    // Get the current page URL to determine the base path
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // Check if there's a GIFT files manifest (preferred method)
    try {
      const manifestResponse = await fetch('gift_manifest.txt');
      if (manifestResponse.ok) {
        const manifestText = await manifestResponse.text();
        giftFiles = manifestText.split('\n')
          .map(f => f.trim())
          .filter(f => f.length > 0 && f.endsWith('.gift') && !f.startsWith('#'));
        console.log(`✅ Found manifest with ${giftFiles.length} GIFT files:`, giftFiles);
        return giftFiles;
      }
    } catch (e) {
      console.log('No manifest found, trying pattern detection...');
    }
    
    // Try common GIFT file patterns
    const testPatterns = [
      '162DG01-Business_Glossary.gift',
      '162DG01-Catalog_Items.gift', 
      '162DG01-Data_Catalog.gift',
      '162DG01-Data_Discovery&Profiling.gift',
      '162DG02-Collaboration.gift',
      '162DG03-Sharing_Users.gift',
      'Game.gift',
      'Game_Level1.gift', 
      'Game_Level2.gift', 
      'Game_Level3.gift'
    ];
    
    // Try to load files matching patterns
    for (const pattern of testPatterns) {
      try {
        const testResponse = await fetch(pattern, { method: 'HEAD' });
        if (testResponse.ok) {
          giftFiles.push(pattern);
          console.log(`✅ Found GIFT file: ${pattern}`);
        }
      } catch (e) {
        // File doesn't exist, skip silently
      }
    }
    
    if (giftFiles.length === 0) {
      // Fallback to single file mode
      const fallbackFile = window.GAME_GIFT_FILE || 'Game.gift';
      console.log(`No GIFT files auto-discovered, using fallback: ${fallbackFile}`);
      return [fallbackFile];
    }
    
    console.log(`Auto-discovered ${giftFiles.length} GIFT files`);
    return giftFiles;
  }
  
  // Shuffle array randomly (Fisher-Yates algorithm)
  function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Load game configuration
  async function loadGameConfig() {
    try {
      const configResponse = await fetch('game_config.json');
      if (configResponse.ok) {
        const config = await configResponse.json();
        console.log('✅ Loaded game configuration:', config);
        return config;
      }
    } catch (error) {
      console.log('⚠️ No game_config.json found, falling back to auto-discovery');
    }
    return null;
  }
  
  // Load all levels from discovered GIFT files or config
  async function loadLevels() {
    // Try to load from config first
    const config = await loadGameConfig();
    
    if (config && config.levels && config.levels.length > 0) {
      // Load levels from config with specified question counts
      console.log(`📋 Loading ${config.levels.length} levels from configuration...`);
      const levels = [];
      
      for (let i = 0; i < config.levels.length; i++) {
        const levelConfig = config.levels[i];
        const filename = levelConfig.giftFile;
        const questionCount = levelConfig.questionCount || 10;
        const levelName = getLevelName(filename);
        
        try {
          const allQuestions = await loadQuestionsFromGIFT(filename);
          
          // Randomly select the specified number of questions
          let selectedQuestions;
          if (allQuestions.length <= questionCount) {
            // If we have fewer questions than requested, use all of them
            selectedQuestions = shuffleArray(allQuestions);
            console.log(`⚠️ Level "${levelName}": Requested ${questionCount} questions but only ${allQuestions.length} available. Using all.`);
          } else {
            // Randomly select the requested number
            const shuffled = shuffleArray(allQuestions);
            selectedQuestions = shuffled.slice(0, questionCount);
            console.log(`✅ Level "${levelName}": Randomly selected ${questionCount} questions from ${allQuestions.length} available`);
          }
          
          levels.push({
            name: levelName,
            filename: filename,
            questions: selectedQuestions,
            totalQuestionsInFile: allQuestions.length,
            completed: false,
            background: getLevelBackground(i)
          });
          console.log(`Level ${i + 1}: "${levelName}" - ${selectedQuestions.length} questions (from ${allQuestions.length} total)`);
        } catch (error) {
          console.error(`❌ Failed to load level from ${filename}:`, error);
        }
      }
      
      return levels;
    }
    
    // Fallback to auto-discovery (original behavior)
    console.log('📁 Using auto-discovery mode (no config)...');
    const giftFiles = await discoverGiftFiles();
    const levels = [];
    
    for (let i = 0; i < giftFiles.length; i++) {
      const filename = giftFiles[i];
      const levelName = getLevelName(filename);
      
      try {
        const questions = await loadQuestionsFromGIFT(filename);
        levels.push({
          name: levelName,
          filename: filename,
          questions: questions,
          totalQuestionsInFile: questions.length,
          completed: false,
          background: getLevelBackground(i)
        });
        console.log(`Level ${i + 1}: "${levelName}" - ${questions.length} questions`);
      } catch (error) {
        console.error(`Failed to load level from ${filename}:`, error);
      }
    }
    
    return levels;
  }
  
  // Render level tracker UI
  function renderLevelTracker(levels, currentLevelIndex) {
    const levelList = document.getElementById('level-list');
    if (!levelList) {
      console.error('❌ Level list element not found!');
      return;
    }
    
    console.log(`🎨 Rendering level tracker: ${levels.length} levels, current: ${currentLevelIndex}`);
    levelList.innerHTML = '';
    
    levels.forEach((level, index) => {
      const levelItem = document.createElement('div');
      levelItem.className = 'level-item';
      
      if (level.completed) {
        levelItem.classList.add('completed');
      } else if (index === currentLevelIndex) {
        levelItem.classList.add('current');
      } else if (index > currentLevelIndex) {
        levelItem.classList.add('locked');
      }
      
      const icon = document.createElement('div');
      icon.className = 'level-icon';
      if (level.completed) {
        icon.textContent = '✅';
      } else if (index === currentLevelIndex) {
        icon.textContent = '🚀';
      } else if (index < currentLevelIndex) {
        icon.textContent = '⭐';
      } else {
        icon.textContent = '🔒';
      }
      
      const info = document.createElement('div');
      info.className = 'level-info';
      
      const name = document.createElement('div');
      name.className = 'level-name';
      name.textContent = `${index + 1}. ${level.name}`;
      
      const status = document.createElement('div');
      status.className = 'level-status';
      if (level.completed) {
        status.textContent = '✓ Completed';
      } else if (index === currentLevelIndex) {
        status.textContent = 'In Progress...';
      } else {
        status.textContent = `${level.questions.length} questions`;
      }
      
      info.appendChild(name);
      info.appendChild(status);
      levelItem.appendChild(icon);
      levelItem.appendChild(info);
      levelList.appendChild(levelItem);
    });
    
    console.log(`✅ Level tracker rendered with ${levelList.children.length} items`);
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
  
  async function initGame() {
    console.log('DOM ready, initializing game...');
    const gameBoard = document.getElementById('game-board');
    console.log('gameBoard element:', gameBoard);
    const quizModal = document.getElementById('quiz-modal');
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    const progressEl = document.getElementById('progress');
    const closeBtn = document.querySelector('.close');

  // Level management state
  let gameLevels = [];
  let currentLevelIndex = 0;

  // Audio setup
  const muteBtn = document.getElementById('muteBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  let isMuted = true;
  let volume = 0;

  // Audio context for sound effects (using Web Audio API)
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  function playSound(frequency, duration, type = 'sine') {
    if (isMuted || volume === 0) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume / 100 * 0.3; // Scale volume (max 0.3 to not be too loud)
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  }

  function playCelebration() {
    if (isMuted || volume === 0) return;
    // Victory fanfare
    setTimeout(() => playSound(523, 0.15), 0);    // C
    setTimeout(() => playSound(659, 0.15), 150);  // E
    setTimeout(() => playSound(784, 0.15), 300);  // G
    setTimeout(() => playSound(1047, 0.3), 450);  // High C
  }

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      muteBtn.textContent = '🔇 Unmute';
      muteBtn.classList.add('muted');
      volumeSlider.value = 0;
      volume = 0;
    } else {
      muteBtn.textContent = '🔊 Mute';
      muteBtn.classList.remove('muted');
      volumeSlider.value = 50;
      volume = 50;
      playSound(440, 0.2); // Test sound (A note)
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    volume = parseInt(e.target.value);
    if (volume > 0 && isMuted) {
      isMuted = false;
      muteBtn.textContent = '🔊 Mute';
      muteBtn.classList.remove('muted');
    } else if (volume === 0 && !isMuted) {
      isMuted = true;
      muteBtn.textContent = '🔇 Unmute';
      muteBtn.classList.add('muted');
    }
  });

  // Confetti function
  function createConfetti() {
    const colors = ['#f10094', '#6a2cf5', '#00f5c8', '#ffd700', '#ff6b6b'];
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3500);
      }, i * 30);
    }
  }

  const numRows = 7;
  const numCols = 5;
  const numPods = numRows * numCols;

  let playerPosition = 30;
  let startPosition = 30; // Remember starting position
  let goalPosition = 2;
  let progress = 0;
  let totalQuestions = 10; // Will be updated based on loaded questions
  let gameAttempts = 0; // Track number of game attempts

  let questions = []; // Will be loaded from current level

  // Load all levels
  console.log('Loading levels...');
  try {
    gameLevels = await loadLevels();
    if (gameLevels.length === 0) {
      alert('No GIFT files found! Please add .gift files to the same folder as Game.md');
      return;
    }
    console.log(`Loaded ${gameLevels.length} levels`);
    
    // Load first level
    questions = gameLevels[0].questions;
    totalQuestions = questions.length;
    console.log(`Starting with Level 1: "${gameLevels[0].name}" - ${totalQuestions} questions`);
    
    // Set initial background
    gameBoard.style.background = gameLevels[0].background;
    
    // Render level tracker
    renderLevelTracker(gameLevels, currentLevelIndex);
    
  } catch (error) {
    console.error('Failed to load levels:', error);
    alert('Failed to load quiz levels. Please check that GIFT files exist and are properly formatted.');
    return;
  }

  let currentQuestion;
  let askedQuestions = new Set();
  let targetPodId;
  let podQuestions = new Map(); // podId -> questionIndex
  let podAttempts = new Map(); // podId -> attempts
  let startTime;
  let totalAttempts = 0;
  let answerSubmitted = false; // Prevent multiple answer submissions
  
  function disableAnswerButtons() {
    const buttons = answersEl.querySelectorAll('.answer-btn');
    buttons.forEach(button => {
      button.disabled = true;
      button.style.opacity = '0.5';
      button.style.cursor = 'not-allowed';
    });
  }
  
  function nextLevel() {
    console.log('🚀 nextLevel() called - Current level:', currentLevelIndex, 'Total levels:', gameLevels.length);
    
    if (currentLevelIndex < gameLevels.length - 1) {
      // Mark current level as completed
      gameLevels[currentLevelIndex].completed = true;
      
      // Move to next level
      currentLevelIndex++;
      const levelData = gameLevels[currentLevelIndex];
      
      console.log(`✅ Advancing to Level ${currentLevelIndex + 1}: "${levelData.name}"`);
      
      // Update questions for new level
      questions = levelData.questions;
      totalQuestions = questions.length;
      
      // Change background for new level
      gameBoard.style.background = levelData.background;
      
      // Reset game state for new level
      progress = 0;
      askedQuestions = new Set();
      podQuestions = new Map();
      podAttempts = new Map();
      totalAttempts = 0;
      startTime = Date.now();
      playerPosition = startPosition;
      
      // Reset game board container styles (fixes structural break)
      gameBoard.innerHTML = ''; // Clear victory screen
      gameBoard.style.display = 'grid';
      gameBoard.style.flexDirection = '';
      gameBoard.style.justifyContent = '';
      gameBoard.style.alignItems = '';
      
      // Update level tracker
      renderLevelTracker(gameLevels, currentLevelIndex);
      
      // Recreate board
      createBoard();
      updateProgress();
      
      playSound(659, 0.2); // Celebration sound for level up
    }
  }

  function restartGame() {
    console.log('Restarting game...');
    gameAttempts++;
    
    // Reset game state
    playerPosition = 30;
    progress = 0;
    askedQuestions.clear();
    podQuestions.clear();
    podAttempts.clear();
    totalAttempts = 0;
    targetPodId = undefined;
    startTime = Date.now();
    
    // Reset game board container styles
    gameBoard.style.display = 'grid';
    gameBoard.style.flexDirection = '';
    gameBoard.style.justifyContent = '';
    gameBoard.style.alignItems = '';
    gameBoard.style.background = 'radial-gradient(ellipse at center, #1a0c42 0%, #000 100%)';
    
    // Recreate the board
    createBoard();
    updateProgress();
    
    // Play restart sound
    playSound(440, 0.15);
  }

  function createBoard() {
    console.log('Creating board - numPods:', numPods);
    gameBoard.innerHTML = ''; // Clear loading message
    for (let i = 0; i < numPods; i++) {
      const pod = document.createElement('div');
      pod.classList.add('pod');
      pod.dataset.id = i;
      pod.textContent = i;
      pod.addEventListener('click', () => handlePodClick(i));
      if (i === startPosition) {
        pod.classList.add('start');
        pod.textContent = '🌍';
        console.log('Start position at', i);
      }
      if (i === playerPosition) {
        pod.classList.add('player');
        pod.textContent = '🚀';
        console.log('Player at', i);
      }
      if (i === goalPosition) {
        pod.classList.add('goal');
        pod.textContent = '🪐';
        console.log('Goal at', i);
      }
      gameBoard.appendChild(pod);
    }
    console.log('Board created with', gameBoard.children.length, 'pods');
    highlightAdjacent();
  }

  function highlightAdjacent() {
    document.querySelectorAll('.pod').forEach(pod => {
      pod.classList.remove('adjacent');
      const podId = parseInt(pod.dataset.id);
      // Don't change start position - it should always show earth
      if (podId === startPosition) {
        if (!pod.classList.contains('start')) {
          pod.classList.add('start');
        }
        pod.textContent = '🌍';
      } else if (pod.classList.contains('unlocked')) {
        // Keep unlocked cells showing green tick
        pod.textContent = '✓';
      } else if (!pod.classList.contains('player') && !pod.classList.contains('goal') && !pod.classList.contains('blocked')) {
        pod.textContent = '';
      }
    });
    const adjacent = getAdjacentPods(playerPosition);
    adjacent.forEach(id => {
      const pod = document.querySelector(`.pod[data-id="${id}"]`);
      // Only mark as adjacent if not already unlocked, not start position
      if (pod && id !== startPosition && !pod.classList.contains('unlocked')) {
        pod.classList.add('adjacent');
        pod.textContent = '❔'; // Show go/arrow icon for accessible cells
      }
    });
  }

  function handlePodClick(podId) {
    const pod = document.querySelector(`.pod[data-id="${podId}"]`);
    // Don't allow clicking on start position, unlocked cells, or blocked cells
    if (podId === startPosition) {
      return; // Start position is not clickable
    }
    if (isAdjacent(playerPosition, podId) && !pod.classList.contains('unlocked') && !pod.classList.contains('blocked')) {
      targetPodId = podId;
      totalAttempts++;
      if (!podQuestions.has(podId)) {
        podQuestions.set(podId, getRandomQuestion());
        podAttempts.set(podId, 0);
      }
      currentQuestion = podQuestions.get(podId);
      showQuiz();
      displayQuestion(currentQuestion);
    }
  }

  function getRandomQuestion() {
    let available = questions.filter((_, i) => !askedQuestions.has(i));
    if (available.length === 0) {
      askedQuestions.clear(); // Reset if all asked
      available = questions;
    }
    const index = Math.floor(Math.random() * available.length);
    const qIndex = questions.indexOf(available[index]);
    askedQuestions.add(qIndex);
    return qIndex;
  }

  function showQuiz() {
    quizModal.style.display = 'block';
  }

  function displayQuestion(questionIndex) {
    const q = questions[questionIndex];
    questionEl.textContent = q.question;
    answersEl.innerHTML = '';
    
    // Reset answer submission flag for new question
    answerSubmitted = false;
    
    // Update visual attempts tracker
    updateAttemptsTracker();
    
    q.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.textContent = answer;
      button.classList.add('answer-btn');
      button.addEventListener('click', () => checkAnswer(index));
      answersEl.appendChild(button);
    });
  }
  
  function updateAttemptsTracker() {
    const attemptsTracker = document.getElementById('attempts-tracker');
    if (!attemptsTracker) return;
    
    const currentAttempts = podAttempts.get(targetPodId) || 0;
    const isGoal = targetPodId === goalPosition;
    
    attemptsTracker.innerHTML = '';
    
    if (isGoal) {
      // Goal planet - show unlimited symbol
      const label = document.createElement('span');
      label.className = 'attempts-tracker-label';
      label.textContent = 'Destination Planet:';
      attemptsTracker.appendChild(label);
      
      const unlimited = document.createElement('div');
      unlimited.className = 'attempt-indicator unlimited';
      unlimited.textContent = '∞';
      unlimited.title = 'Unlimited attempts';
      attemptsTracker.appendChild(unlimited);
      
      const text = document.createElement('span');
      text.className = 'attempts-tracker-label';
      text.textContent = 'Unlimited Attempts';
      text.style.color = '#ff9800';
      attemptsTracker.appendChild(text);
    } else {
      // Regular cell - show 3 attempts
      const label = document.createElement('span');
      label.className = 'attempts-tracker-label';
      label.textContent = 'Attempts:';
      attemptsTracker.appendChild(label);
      
      for (let i = 0; i < 3; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'attempt-indicator';
        
        if (i < currentAttempts) {
          indicator.classList.add('used');
          indicator.textContent = '✗';
          indicator.title = 'Used';
        } else {
          indicator.classList.add('available');
          indicator.textContent = '✓';
          indicator.title = 'Available';
        }
        
        attemptsTracker.appendChild(indicator);
      }
    }
  }

  function checkAnswer(answerIndex) {
    // Prevent multiple submissions
    if (answerSubmitted) {
      return;
    }
    
    // Remove old feedback if exists
    const oldFeedback = answersEl.querySelector('.feedback-message');
    if (oldFeedback) {
      oldFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    
    if (answerIndex === questions[currentQuestion].correct) {
      // Mark as submitted and disable all buttons
      answerSubmitted = true;
      disableAnswerButtons();
      
      playSound(523, 0.2); // Correct answer sound (C note)
      feedback.textContent = '✅ Correct! Wisdom gained. Advancing...';
      feedback.style.color = '#fff';
      feedback.style.backgroundColor = 'var(--AtaGreen)';
      progress++;
      updateProgress();
      movePlayer();
      setTimeout(() => {
        quizModal.style.display = 'none';
        answerSubmitted = false; // Reset for next question
        // Check if reached goal (victory) or exhausted questions (failure)
        if (playerPosition === goalPosition) {
          endGame(true); // Victory
        } else if (progress >= totalQuestions) {
          endGame(false); // Failed - answered 10 but didn't reach goal
        }
      }, 2000);
    } else {
      playSound(200, 0.3, 'sawtooth'); // Wrong answer sound (low buzz)
      podAttempts.set(targetPodId, podAttempts.get(targetPodId) + 1);
      
      // Update visual attempts tracker
      updateAttemptsTracker();
      
      // Special handling for goal planet - allow unlimited retries
      if (targetPodId === goalPosition) {
        console.log(`🪐 Goal planet attempt #${podAttempts.get(targetPodId)} - Unlimited retries allowed`);
        feedback.textContent = `🪐 Incorrect, but you can retry as many times as needed!`;
        feedback.style.color = '#ff9800';
        feedback.style.backgroundColor = 'rgba(255, 152, 0, 0.1)';
        feedback.style.border = '2px solid #ff9800';
        // Keep modal open for retry - never block the goal
      } else if (podAttempts.get(targetPodId) >= 3) {
        playSound(100, 0.5, 'square'); // Block sound (lower, harsher)
        feedback.textContent = '❌ Too many attempts! This sector is now blocked.';
        feedback.style.color = '#fff';
        feedback.style.backgroundColor = 'var(--AtaRed)';
        blockPod(targetPodId);
        setTimeout(() => {
          quizModal.style.display = 'none';
        }, 2000);
      } else {
        const remaining = 3 - podAttempts.get(targetPodId);
        feedback.textContent = `❌ Incorrect. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`;
        feedback.style.color = 'var(--AtaRed)';
        feedback.style.backgroundColor = 'rgba(247, 82, 80, 0.1)';
        feedback.style.border = '2px solid var(--AtaRed)';
        // Keep modal open for retry
      }
    }
    answersEl.appendChild(feedback);
  }

  function movePlayer() {
    if (targetPodId !== undefined) {
      const oldPlayerPod = document.querySelector('.player');
      oldPlayerPod.classList.remove('player');
      // Don't mark start position as unlocked, keep it as origin planet
      if (playerPosition !== startPosition) {
        oldPlayerPod.classList.add('unlocked');
        oldPlayerPod.textContent = '✓';
      } else {
        oldPlayerPod.textContent = '🌍';
      }
      const newPod = document.querySelector(`.pod[data-id="${targetPodId}"]`);
      newPod.classList.add('player');
      newPod.textContent = '🚀';
      playerPosition = targetPodId;
      highlightAdjacent();
      targetPodId = undefined; // Reset
    }
  }

  function blockPod(podId) {
    // Safety check: Never block the goal planet
    if (podId === goalPosition) {
      console.warn('⚠️ Attempted to block goal planet - this should never happen!');
      return;
    }
    
    const pod = document.querySelector(`.pod[data-id="${podId}"]`);
    pod.classList.add('blocked');
    const junkTypes = ['🪨', '💥', '☄️', '🛰️', '🚧'];
    pod.textContent = junkTypes[Math.floor(Math.random() * junkTypes.length)];
    pod.style.backgroundColor = '#000';
    pod.style.borderColor = '#f75250';
    highlightAdjacent(); // Update highlights
    
    // Check if player is now blocked after updating highlights
    setTimeout(() => {
      // Check all 8 directions to see if there's ANY valid move
      const row = Math.floor(playerPosition / numCols);
      const col = playerPosition % numCols;
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // orthogonal
        [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
      ];
      
      let hasValidMove = false;
      for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
          const newPos = newRow * numCols + newCol;
          const targetPod = document.querySelector(`.pod[data-id="${newPos}"]`);
          // A cell is valid if it's not blocked, not unlocked, and not the start position
          if (!targetPod.classList.contains('blocked') && 
              !targetPod.classList.contains('unlocked') && 
              newPos !== startPosition) {
            hasValidMove = true;
            break;
          }
        }
      }
      
      if (!hasValidMove && playerPosition !== goalPosition) {
        quizModal.style.display = 'none';
        endGame('blocked');
      }
    }, 100);
  }

  function getAdjacentPods(pos) {
    const adjacent = [];
    const row = Math.floor(pos / numCols);
    const col = pos % numCols;
    // Orthogonal (up, down, left, right)
    if (row > 0) adjacent.push(pos - numCols); // Up
    if (row < numRows - 1) adjacent.push(pos + numCols); // Down
    if (col > 0) adjacent.push(pos - 1); // Left
    if (col < numCols - 1) adjacent.push(pos + 1); // Right
    // Diagonal (up-left, up-right, down-left, down-right)
    if (row > 0 && col > 0) adjacent.push(pos - numCols - 1); // Up-Left
    if (row > 0 && col < numCols - 1) adjacent.push(pos - numCols + 1); // Up-Right
    if (row < numRows - 1 && col > 0) adjacent.push(pos + numCols - 1); // Down-Left
    if (row < numRows - 1 && col < numCols - 1) adjacent.push(pos + numCols + 1); // Down-Right
    return adjacent.filter(p => {
      const pod = document.querySelector(`.pod[data-id="${p}"]`);
      return !pod.classList.contains('unlocked') && !pod.classList.contains('blocked') && (!isAdjacentToBlocked(p) || isAdjacent(p, playerPosition));
    });
  }

  function isAdjacentToBlocked(pos) {
    const adjacent = [];
    const row = Math.floor(pos / numCols);
    const col = pos % numCols;
    // Orthogonal
    if (row > 0) adjacent.push(pos - numCols);
    if (row < numRows - 1) adjacent.push(pos + numCols);
    if (col > 0) adjacent.push(pos - 1);
    if (col < numCols - 1) adjacent.push(pos + 1);
    // Diagonal
    if (row > 0 && col > 0) adjacent.push(pos - numCols - 1);
    if (row > 0 && col < numCols - 1) adjacent.push(pos - numCols + 1);
    if (row < numRows - 1 && col > 0) adjacent.push(pos + numCols - 1);
    if (row < numRows - 1 && col < numCols - 1) adjacent.push(pos + numCols + 1);
    return adjacent.some(p => document.querySelector(`.pod[data-id="${p}"]`).classList.contains('blocked'));
  }

  function updateProgress() {
    const levelName = gameLevels[currentLevelIndex]?.name || 'Unknown Level';
    progressEl.textContent = `${levelName} - Progress: ${progress}/${totalQuestions}`;
    // Also update level tracker
    renderLevelTracker(gameLevels, currentLevelIndex);
  }

  function isAdjacent(pos1, pos2) {
    const row1 = Math.floor(pos1 / numCols);
    const col1 = pos1 % numCols;
    const row2 = Math.floor(pos2 / numCols);
    const col2 = pos2 % numCols;
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    // Adjacent if: orthogonal (1 step in one direction) or diagonal (1 step in both directions)
    return (rowDiff <= 1 && colDiff <= 1) && (rowDiff + colDiff > 0);
  }

  function endGame(victory) {
    console.log('Game ending... Victory:', victory);
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - startTime) / 1000); // seconds
    const blockedCount = document.querySelectorAll('.blocked').length;
    const unlockedCount = document.querySelectorAll('.unlocked').length;
    
    // Calculate current level stats
    const successRate = totalAttempts > 0 ? Math.round((progress / totalAttempts) * 100) : 0;
    const currentLevelStats = {
      timeTaken: `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
      totalAttempts: totalAttempts,
      correctAnswers: progress,
      sectorsExplored: unlockedCount,
      spaceJunkCreated: blockedCount,
      successRate: `${successRate}%`
    };

    // Save metrics for current level if victorious
    if (victory === true) {
      saveLevelMetrics(currentLevelIndex, gameLevels[currentLevelIndex].name, currentLevelStats);
    }

    // Clear game board and show stats
    gameBoard.innerHTML = '';
    gameBoard.style.display = 'flex';
    gameBoard.style.flexDirection = 'column';
    gameBoard.style.justifyContent = 'center';
    gameBoard.style.alignItems = 'center';
    
    const statsDiv = document.createElement('div');
    statsDiv.style.textAlign = 'center';
    statsDiv.style.color = '#fff';
    statsDiv.style.fontSize = '1em';
    statsDiv.style.padding = '12px';
    statsDiv.style.width = '100%';
    statsDiv.style.maxHeight = '90%';
    statsDiv.style.overflow = 'auto';
    
    if (victory === true) {
      // Victory celebration!
      playCelebration();
      createConfetti();
      
      // Check if there are more levels
      const isLastLevel = currentLevelIndex >= gameLevels.length - 1;
      
      if (isLastLevel) {
        // Final victory - completed all levels!
        gameBoard.style.background = 'radial-gradient(ellipse at center, #6a2cf5 0%, #1a0c42 50%, #000 100%)';
        
        // Generate metrics code asynchronously
        generateMetricsCode(allLevelMetrics, learnerId).then(metricsCode => {
          statsDiv.innerHTML = `
            <h1 style="color: #f10094; font-size: 1.4em; margin-bottom: 10px;">🎉🌟 ALL LEVELS COMPLETE! 🌟🎉</h1>
            <p style="font-size: 0.85em; margin-bottom: 12px;">You have conquered ALL levels and reached Ataccama Prime!</p>
            <div style="background: rgba(241, 0, 144, 0.2); padding: 12px; border-radius: 10px; border: 2px solid #f10094; box-shadow: 0 0 15px rgba(241, 0, 144, 0.5);">
              <h2 style="color: #00f5c8; margin-bottom: 10px; font-size: 1em;">📊 Final Level Statistics</h2>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>⏱️ Time Taken:</strong> ${currentLevelStats.timeTaken}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>🎯 Total Attempts:</strong> ${currentLevelStats.totalAttempts}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>✅ Correct Answers:</strong> ${currentLevelStats.correctAnswers}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>🌟 Sectors Explored:</strong> ${currentLevelStats.sectorsExplored}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>🪨 Space Junk Created:</strong> ${currentLevelStats.spaceJunkCreated}</p>
              <p style="margin: 5px 0; font-size: 0.85em; color: #00f5c8;"><strong>📈 Success Rate:</strong> ${currentLevelStats.successRate}</p>
              <p style="margin-top: 10px; font-size: 0.95em; color: #f10094;"><strong>🏆 Total Levels Completed: ${gameLevels.length}/${gameLevels.length}</strong></p>
            </div>
            
            ${metricsCode ? `
            <div style="background: rgba(0, 245, 200, 0.2); padding: 12px; border-radius: 10px; border: 2px solid #00f5c8; box-shadow: 0 0 15px rgba(0, 245, 200, 0.5); margin-top: 15px;">
              <h2 style="color: #00f5c8; margin-bottom: 10px; font-size: 1em;">🔐 Your Completion Code</h2>
              <p style="font-size: 0.75em; margin-bottom: 8px; color: #aaa;">Submit this code to your instructor for verification:</p>
              <div style="background: rgba(0, 0, 0, 0.5); padding: 10px; border-radius: 5px; margin-bottom: 8px; word-break: break-all; font-family: monospace; font-size: 0.7em; color: #00f5c8; border: 1px solid #00f5c8;">
                ${metricsCode}
              </div>
              <button id="copyCodeBtn" style="background-color: #00f5c8; color: #000; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-size: 0.85em; font-weight: bold; transition: all 0.3s;">
                📋 Copy Code
              </button>
              <p id="copyStatus" style="margin-top: 8px; font-size: 0.75em; color: #00f5c8; min-height: 1em;"></p>
            </div>
            ` : ''}
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #f10094;">Congratulations!</p>
          `;
          
          // Add copy button functionality
          if (metricsCode) {
            setTimeout(() => {
              const copyBtn = document.getElementById('copyCodeBtn');
              const copyStatus = document.getElementById('copyStatus');
              if (copyBtn) {
                copyBtn.addEventListener('click', async () => {
                  try {
                    await navigator.clipboard.writeText(metricsCode);
                    copyStatus.textContent = '✅ Code copied to clipboard!';
                    copyBtn.textContent = '✅ Copied!';
                    copyBtn.style.backgroundColor = '#22ff44';
                    setTimeout(() => {
                      copyBtn.textContent = '📋 Copy Code';
                      copyBtn.style.backgroundColor = '#00f5c8';
                      copyStatus.textContent = '';
                    }, 3000);
                  } catch (err) {
                    copyStatus.textContent = '❌ Failed to copy. Please select and copy manually.';
                    console.error('Copy failed:', err);
                  }
                });
              }
            }, 100);
          }
        });
      } else {
        // Level complete - more levels ahead!
        gameBoard.style.background = 'radial-gradient(ellipse at center, #00f5c8 0%, #1a0c42 50%, #000 100%)';
        statsDiv.innerHTML = `
          <h1 style="color: #00f5c8; font-size: 1.4em; margin-bottom: 10px; text-align: center;">🎉 Level Complete! 🎉</h1>
          <div style="display: flex; gap: 15px; align-items: stretch;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px;">
              <h2 style="color: #f10094; font-size: 1.1em; margin-bottom: 8px; text-align: center;">"${gameLevels[currentLevelIndex].name}"</h2>
              <p style="font-size: 0.85em; margin-bottom: 15px; text-align: center;">Get ready for the next challenge!</p>
              <button id="nextLevelBtn" style="background-color: #6a2cf5; color: #fff; border: none; padding: 12px 35px; border-radius: 8px; cursor: pointer; font-size: 1em; font-weight: bold; box-shadow: 0 0 15px rgba(106, 44, 245, 0.5); transition: all 0.3s ease;">➡️ Next Level</button>
              <p style="margin-top: 12px; font-size: 0.8em; color: #00f5c8; text-align: center;">Up Next:<br>"${gameLevels[currentLevelIndex + 1].name}"</p>
            </div>
            <div style="flex: 1; background: rgba(0, 245, 200, 0.2); padding: 12px; border-radius: 10px; border: 2px solid #00f5c8; box-shadow: 0 0 15px rgba(0, 245, 200, 0.5);">
              <h2 style="color: #6a2cf5; margin-bottom: 10px; font-size: 1em; text-align: center;">📊 Level Statistics</h2>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>⏱️ Time Taken:</strong> ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>🎯 Total Attempts:</strong> ${totalAttempts}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>✅ Correct Answers:</strong> ${progress}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>🌟 Sectors Explored:</strong> ${unlockedCount}</p>
              <p style="margin: 5px 0; font-size: 0.8em;"><strong>🪨 Space Junk Created:</strong> ${blockedCount}</p>
              <p style="margin: 5px 0; font-size: 0.85em; color: #6a2cf5;"><strong>📈 Success Rate:</strong> ${totalAttempts > 0 ? Math.round((progress / totalAttempts) * 100) : 0}%</p>
              <p style="margin-top: 8px; font-size: 0.85em; color: #f10094; text-align: center;"><strong>🚀 Level ${currentLevelIndex + 1}/${gameLevels.length} Complete</strong></p>
            </div>
          </div>
        `;
        
        // Add next level button event listener
        setTimeout(() => {
          const nextLevelBtn = document.getElementById('nextLevelBtn');
          console.log('🔘 Setting up Next Level button, found:', nextLevelBtn ? 'YES' : 'NO');
          if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', function() {
              console.log('🎯 Next Level button clicked!');
              nextLevel();
            });
            nextLevelBtn.addEventListener('mouseenter', function() {
              this.style.backgroundColor = '#f10094';
              this.style.transform = 'scale(1.05)';
            });
            nextLevelBtn.addEventListener('mouseleave', function() {
              this.style.backgroundColor = '#6a2cf5';
              this.style.transform = 'scale(1)';
            });
          }
        }, 100);
      }
      
      gameBoard.appendChild(statsDiv);
      console.log('Stats displayed');
    } else if (victory === 'blocked') {
      gameBoard.style.background = 'radial-gradient(ellipse at center, #f75250 0%, #1a0c42 50%, #000 100%)';
      statsDiv.innerHTML = `
        <h1 style="color: #f75250; font-size: 1.4em; margin-bottom: 8px;">🚧 Path Blocked! 🚧</h1>
        <p style="font-size: 0.8em; margin-bottom: 10px;">Your path is completely blocked by space junk!</p>
        <p style="font-size: 0.9em; margin-bottom: 10px;">🪨💥 No escape route available...</p>
        <div style="background: rgba(247, 82, 80, 0.2); padding: 12px; border-radius: 10px; border: 2px solid #f75250; box-shadow: 0 0 15px rgba(247, 82, 80, 0.5);">
          <h2 style="color: #f10094; margin-bottom: 10px; font-size: 1em;">📊 Your Journey</h2>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>⏱️ Time Taken:</strong> ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🎯 Total Attempts:</strong> ${totalAttempts}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>✅ Correct Answers:</strong> ${progress}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🌟 Sectors Explored:</strong> ${unlockedCount}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🪨 Space Junk Created:</strong> ${blockedCount}</p>
          <p style="margin: 5px 0; font-size: 0.85em; color: #f10094;"><strong>📈 Success Rate:</strong> ${totalAttempts > 0 ? Math.round((progress / totalAttempts) * 100) : 0}%</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🔄 Attempt:</strong> ${gameAttempts + 1}</p>
        </div>
        <button id="restartBtn" style="margin-top: 15px; background-color: #6a2cf5; color: #fff; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: bold; box-shadow: 0 0 15px rgba(106, 44, 245, 0.5); transition: all 0.3s ease;">🔄 Try Again</button>
        <p style="margin-top: 10px; font-size: 0.8em; color: #f75250;">Try a different strategy next time!</p>
      `;
      
      // Add restart button event listener
      setTimeout(() => {
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
          restartBtn.addEventListener('click', restartGame);
          restartBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f10094';
            this.style.transform = 'scale(1.05)';
          });
          restartBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#6a2cf5';
            this.style.transform = 'scale(1)';
          });
        }
      }, 100);
    } else {
      gameBoard.style.background = 'radial-gradient(ellipse at center, #f75250 0%, #1a0c42 50%, #000 100%)';
      statsDiv.innerHTML = `
        <h1 style="color: #f75250; font-size: 1.4em; margin-bottom: 8px;">💀 Lost in Space! 💀</h1>
        <p style="font-size: 0.8em; margin-bottom: 10px;">You answered all questions but failed to reach the goal!</p>
        <p style="font-size: 0.9em; margin-bottom: 10px;">🚀💨 Drifting endlessly...</p>
        <div style="background: rgba(247, 82, 80, 0.2); padding: 12px; border-radius: 10px; border: 2px solid #f75250; box-shadow: 0 0 15px rgba(247, 82, 80, 0.5);">
          <h2 style="color: #f10094; margin-bottom: 10px; font-size: 1em;">📊 Your Journey</h2>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>⏱️ Time Taken:</strong> ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🎯 Total Attempts:</strong> ${totalAttempts}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>✅ Correct Answers:</strong> ${progress}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🌟 Sectors Explored:</strong> ${unlockedCount}</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🪨 Space Junk Created:</strong> ${blockedCount}</p>
          <p style="margin: 5px 0; font-size: 0.85em; color: #f10094;"><strong>📈 Success Rate:</strong> ${totalAttempts > 0 ? Math.round((progress / totalAttempts) * 100) : 0}%</p>
          <p style="margin: 5px 0; font-size: 0.8em;"><strong>🔄 Attempt:</strong> ${gameAttempts + 1}</p>
        </div>
        <button id="restartBtn" style="margin-top: 15px; background-color: #6a2cf5; color: #fff; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: bold; box-shadow: 0 0 15px rgba(106, 44, 245, 0.5); transition: all 0.3s ease;">🔄 Try Again</button>
        <p style="margin-top: 12px; font-size: 0.8em; color: #f75250;">Better luck next time, space explorer!</p>
      `;
      
      // Add restart button event listener
      setTimeout(() => {
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
          restartBtn.addEventListener('click', restartGame);
          restartBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f10094';
            this.style.transform = 'scale(1.05)';
          });
          restartBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#6a2cf5';
            this.style.transform = 'scale(1)';
          });
        }
      }, 100);
    }
    
    gameBoard.appendChild(statsDiv);
    console.log('Stats displayed');
  }

  closeBtn.onclick = function() {
    quizModal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == quizModal) {
      quizModal.style.display = "none";
    }
  }

  // Initialize the game
  console.log('Initializing game...');
  createBoard();
  startTime = Date.now();
  console.log('Game initialized!');
  }
})();
</script>