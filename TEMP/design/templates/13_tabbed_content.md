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

# Interactive Content Tabs

<div class="css-tabs-v2">
<input type="radio" name="tabs" id="tab1" checked>
<label for="tab1" role="tab" aria-controls="content1" tabindex="0">Feature 1</label>

<input type="radio" name="tabs" id="tab2">
<label for="tab2" role="tab" aria-controls="content2" tabindex="0">Feature 2</label>

<input type="radio" name="tabs" id="tab3">
<label for="tab3" role="tab" aria-controls="content3" tabindex="0">Feature 3</label>

<div class="tab-tracker">
<span>Progress: </span>
<div class="progress-bar">
<div class="progress-fill"></div>
</div>
</div>

<div id="content1" class="tab-content" role="tabpanel" aria-labelledby="tab1">
<div class="content-header">
<h2>Feature 1: Data Analytics</h2>
<div class="tab-tools">
<button class="tool-button mark-complete" data-tab="1" title="Mark as completed"><i class="icon-check"></i> Mark Complete</button>
</div>
</div>
<div class="container">
<div class="column" style="width:70%;">
<h3>Optional Subtitle</h3>
<p>Lorem ipsum odor amet, consectetuer adipiscing elit. Aliquam suspendisse mi; purus curabitur maecenas quis habitasse orci platea. Dis platea amet bibendum mattis adipiscing dapibus.</p>
<p>Sapien bibendum faucibus suscipit, aenean rutrum diam sociosqu sodales fringilla. Pharetra ut habitant neque donec duis vivamus.</p>
</div>
<div class="column" style="width:30%;">
<img src="https://picsum.photos/500/500" alt="Advanced Analytics Visual" style="max-width: 100%;">
</div>
</div>
</div>

<div id="content2" class="tab-content" role="tabpanel" aria-labelledby="tab2">
<div class="content-header">
<h2>Feature 2: Collaboration Tools</h2>
<div class="tab-tools">
<button class="tool-button mark-complete" data-tab="2" title="Mark as completed"><i class="icon-check"></i> Mark Complete</button>
</div>
</div>
<div class="container">
<div class="column" style="width:70%;">
<h3>Optional Subtitle</h3>
<p>Lorem ipsum odor amet, consectetuer adipiscing elit. Aliquam suspendisse mi; purus curabitur maecenas quis habitasse orci platea. Dis platea amet bibendum mattis adipiscing dapibus.</p>
<p>Sapien bibendum faucibus suscipit, aenean rutrum diam sociosqu sodales fringilla. Pharetra ut habitant neque donec duis vivamus.</p>
</div>
<div class="column" style="width:30%;">
<img src="https://picsum.photos/500/500" alt="Collaboration Tools Screenshot" style="max-width: 100%;">
</div>
</div>
</div>

<div id="content3" class="tab-content" role="tabpanel" aria-labelledby="tab3">
<div class="content-header">
<h2>Feature 3: Advanced Analytics</h2>
<div class="tab-tools">
<button class="tool-button mark-complete" data-tab="3" title="Mark as completed"><i class="icon-check"></i> Mark Complete</button>
</div>
</div>
<div class="container">
<div class="column" style="width:70%;">
<h3>Optional Subtitle</h3>
<p>Lorem ipsum odor amet, consectetuer adipiscing elit. Aliquam suspendisse mi; purus curabitur maecenas quis habitasse orci platea. Dis platea amet bibendum mattis adipiscing dapibus.</p>
<p>Sapien bibendum faucibus suscipit, aenean rutrum diam sociosqu sodales fringilla. Pharetra ut habitant neque donec duis vivamus.</p>
</div>
<div class="column" style="width:30%;">
<img src="https://picsum.photos/500/500" alt="Advanced Analytics Visual" style="max-width: 100%;">
</div>
</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Tab switching and history handling
  const tabs = document.querySelectorAll('.css-tabs-v2 input[type="radio"]');
  const tabLabels = document.querySelectorAll('.css-tabs-v2 label[role="tab"]');
  const tabContents = document.querySelectorAll('.tab-content');
  let currentModule = window.location.pathname.split('/').pop().replace('.html', '');
  
  // Initialize tabs
  initTabs();
  
  function initTabs() {
    // Setup tab persistence via localStorage
    restoreTabState();
    
    // Set up event listeners for tabs
    tabs.forEach(tab => {
      tab.addEventListener('change', handleTabChange);
    });
    
    // Keyboard navigation
    tabLabels.forEach(label => {
      label.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          document.getElementById(this.getAttribute('for')).checked = true;
          handleTabChange({ target: document.getElementById(this.getAttribute('for')) });
        }
      });
    });
    
    // Handle initial URL hash if present
    if (window.location.hash) {
      const tabId = window.location.hash.substring(1);
      const tab = document.getElementById(tabId);
      if (tab) {
        tab.checked = true;
        handleTabChange({ target: tab });
      }
    }
    
    // Set up completion tracking
    setupCompletionTracking();
    updateProgressBar();
  }
  
  function handleTabChange(event) {
    const selectedTab = event.target;
    const tabId = selectedTab.id;
    const contentId = selectedTab.id.replace('tab', 'content');
    
    // Update URL hash for direct linking
    window.history.replaceState(null, null, '#' + tabId);
    
    // Store tab state in localStorage
    localStorage.setItem(`${currentModule}-activeTab`, tabId);
    
    // Apply animation classes
    tabContents.forEach(content => {
      if (content.id === contentId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }
  
  function restoreTabState() {
    const activeTab = localStorage.getItem(`${currentModule}-activeTab`);
    if (activeTab) {
      const tab = document.getElementById(activeTab);
      if (tab) {
        tab.checked = true;
        const contentId = activeTab.replace('tab', 'content');
        document.getElementById(contentId).classList.add('active');
      }
    } else {
      // Default to first tab
      document.getElementById('content1').classList.add('active');
    }
  }
  
  function setupCompletionTracking() {
    const completeButtons = document.querySelectorAll('.mark-complete');
    
    // Restore completion status
    completeButtons.forEach(button => {
      const tabNumber = button.dataset.tab;
      const isCompleted = localStorage.getItem(`${currentModule}-tab${tabNumber}-completed`) === 'true';
      
      if (isCompleted) {
        button.classList.add('completed');
        button.innerHTML = '<i class="icon-check"></i> Completed';
      }
    });
    
    // Set up completion tracking
    completeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabNumber = this.dataset.tab;
        const isCompleted = this.classList.contains('completed');
        
        if (!isCompleted) {
          this.classList.add('completed');
          this.innerHTML = '<i class="icon-check"></i> Completed';
          localStorage.setItem(`${currentModule}-tab${tabNumber}-completed`, 'true');
        } else {
          this.classList.remove('completed');
          this.innerHTML = '<i class="icon-check"></i> Mark Complete';
          localStorage.setItem(`${currentModule}-tab${tabNumber}-completed`, 'false');
        }
        
        updateProgressBar();
      });
    });
  }
  
  function updateProgressBar() {
    const totalTabs = tabs.length;
    let completedTabs = 0;
    
    // Count completed tabs
    for (let i = 1; i <= totalTabs; i++) {
      if (localStorage.getItem(`${currentModule}-tab${i}-completed`) === 'true') {
        completedTabs++;
      }
    }
    
    // Update progress bar
    const progressPercent = (completedTabs / totalTabs) * 100;
    const progressBar = document.querySelector('.progress-fill');
    progressBar.style.width = `${progressPercent}%`;
    
    // Update text
    const tracker = document.querySelector('.tab-tracker span');
    tracker.textContent = `Progress: ${completedTabs}/${totalTabs}`;
  }
});
</script>