---
title: Customer Education MARP Markdown Template for 2025 / v16
author: Danny Ryan, (Global) Director of Education at Ataccama Corp.
description: Supports our Docs-as-code initiative for 2025. Training Materials are created using MARP Markdown.
keywords: Marp, Slides, Themes, Brand, v16, 2025
marp: true
paginate: false
theme: ataccama_2024
---

<div class="artifact logo black"></div>

<style>
  .tts-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .tts-text {
    font-size: 1.5em;
    margin-bottom: 20px;
  }

  .tts-button {
    padding: 10px 20px;
    background-color: var(--AtaElectricPink);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .tts-button:hover {
    background-color: var(--AtaElectricPurple);
  }
</style>

<div class="tts-container">
  <h1>Text-to-Speech Demo</h1>

  <p id="tts-paragraph" class="tts-text">
    This is a demonstration of the Text-to-Speech functionality. You can click the button below to have this text read aloud.
  </p>

  <button class="tts-button" onclick="if (ttsSupported) speak(document.getElementById('tts-paragraph').textContent)">
    Read Aloud
  </button>

  <button class="tts-button" onclick="if (ttsSupported) speak(document.getElementById('tts-paragraph').textContent, 'Google UK English Female', 0.9, 1.1)">
    Read Aloud (Custom)
  </button>
</div>

<script src="tts.js"></script>