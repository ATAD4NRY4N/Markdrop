# {{TITLE}}

<div class="mcq-container">

{{QUESTIONS}}

</div>

<script>
  let score = 0;
  const questions = Array.from(document.querySelectorAll('.question-page:not(#summary)')).map(el => el.id);
  const answers = {};
  const userAnswers = {};
  const answeredQuestions = new Set(); // Track answered questions

  function nextQuestion(currentId, nextId) {
    showAnswer(currentId);
    document.getElementById(currentId).classList.remove('visible');
    document.getElementById(nextId).classList.add('visible');

    if (nextId === 'summary') {
      showSummary();
    }
  }

  function resetQuiz() {
    // Reset score
    score = 0;
    
    // Clear answered questions tracking
    answeredQuestions.clear();
    
    // Clear user answers
    for (const qId of questions) {
      userAnswers[qId] = [];
    }
    
    // Reset all visual indicators and form elements
    document.querySelectorAll('.choice').forEach(choice => {
      choice.classList.remove('correct-answer', 'incorrect-answer', 'missed-answer');
      
      const input = choice.querySelector('input');
      if (input) {
        input.checked = false;
      }
    });
    
    // Reset text inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
      input.value = '';
      input.classList.remove('correct-answer', 'incorrect-answer');
    });
    
    // Reset select dropdowns
    document.querySelectorAll('select').forEach(select => {
      select.selectedIndex = 0;
      select.classList.remove('correct-answer', 'incorrect-answer');
    });
    
    // Show the first question
    document.querySelectorAll('.question-page').forEach(page => {
      page.classList.remove('visible');
    });
    if (questions.length > 0) {
      document.getElementById(questions[0]).classList.add('visible');
    }
  }

  function showAnswer(questionId) {
    if (answeredQuestions.has(questionId)) return; // Prevent double scoring
    answeredQuestions.add(questionId); // Mark question as answered

    const question = document.getElementById(questionId);
    const choices = question.querySelectorAll('.choice');
    const textInput = question.querySelector('input[type="text"]');
    const matchPairs = question.querySelectorAll('.match-pair');
    let questionCorrect = false; // Flag to track if the question was answered correctly

    userAnswers[questionId] = []; // Initialize user answers for this question

    // Handle multiple choice questions
    if (choices.length > 0) {
      let allCorrect = true; // Assume all chosen answers are correct initially
      let hasSelection = false; // Check if user made any selection
      
      // Check for checkboxes (multiple answers allowed)
      const isMultipleAnswer = question.querySelectorAll('input[type="checkbox"]').length > 0;
      
      if (isMultipleAnswer) {
        // For checkbox questions, verify all correct options are selected and no incorrect ones
        let correctOptionsSelected = true;
        let incorrectOptionsSelected = false;
        
        choices.forEach(choice => {
          const inputElement = choice.querySelector('input');
          const isSelected = inputElement.checked;
          const shouldBeSelected = choice.dataset.correct === 'true';
          
          if (isSelected) {
            hasSelection = true;
            userAnswers[questionId].push(choice.querySelector('label').textContent);
            
            // Mark visually
            if (shouldBeSelected) {
              choice.classList.add('correct-answer');
            } else {
              choice.classList.add('incorrect-answer');
              incorrectOptionsSelected = true;
            }
          } else if (shouldBeSelected) {
            // User missed a correct option
            correctOptionsSelected = false;
            choice.classList.add('missed-answer');
          }
        });
        
        if (correctOptionsSelected && !incorrectOptionsSelected && hasSelection) {
          score++;
          questionCorrect = true;
        }
      } else {
        // For radio button questions (single answer)
        choices.forEach(choice => {
          const inputElement = choice.querySelector('input');
          if (inputElement.checked) {
            hasSelection = true;
            userAnswers[questionId].push(choice.querySelector('label').textContent);
            if (choice.dataset.correct === 'true') {
              choice.classList.add('correct-answer');
              allCorrect = true;
            } else {
              choice.classList.add('incorrect-answer');
              allCorrect = false;
            }
          } else if (choice.dataset.correct === 'true') {
            // Highlight the correct answer if user got it wrong
            choice.classList.add('missed-answer');
          }
        });
        
        if (allCorrect && hasSelection) {
          score++;
          questionCorrect = true;
        }
      }
    }

    // Handle text input questions
    if (textInput) {
      userAnswers[questionId] = textInput.value;
      if (textInput.value === textInput.dataset.correct) {
        textInput.classList.add('correct-answer');
        score++;
        questionCorrect = true;
      } else {
        textInput.classList.add('incorrect-answer');
      }
    }

    // Handle matching questions
    if (matchPairs.length > 0) {
      let allMatchesCorrect = true;
      userAnswers[questionId] = [];
      
      matchPairs.forEach(pair => {
        const selectElement = pair.querySelector('select');
        const selectedOption = selectElement.options[selectElement.selectedIndex].text;
        const correctValue = pair.dataset.correct;
        
        userAnswers[questionId].push({
          question: pair.querySelector('label').textContent,
          answer: selectedOption
        });
        
        if (selectElement.value !== correctValue) {
          selectElement.classList.add('incorrect-answer');
          allMatchesCorrect = false;
        } else {
          selectElement.classList.add('correct-answer');
        }
      });
      
      if (allMatchesCorrect) {
        score++;
        questionCorrect = true;
      }
    }
  }

  function showSummary() {
    const scoreDiv = document.getElementById('score');
    const reviewDiv = document.getElementById('review');
    scoreDiv.textContent = `Your score: ${score} out of ${questions.length}`;

    let review = '<div class="summary-content">';
    questions.forEach(qId => {
      const question = document.getElementById(qId);
      review += `<div class="summary-question">`;
      review += `<h4>${question.querySelector('h2').textContent}</h4>`;
      review += `<p class="question-text">${question.querySelector('p').textContent}</p>`;
      
      // Check if user answered this question
      if (!userAnswers[qId] || 
          (Array.isArray(userAnswers[qId]) && userAnswers[qId].length === 0)) {
        review += `<p class="unanswered">You did not answer this question.</p>`;
        
        // Show the correct answer anyway for unanswered questions
        if (question.querySelectorAll('.choice').length > 0) {
          // For multiple choice questions
          const correctChoices = [];
          question.querySelectorAll('.choice[data-correct="true"]').forEach(choice => {
            correctChoices.push(choice.querySelector('label').textContent);
          });
          
          review += `<p class="correct-answer-text">Correct answer: ${correctChoices.join(', ')}</p>`;
        } 
        else if (question.querySelector('input[type="text"]')) {
          // For text input questions
          const input = question.querySelector('input[type="text"]');
          review += `<p class="correct-answer-text">Correct answer: ${input.dataset.correct}</p>`;
        }
        else if (question.querySelectorAll('.match-pair').length > 0) {
          // For matching questions
          review += `<p class="correct-answer-text">Correct matches:</p><ul>`;
          question.querySelectorAll('.match-pair').forEach(pair => {
            const correctValue = pair.dataset.correct;
            const correctText = Array.from(pair.querySelector('select').options).find(opt => opt.value === correctValue).text;
            review += `<li>${pair.querySelector('label').textContent} → ${correctText}</li>`;
          });
          review += `</ul>`;
        }
      } 
      // Multiple choice questions (radio buttons or checkboxes)
      else if (question.querySelectorAll('.choice').length > 0) {
        const isMultipleAnswer = question.querySelectorAll('input[type="checkbox"]').length > 0;
        
        if (isMultipleAnswer) {
          // Multiple answer question (checkboxes)
          const selectedChoices = [];
          const correctChoices = [];
          
          question.querySelectorAll('.choice').forEach(choice => {
            if (choice.dataset.correct === 'true') {
              correctChoices.push(choice.querySelector('label').textContent);
            }
            
            const inputElement = choice.querySelector('input');
            if (inputElement.checked) {
              selectedChoices.push(choice.querySelector('label').textContent);
            }
          });
          
          const allCorrect = selectedChoices.length > 0 &&
                             correctChoices.every(item => selectedChoices.includes(item)) &&
                             selectedChoices.every(item => correctChoices.includes(item));
          
          if (allCorrect) {
            review += `<p class="correct">Your answer is correct ✅</p>`;
          } else {
            review += `<p class="incorrect">Your answer is incorrect ❌</p>`;
          }
          
          review += `<p>You selected: ${selectedChoices.length > 0 ? selectedChoices.join(', ') : 'Nothing'}</p>`;
          review += `<p class="correct-answer-text">Correct answers: ${correctChoices.join(', ')}</p>`;
        } else {
          // Single answer question (radio buttons)
          const selectedChoice = question.querySelector('.choice input:checked');
          if (selectedChoice) {
            const choice = selectedChoice.closest('.choice');
            const explanation = choice.dataset.explanation;
            
            if (choice.dataset.correct === 'true') {
              review += `<p class="correct">Your answer is correct ✅</p>`;
            } else {
              review += `<p class="incorrect">Your answer is incorrect ❌</p>`;
            }
            
            review += `<p>You selected: ${choice.querySelector('label').textContent}</p>`;
            review += `<p class="correct-answer-text">${explanation}</p>`;
          }
        }
      } 
      // Text input question
      else if (question.querySelector('input[type="text"]')) {
        const input = question.querySelector('input[type="text"]');
        const userAnswer = userAnswers[qId];
        const explanation = input.dataset.explanation;
        
        if (userAnswer === input.dataset.correct) {
          review += `<p class="correct">Your answer is correct ✅</p>`;
        } else {
          review += `<p class="incorrect">Your answer is incorrect ❌</p>`;
        }
        
        review += `<p>You answered: ${userAnswer}</p>`;
        review += `<p class="correct-answer-text">${explanation}</p>`;
      } 
      // Matching question
      else if (question.querySelectorAll('.match-pair').length > 0) {
        const answers = userAnswers[qId];
        let allCorrect = true;
        
        review += `<table class="matching-summary">`;
        review += `<tr><th>Item</th><th>Your Match</th><th>Correct Match</th><th>Result</th></tr>`;
        
        question.querySelectorAll('.match-pair').forEach((pair, index) => {
          const selectElement = pair.querySelector('select');
          const userSelection = answers[index] ? answers[index].answer : 'Not answered';
          const correctValue = pair.dataset.correct;
          const correctText = Array.from(selectElement.options).find(opt => opt.value === correctValue).text;
          const isCorrect = userSelection === correctText;
          
          if (!isCorrect) allCorrect = false;
          
          review += `<tr>
            <td>${pair.querySelector('label').textContent}</td>
            <td>${userSelection}</td>
            <td>${correctText}</td>
            <td>${isCorrect ? '✅' : '❌'}</td>
          </tr>`;
        });
        review += `</table>`;
        
        if (allCorrect) {
          review += `<p class="correct">All matches correct ✅</p>`;
        } else {
          review += `<p class="incorrect">Some matches incorrect ❌</p>`;
        }
      }
      
      review += `</div>`; // Close summary-question div
    });
    review += '</div>';

    reviewDiv.innerHTML = review;
  }
</script>
