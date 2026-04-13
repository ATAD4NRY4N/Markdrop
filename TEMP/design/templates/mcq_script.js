function log(message) {
    console.log("MCQ Script:", message); // Simple console logging wrapper
}

function showRetryHints(questionId) {
    const prev = previousAnswers[questionId];
    if (!prev) return;
    const inputs = document.querySelectorAll(`input[name="${questionId}"]`);
    inputs.forEach(input => {
        const label = input.parentElement.querySelector('label');
        if (label) {
            // Always reset label to original text before appending
            if (!label.dataset.originalText) {
                label.dataset.originalText = label.textContent.split(' (Correct last time!)')[0].split(' (Your previous answer)')[0];
            }
            label.innerHTML = label.dataset.originalText;
            label.classList.remove('prev-correct', 'prev-incorrect');
        }
        if (input.value === prev.selected) {
            input.checked = true;
            if (label) {
                if (prev.correct) {
                    label.innerHTML += " <span style='color:green;font-size:0.9em;'>(Correct last time!)</span>";
                    label.classList.add('prev-correct');
                } else {
                    label.innerHTML += " <span style='color:orange;font-size:0.9em;'>(Your previous answer)</span>";
                    label.classList.add('prev-incorrect');
                }
            }
        }
    });
    // Remove explanation display entirely
    const explanationDiv = document.getElementById(`${questionId}-explanation`);
    if (explanationDiv) explanationDiv.style.display = 'none';
}

// --- Global Variables ---
let score = 0;
let questionsData = [];
let userAnswers = {};
let currentQuestionIndex = 0; // Add this line
let masteryScore = 0.8; // Default mastery score (80%) - can be overridden by window.MCQ_MASTERY_SCORE

// --- Attempts Tracking ---
let attemptCount = undefined; // undefined until first load
let maxAttempts = 'unlimited';
// Read attempts setting from the global variable defined in the HTML
// Default to 'unlimited' if the variable isn't set for some reason.
let attemptsSetting = typeof window.MCQ_ATTEMPTS_SETTING !== 'undefined' ? window.MCQ_ATTEMPTS_SETTING : 'unlimited';
let totalAttempts = 0; // Track total attempts across all questions if limited

function updateAttemptsInfo() {
  const attemptsInfoDiv = document.getElementById('attempts-info');
  if (!attemptsInfoDiv) return;
  const summaryPage = document.getElementById('summary');
  const isSummaryVisible = summaryPage && summaryPage.style.display !== 'none';
  if (attemptsSetting === 'unlimited') {
      attemptsInfoDiv.textContent = isSummaryVisible ? 'Attempts: Unlimited' : '';
  } else if (isSummaryVisible) {
      // On summary page, show only the quiz attempt message
      if (typeof attemptCount === 'number') {
        attemptsInfoDiv.textContent = `Quiz attempt: ${attemptCount} of ${attemptsSetting}.`;
      } else {
        attemptsInfoDiv.textContent = `Quiz attempt limit: ${attemptsSetting}`;
      }
  } else {
      // On a question page, show only quiz attempts (not per-question)
      if (typeof attemptCount === 'number') {
        attemptsInfoDiv.textContent = `Attempts for this quiz: ${attemptCount} / ${attemptsSetting}`;
      } else {
        attemptsInfoDiv.textContent = `Attempts for this quiz: ${(attemptCount || 1)} / ${attemptsSetting}`;
      }
  }
   console.log("ATTEMPTS DEBUG (updateAttemptsInfo): attemptsSetting =", attemptsSetting, `| isSummaryVisible: ${isSummaryVisible} | Display text:`, attemptsInfoDiv.textContent);
}

function disableRetryIfNeeded() {
  const retryBtn = document.getElementById('retry-btn');
  if (!retryBtn) return;
  // Hide the retry button if max attempts reached (and not unlimited)
  if (typeof attemptsSetting === 'number' && attemptCount >= attemptsSetting) {
    retryBtn.style.display = 'none';
  } else {
    retryBtn.disabled = false;
    retryBtn.textContent = 'Restart Quiz';
    retryBtn.style.display = '';
  }
}

// --- Core Functions ---

async function loadQuiz() {
    log("ATTEMPTS DEBUG: loadQuiz - Start");
    const quizContainer = document.querySelector('.mcq-container');
    if (!quizContainer) {
        log("Error: MCQ container not found.");
        displayError("Quiz container element not found in the HTML.");
        return;
    }
    log("ATTEMPTS DEBUG: loadQuiz - Found quizContainer.");

    const giftPath = quizContainer.getAttribute('data-gift-src');
    if (!giftPath) {
        log("Error: data-gift-src attribute not set on MCQ container.");
        displayError("Configuration error: Path to GIFT file not specified.");
        return;
    }

    const loadingDiv = document.getElementById('quiz-loading');
    const contentDiv = document.getElementById('quiz-content');
    const summaryDiv = document.getElementById('summary');
    const errorDiv = document.getElementById('quiz-error');

    // Show loading indicator
    loadingDiv.style.display = 'block';
    contentDiv.style.display = 'none';
    summaryDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    fetch(giftPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${giftPath}`);
            }
            return response.text();
        })
        .then(giftData => {
            log("--- Starting GIFT Parsing ---");
            questions = parseGIFT(giftData);
            log(`--- Finished GIFT Parsing: ${questions.length} questions parsed ---`);

            if (questions.length === 0) {
                throw new Error("No questions parsed from the GIFT file. Check file format and content.");
            }

            // Generate HTML structure for questions
            generateQuizHTML(contentDiv);

            // Hide loading, show content
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'block';

            // Get attempts setting AFTER parsing questions
            // Use window property set in the HTML
            const settingFromWindow = window.MCQ_ATTEMPTS_SETTING;
            log(`ATTEMPTS DEBUG (loadQuiz fetch): Raw attempts setting from window: ${settingFromWindow}`);

            if (typeof settingFromWindow === 'number' && settingFromWindow > 0) {
                maxAttempts = settingFromWindow;
            } else if (settingFromWindow === 'unlimited') {
                maxAttempts = Infinity;
            } else {
                maxAttempts = 1; // Default to 1 if invalid or not set
                log(`ATTEMPTS WARNING: Invalid or missing MCQ_ATTEMPTS_SETTING. Defaulting to ${maxAttempts} attempt.`);
            }
            log(`ATTEMPTS DEBUG (loadQuiz fetch): Using attempts setting: ${maxAttempts === Infinity ? 'unlimited' : maxAttempts}`);

            // Reset state and UI for the first load or retry
            // Use a small timeout to ensure SCORM init has a chance to run
            setTimeout(() => {
                 log("ATTEMPTS DEBUG: loadQuiz (setTimeout) - Attempting to get settings.");
                 // Re-check global setting in case it was delayed
                 const currentSetting = window.MCQ_ATTEMPTS_SETTING;
                 log(`ATTEMPTS DEBUG: loadQuiz (setTimeout) - Using global attemptsSetting: ${currentSetting} (Type: ${typeof currentSetting})`);
                 if (typeof currentSetting === 'number' && currentSetting > 0) {
                     maxAttempts = currentSetting;
                 } else if (currentSetting === 'unlimited') {
                     maxAttempts = Infinity;
                 } // else keep previous default or value
                 log(`ATTEMPTS DEBUG: loadQuiz (setTimeout) - Final maxAttempts: ${maxAttempts === Infinity ? 'unlimited' : maxAttempts}`);

                 resetQuizInternalState(); // Reset scores, answers, UI elements
                 log("ATTEMPTS DEBUG: loadQuiz (setTimeout) - Calling disableRetryIfNeeded AFTER resetQuizInternalState");
                 disableRetryIfNeeded(); // Update button state based on attempts

                 // Update attempts display right after reset
                 log("ATTEMPTS DEBUG: loadQuiz (setTimeout 200ms) - Calling updateAttemptsInfo");
                 updateAttemptsInfo();

                 // --- Initial SCORM Status Handling ---
                 // Moved this block here to ensure it runs *after* SCORM init attempt and quiz reset
                 if (window.SCORM && window.SCORM.connectionActive) {
                     const initialStatus = window.SCORM.get("cmi.core.lesson_status");
                     log(`MCQ: Initial SCORM status is '${initialStatus}'.`);
                     // If the status is 'not attempted' or null/empty (which might happen on first launch), set to 'incomplete'.
                     if (initialStatus === "not attempted" || initialStatus === null || initialStatus === "") {
                         log("MCQ: Setting SCORM status to 'incomplete'.");
                         if (!window.SCORM.set("cmi.core.lesson_status", "incomplete")) {
                              log("MCQ: Failed to set initial status to 'incomplete'.");
                         }
                         // Commit this initial status change
                         if (!window.SCORM.save()) {
                              log("MCQ: Failed to commit initial 'incomplete' status.");
                         }
                     }
                 } else {
                     log("MCQ: SCORM API not active during loadQuiz. Running in non-SCORM mode.");
                 }
                 // --- End Initial SCORM Status Handling ---

                 // Display the first question
                 showFirstQuestion();

            }, 200); // 200ms delay

        })
        .catch(error => {
            log(`Error loading or parsing quiz: ${error.message}`);
            console.error("Quiz Loading Error:", error); // Keep detailed console error
            displayError(`Failed to load quiz: ${error.message}. Please check the GIFT file path and format.`);
            loadingDiv.style.display = 'none'; // Hide loading on error
        });
}

// --- parseGIFT function remains the same as before ---
function parseGIFT(giftText) {
  const questions = [];
  const blocks = giftText.split(/\n\s*\n/).filter(block => block.trim() !== '');
  console.log(`parseGIFT: Found ${blocks.length} potential question blocks.`); // <-- ADD LOG

  blocks.forEach((block, index) => {
    block = block.trim();
     const questionRegex = /^(?:::(.*?)::)?\s*(.*?)\s*\{(.*?)\}(?:####\\s*(.*))?/s; // Adjusted regex slightly for feedback
     const match = block.match(questionRegex);

    if (match) {
      const title = match[1] ? match[1].trim() : `Question ${index + 1}`;
      let text = match[2] ? match[2].trim().replace(/\\([{}~=:#])/g, '$1') : '';
      const choicesText = match[3] ? match[3].trim() : '';
      const extraText = match[4] ? match[4].trim() : '';

      const choices = [];
      let correctAnswers = [];
      let explanation = '';

      const feedbackRegex = /####\[Global Feedback\]\s*([\s\S]*?)(?=\s*\[Source|\s*$)/;
      const feedbackMatch = extraText.match(feedbackRegex);
      if(feedbackMatch) {
          explanation = feedbackMatch[1].trim();
      }

      const choiceRegex = /([=~])\s*(.*?)(?=\s*[=~]\s*|#|####|\[Source|})/gs;
      let choiceMatch;
      while ((choiceMatch = choiceRegex.exec(choicesText)) !== null) {
          const type = choiceMatch[1];
          let choiceText = choiceMatch[2].trim().replace(/#.*/, '').trim();
          choiceText = choiceText.replace(/\\([{}~=:#])/g, '$1');

          const isCorrect = type === '=';
          if (choiceText) {
              choices.push({ text: choiceText, correct: isCorrect });
              if (isCorrect) {
                  correctAnswers.push(choiceText);
              }
          }
      }

      if (text && choices.length > 0) {
        if (!explanation && correctAnswers.length > 0) {
           explanation = `Correct answer${correctAnswers.length > 1 ? 's' : ''}: ${correctAnswers.join(', ')}`;
        } else if (!explanation) {
           explanation = "No explanation provided.";
        }

        questions.push({
          id: `q${index}`, // Use block index for consistent ID regardless of skips
          title: title,
          text: text,
          choices: choices,
          explanation: explanation,
          type: 'mcq'
        });
        console.log(`parseGIFT: Successfully parsed question from block ${index + 1} (assigned id: q${index})`); // <-- ADD LOG
      } else {
         console.warn(`Skipping block ${index + 1}: Could not parse valid question text or choices. Block content:\n${block}`);
      }
    } else {
      console.warn(`Skipping block ${index + 1}: Does not match basic GIFT question structure. Block content:\n${block}`);
    }
  });
  console.log(`parseGIFT: Returning ${questions.length} successfully parsed questions.`); // <-- ADD LOG
  return questions;
}


// *** Modified generateQuizHTML ***
function generateQuizHTML(questions) {
  const quizContentDiv = document.getElementById('quiz-content');
  if (!quizContentDiv) {
      console.error("Quiz content container 'quiz-content' not found.");
      return;
  }
  quizContentDiv.innerHTML = ''; // Clear previous content

  questions.forEach((q, index) => {
    const pageDiv = document.createElement('div');
    pageDiv.id = q.id;
    // Add question-page class, but CSS will control initial visibility/layout
    pageDiv.className = 'question-page';
    pageDiv.style.display = 'none'; // Initially hide all question pages

    // Question Title (Optional)
    const titleElement = document.createElement('h3');
    titleElement.textContent = q.title;
    pageDiv.appendChild(titleElement);

    // Question Text
    const questionTextElement = document.createElement('p');
    // Use innerHTML if the text might contain simple HTML like bold/italics,
    // otherwise textContent is safer. Assuming plain text for now.
    questionTextElement.textContent = q.text;
    pageDiv.appendChild(questionTextElement);

    // Choices
    const choicesDiv = document.createElement('div');
    choicesDiv.className = 'choices';
    q.choices.forEach((choice, choiceIndex) => {
      const choiceId = `${q.id}_${choiceIndex}`;
      const choiceContainer = document.createElement('div');
      choiceContainer.className = 'choice';

      const input = document.createElement('input');
      input.type = 'radio'; // Assuming single choice MCQ for now
      input.name = q.id; // Group radio buttons for the same question
      input.id = choiceId;
      input.value = choice.text;
      // Add data attribute to easily find correct answer later if needed for review
      if (choice.correct) {
          input.dataset.correct = "true";
      }

      const label = document.createElement('label');
      label.htmlFor = choiceId;
      label.textContent = choice.text;

      choiceContainer.appendChild(input);
      choiceContainer.appendChild(label);
      choicesDiv.appendChild(choiceContainer);
    });
    pageDiv.appendChild(choicesDiv);

    // Explanation (Initially hidden, shown on review or after answering)
    const explanationDiv = document.createElement('div');
    explanationDiv.id = `${q.id}-explanation`;
    explanationDiv.className = 'explanation';
    explanationDiv.style.display = 'none'; // Hide initially
    explanationDiv.innerHTML = `<p><strong>Explanation:</strong> ${q.explanation}</p>`; // Use innerHTML as explanation might have formatting
    pageDiv.appendChild(explanationDiv);


    // Navigation Button
    const isLastQuestion = index === questions.length - 1;
    const nextButtonId = isLastQuestion ? 'summary' : questions[index + 1].id;
    const nextButtonText = isLastQuestion ? 'Show Summary' : 'Next Question';

    const button = document.createElement('button');
    button.className = 'next-button';
    button.textContent = nextButtonText;
    // Use an event listener instead of inline onclick for better practice
    button.addEventListener('click', () => handleNextClick(q.id, nextButtonId));
    pageDiv.appendChild(button);


    // Append the complete question page to the main content area
    quizContentDiv.appendChild(pageDiv);
  });

   // Ensure the summary page (already in HTML) is also hidden initially
   const summaryPage = document.getElementById('summary');
   if (summaryPage) {
       summaryPage.style.display = 'none';
   }

  console.log("generateQuizHTML: Finished generating HTML structure.");
}

// --- handleNextClick, showNextPage, evaluateAnswer, showSummary remain the same ---
// They operate within the interactive mode logic.

function evaluateAnswer(questionId) {
    const question = questionsData.find(q => q.id === questionId);
    if (!question) return;
    const selectedChoiceInput = document.querySelector(`input[name="${questionId}"]:checked`);
    const choiceElements = document.querySelectorAll(`#${questionId} .choice`); // Get all choice containers
    // Clear previous feedback classes
    choiceElements.forEach(el => {
        el.classList.remove('correct-answer', 'incorrect-answer', 'missed-answer');
    });
    // Initialize userAnswers entry if it doesn't exist
    if (!userAnswers[questionId]) {
        userAnswers[questionId] = { attempts: 0 };
    }

    if (selectedChoiceInput) {
        const selectedValue = selectedChoiceInput.value;
        const isCorrect = selectedChoiceInput.dataset.correct === "true";

        // Increment attempts each time the user answers this question
        userAnswers[questionId].attempts = (userAnswers[questionId].attempts || 0) + 1;
        userAnswers[questionId].selected = selectedValue;
        userAnswers[questionId].correct = isCorrect;

        console.log(`evaluateAnswer ${questionId}: User selected '${userAnswers[questionId].selected}', Correct: ${isCorrect}, Attempts: ${userAnswers[questionId].attempts}`);

        // Apply feedback classes
        choiceElements.forEach(choiceEl => {
            const input = choiceEl.querySelector('input');
            const label = choiceEl.querySelector('label');
            if (!input || !label) return;

            const isThisChoiceCorrect = input.dataset.correct === "true";

            if (input === selectedChoiceInput) { // The one the user picked
                choiceEl.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');
            } else if (isThisChoiceCorrect && !isCorrect) { // Highlight the actual correct one if user was wrong
                choiceEl.classList.add('missed-answer');
            }
        });

        // Optional: Show explanation immediately
        const explanationDiv = document.getElementById(`${questionId}-explanation`);
        if (explanationDiv) explanationDiv.style.display = 'block';

        // Disable inputs for this question after answering
        const inputs = document.querySelectorAll(`input[name="${questionId}"]`);
        inputs.forEach(input => input.disabled = true);

    } else {
        // Handle case where no answer was selected
        userAnswers[questionId].selected = null;
        userAnswers[questionId].correct = false;
        // Do not increment attempts if no answer selected
        console.log(`evaluateAnswer ${questionId}: No answer selected.`);
    }
}


function handleNextClick(currentId, nextId) {
  console.log(`handleNextClick: currentId=${currentId}, nextId=${nextId}`);
  // Evaluate the answer for the current question *before* moving on
  if (currentId && questionsData.some(q => q.id === currentId)) {
      evaluateAnswer(currentId);
  }

  // Update the index *before* showing the next page
  if (nextId !== 'summary') {
      // Find the index corresponding to the nextId
      const nextIndex = questionsData.findIndex(q => q.id === nextId);
      if (nextIndex !== -1) {
          currentQuestionIndex = nextIndex; // Update the global index
          console.log(`handleNextClick: Updated currentQuestionIndex to ${currentQuestionIndex}`);
      } else {
          console.error(`handleNextClick: Could not find index for nextId ${nextId}`);
          // Go to summary if next question ID is invalid
          nextId = 'summary';
      }
  }
  // No need to change currentQuestionIndex if going to summary

  // Now show the next page (question or summary)
  showNextPage(currentId, nextId);
}

function showNextPage(currentId, nextId) {
  console.log(`showNextPage: Hiding ${currentId}, Showing ${nextId}`);
  const currentPage = document.getElementById(currentId);
  const nextPage = document.getElementById(nextId);
  const quizContentDiv = document.getElementById('quiz-content'); // Get the content container

  if (currentPage) {
    currentPage.style.display = 'none';
  } else if (currentId) {
      console.warn(`showNextPage: Current page element with id '${currentId}' not found.`);
  }

  if (nextPage) {
    if (nextId === 'summary') {
      console.log("showNextPage: Preparing to show summary.");
      showSummary(); // Calculate and populate score/review
      if (quizContentDiv) {
          quizContentDiv.style.minHeight = 'auto';
          console.log("showNextPage: Set quiz-content minHeight to auto for summary.");
      }
      updateAttemptsInfo();
    } else {
        showRetryHints(nextId); // Always show previous answer highlight for every question
        updateAttemptsInfo();
    }
    nextPage.style.display = 'block';
  } else {
    console.error(`showNextPage: Next page element with id '${nextId}' not found.`);
  }
}

function showSummary() {
    log("showSummary: Calculating score and generating high-level summary.");
    const reviewDiv = document.getElementById('review');
    const scoreDiv = document.getElementById('score');
    reviewDiv.innerHTML = ''; // Clear previous review content

    let correctAnswers = 0;
    questions.forEach((q, index) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer && userAnswer.isCorrect;
        if (isCorrect) {
            correctAnswers++;
        }
        // Add review item regardless of correctness
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${q.text}</p>
            <p><em>Your answer:</em> ${userAnswer ? userAnswer.text : 'Not answered'} (${isCorrect ? 'Correct' : 'Incorrect'})</p>
            ${!isCorrect && q.feedback ? `<p style="color: #d9534f;"><em>Feedback:</em> ${q.feedback}</p>` : ''}
            <hr>
        `;
        reviewDiv.appendChild(reviewItem);
    });

    const totalQuestions = questions.length;
    // Ensure totalQuestions is not zero to avoid division by zero
    const finalScorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    // Use Math.round to avoid floating point issues if needed, though percentage should be fine
    const finalScore = Math.round(finalScorePercentage); // Report score as 0-100

    scoreDiv.innerHTML = `You answered ${correctAnswers} out of ${totalQuestions} questions correctly. (${finalScore}%)`;

    // --- SCORM Reporting ---
    log("MCQ: Reporting score and status to SCORM.");
    if (window.SCORM && window.SCORM.connectionActive) {
        // 1. Report Score (Raw, Min, Max)
        // Ensure score is reported as a number between 0 and 100
        const scoreReported = window.SCORM.set("cmi.core.score.raw", finalScore.toString()); // SCORM 1.2 expects strings
        const minReported = window.SCORM.set("cmi.core.score.min", "0");
        const maxReported = window.SCORM.set("cmi.core.score.max", "100");

        if (scoreReported && minReported && maxReported) {
             log(`MCQ: Sent score to SCORM: raw=${finalScore}, min=0, max=100`);
        } else {
             log("MCQ: Failed to send score details to SCORM.");
             // Log specific failures if possible
             if (!scoreReported) log("MCQ: Failed to set cmi.core.score.raw");
             if (!minReported) log("MCQ: Failed to set cmi.core.score.min");
             if (!maxReported) log("MCQ: Failed to set cmi.core.score.max");
        }


        // 2. Determine Lesson Status (Passed/Failed) based on Mastery Score
        const masteryScore = typeof window.MCQ_MASTERY_SCORE === 'number' ? window.MCQ_MASTERY_SCORE * 100 : 80; // Default to 80% if not set
        let lessonStatus = "failed"; // Default to failed
        if (finalScore >= masteryScore) {
            lessonStatus = "passed";
        }
        // Also set completion status to 'completed' here, as reaching the summary means completion.
        const completionSet = window.SCORM.set("cmi.core.lesson_status", "completed"); // Set completion first
        if (!completionSet) {
             log("MCQ: Failed to set cmi.core.lesson_status to 'completed'.");
        }

        // Now set the success status (passed/failed) - SCORM 1.2 uses lesson_status for this.
        log(`MCQ: Setting SCORM status to '${lessonStatus}' (Mastery: ${masteryScore}%, Score: ${finalScore}%)`);
        const statusSet = window.SCORM.set("cmi.core.lesson_status", lessonStatus);

        if (!statusSet) {
            log(`MCQ: Failed to set final SCORM lesson_status to '${lessonStatus}'.`);
        }

        // 3. Commit changes
        if (window.SCORM.save()) {
            log("MCQ: Committed SCORM data.");
        } else {
            log("MCQ: Failed to commit SCORM data.");
        }

    } else {
        log("MCQ: SCORM API not active. Skipping score/status reporting.");
    }
    // --- End SCORM Reporting ---

    // Increment attempt count and update display/retry button state
    attemptCount++;
    log(`ATTEMPTS DEBUG: showSummary - calling updateAttemptsInfo. maxAttempts=${maxAttempts}, attemptCount=${attemptCount}`);
    updateAttemptsInfo(); // Update display after incrementing
    disableRetryIfNeeded(); // Disable button if attempts exhausted

}

// Store previous attempt for retry assistance
let previousAnswers = {};

// Renamed resetQuiz to avoid confusion with the button click handler
// This function ONLY resets the internal state and UI elements, not attempt counts/info
function resetQuizInternalState() {
  console.log("resetQuizInternalState: Resetting quiz state (scores, answers, UI).");
  previousAnswers = { ...userAnswers };
  score = 0;
  // Do NOT reset attempts to 0; keep existing attempts or initialize if missing
  userAnswers = {};
  questionsData.forEach(q => {
    userAnswers[q.id] = { attempts: previousAnswers[q.id]?.attempts || 0 };
  });
  attemptsSetting = typeof window.MCQ_ATTEMPTS_SETTING !== 'undefined' ? window.MCQ_ATTEMPTS_SETTING : 'unlimited';
  console.log("ATTEMPTS DEBUG (resetQuiz): Resetting quiz. Using attempts setting:", attemptsSetting);

  const quizContentDiv = document.getElementById('quiz-content');
  const pages = document.querySelectorAll('.mcq-container .question-page');
  pages.forEach(page => { page.style.display = 'none'; });
  const summaryPage = document.getElementById('summary');
  if (summaryPage) summaryPage.style.display = 'none';
  if (quizContentDiv) quizContentDiv.style.minHeight = '500px';

  const scoreDiv = document.getElementById('score');
  const reviewDiv = document.getElementById('review');
  if (scoreDiv) scoreDiv.textContent = '';
  if (reviewDiv) reviewDiv.innerHTML = '';

  questionsData.forEach(q => {
    const inputs = document.querySelectorAll(`input[name="${q.id}"]`);
    inputs.forEach(input => {
      input.disabled = false;
      input.checked = false;
      const label = input.parentElement.querySelector('label');
      if (label) {
        if (label.dataset.originalText) {
          label.innerHTML = label.dataset.originalText;
        }
        label.classList.remove('prev-correct', 'prev-incorrect');
      }
    });
    const explanationDiv = document.getElementById(`${q.id}-explanation`);
    if (explanationDiv) explanationDiv.style.display = 'none';
    const choiceElements = document.querySelectorAll(`#${q.id} .choice`);
    choiceElements.forEach(el => {
      el.classList.remove('correct-answer', 'incorrect-answer', 'missed-answer');
    });
  });
  if (questionsData.length > 0) {
    showRetryHints(questionsData[0].id);
  }
}

// Function to show the first question (called from loadQuiz and handleRetryClick)
function showFirstQuestion() {
  if (questionsData.length > 0) {
    const firstQuestionId = questionsData[0].id;
    const firstPage = document.getElementById(firstQuestionId);
    if (firstPage) {
      firstPage.style.display = 'block';
      showRetryHints(firstQuestionId); // Show hints if applicable on retry
      console.log(`showFirstQuestion: Displaying first question: ${firstQuestionId}`);
    } else {
      console.error(`showFirstQuestion: First question page element '${firstQuestionId}' not found.`);
    }
  } else {
    console.log("showFirstQuestion: No questions loaded.");
  }
}

// This function handles the RETRY BUTTON click
function handleRetryClick() {
  console.log("ATTEMPTS DEBUG: handleRetryClick - Retry button clicked.");
  // 1. Increment attempt count
  if (attemptCount === undefined) attemptCount = 1;
  else attemptCount++;
  console.log(`ATTEMPTS DEBUG: handleRetryClick - Incremented attemptCount to ${attemptCount}`);

  // 2. Reset internal state and UI
  resetQuizInternalState();

  // 3. Update button state FIRST
  console.log("ATTEMPTS DEBUG: handleRetryClick - Calling disableRetryIfNeeded");
  disableRetryIfNeeded();

  // 4. Update attempt info display LAST, with a slightly longer delay
  setTimeout(() => {
      console.log("ATTEMPTS DEBUG: handleRetryClick (setTimeout 200ms) - Calling updateAttemptsInfo");
      updateAttemptsInfo();
  }, 200); // Increased delay to 200ms

  // 5. Show the first question again
  showFirstQuestion();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Use setTimeout to ensure the script is fully parsed, especially in SCORM environments
    setTimeout(() => {
        // Attach the retry handler to the button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            // Remove existing inline onclick if present
            retryBtn.removeAttribute('onclick');
            retryBtn.addEventListener('click', handleRetryClick);
            console.log("Attached handleRetryClick to retry button.");
        } else {
            console.error("Retry button (#retry-btn) not found during initialization.");
        }
        // Load the quiz data - the attempt setting part is now delayed inside loadQuiz
        // Check if loadQuiz is actually defined before calling
        if (typeof loadQuiz === 'function') {
            loadQuiz();
        } else {
            console.error("loadQuiz function is not defined when DOMContentLoaded listener executed (inside setTimeout). Check script loading.");
            // Optionally display an error to the user in the #quiz-error div
            const errorDiv = document.getElementById('quiz-error');
            if(errorDiv) {
                 errorDiv.textContent = "Error initializing quiz. The loadQuiz function was not found. Please check the browser console.";
                 errorDiv.style.display = 'block';
                 const loadingDiv = document.getElementById('quiz-loading');
                 if(loadingDiv) loadingDiv.style.display = 'none';
            }
        }
    }, 0); // Delay of 0 milliseconds
});