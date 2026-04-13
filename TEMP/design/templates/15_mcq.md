---
title: Customer Education MARP Markdown Template for 2025 / v16
author: Danny Ryan, (Global) Director of Education at Ataccama Corp.
description: Supports our Docs-as-code initiative for 2025. Training Materials are created using MARP Markdown and GIFT format.
keywords: Marp, Slides, Themes, Brand, v16, 2025, GIFT, MCQ
marp: true
paginate: false
theme: ataccama_2024
---

<div class="artifact logo black"></div>

# Interactive Quiz (from GIFT)

<!-- HTML Structure for the Quiz -->
<!-- LESSON AUTHOR: Set the path to your GIFT file in data-gift-src -->
<div class="mcq-container" data-gift-src="MCQ.gift">
  <div id="quiz-loading">Loading quiz questions...</div>
  <div id="quiz-content" style="position: relative; min-height: 500px;">
    <!-- Questions will be loaded here by JavaScript -->
  </div>
  <div id="summary" class="question-page">
    <h2>Quiz Summary</h2>
    <div id="score"></div>
    <div id="review"></div>
    <button class="next-button" id="retry-btn" onclick="resetQuiz()">Restart Quiz</button>
    <div id="attempts-info" style="margin-top:10px;color:#888;font-size:1em;"></div>
  </div>
  <div id="quiz-error" style="color: red; display: none; padding: 20px;"></div>
</div>

<!-- Define quiz settings BEFORE loading the main script -->
<script>
  // LESSON AUTHOR: Set desired attempts here ('unlimited' or a number like 3)
  window.MCQ_ATTEMPTS_SETTING = 3;
</script>

<!-- Link to the external JavaScript file -->
<script src="mcq_script.js"></script>

