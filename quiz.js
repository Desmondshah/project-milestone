const quizForm = document.getElementById("quiz-form");
const resultsPanel = document.getElementById("quiz-results");
const questionFiveError = document.getElementById("question5-error");

// Central answer key keeps the grading logic easy to maintain.
const answerKey = {
  question1: "viewport",
  question2: "Using a logical heading hierarchy",
  question3: "CSS Grid with minmax() tracks",
  question4: "CLS",
  question5: [
    "Setting image width and height",
    "Using semantic HTML",
    "Writing clear form labels"
  ]
};

const questionPrompts = {
  question1: "The responsive meta tag that tells mobile browsers to match the device width is named ____.",
  question2: "Which choice most directly helps screen reader users understand page structure?",
  question3: "Which CSS idea is most closely connected to creating flexible columns that adapt to available space?",
  question4: "Which Core Web Vitals metric measures unexpected visual movement while a page loads?",
  question5: "Which practices improve site quality based on the research in this project?"
};

function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ");
}

function arraysMatch(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function getSelectedCheckboxValues() {
  return Array.from(quizForm.querySelectorAll('input[name="question5"]:checked'))
    .map((input) => input.value)
    .sort();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isCorrectTextAnswer(value) {
  const normalized = normalizeText(value);
  return normalized === "viewport" || normalized === "meta viewport";
}

function createResultMarkup(resultItems) {
  return resultItems.map((item) => `
    <li class="result-item ${item.isCorrect ? "correct" : "incorrect"}">
      <h3>${escapeHtml(item.label)}</h3>
      <p><strong>Question:</strong> ${escapeHtml(item.prompt)}</p>
      <p><strong>Your answer:</strong> ${escapeHtml(item.userAnswer)}</p>
      <p><strong>Correct answer:</strong> ${escapeHtml(item.correctAnswer)}</p>
      <p><strong>Result:</strong> ${item.isCorrect ? "Correct" : "Incorrect"} (${item.score}/1)</p>
    </li>
  `).join("");
}

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  questionFiveError.hidden = true;

  if (!quizForm.reportValidity()) {
    return;
  }

  const selectedCheckboxes = getSelectedCheckboxValues();
  if (selectedCheckboxes.length === 0) {
    questionFiveError.hidden = false;
    quizForm.querySelector('input[name="question5"]').focus();
    return;
  }

  const textAnswer = quizForm.question1.value;
  const questionTwoAnswer = quizForm.querySelector('input[name="question2"]:checked').value;
  const questionThreeAnswer = quizForm.querySelector('input[name="question3"]:checked').value;
  const questionFourAnswer = quizForm.querySelector('input[name="question4"]:checked').value;
  const questionOneCorrect = isCorrectTextAnswer(textAnswer);
  const questionFiveCorrect = arraysMatch(selectedCheckboxes, answerKey.question5);
  const results = [
    {
      label: "Question 1",
      prompt: questionPrompts.question1,
      userAnswer: textAnswer.trim() || "No answer",
      correctAnswer: "viewport",
      isCorrect: questionOneCorrect,
      score: questionOneCorrect ? 1 : 0
    },
    {
      label: "Question 2",
      prompt: questionPrompts.question2,
      userAnswer: questionTwoAnswer,
      correctAnswer: answerKey.question2,
      isCorrect: questionTwoAnswer === answerKey.question2,
      score: questionTwoAnswer === answerKey.question2 ? 1 : 0
    },
    {
      label: "Question 3",
      prompt: questionPrompts.question3,
      userAnswer: questionThreeAnswer,
      correctAnswer: answerKey.question3,
      isCorrect: questionThreeAnswer === answerKey.question3,
      score: questionThreeAnswer === answerKey.question3 ? 1 : 0
    },
    {
      label: "Question 4",
      prompt: questionPrompts.question4,
      userAnswer: questionFourAnswer,
      correctAnswer: answerKey.question4,
      isCorrect: questionFourAnswer === answerKey.question4,
      score: questionFourAnswer === answerKey.question4 ? 1 : 0
    },
    {
      label: "Question 5",
      prompt: questionPrompts.question5,
      userAnswer: selectedCheckboxes.join(", "),
      correctAnswer: answerKey.question5.join(", "),
      isCorrect: questionFiveCorrect,
      score: questionFiveCorrect ? 1 : 0
    }
  ];

  const totalScore = results.reduce((sum, item) => sum + item.score, 0);
  const passed = totalScore >= 4;

  resultsPanel.innerHTML = `
    <div class="results-summary">
      <div>
        <h2>Quiz Results</h2>
        <p class="lead">Your score has been calculated below. Review each answer before you retake the quiz.</p>
      </div>
      <div>
        <span class="score-badge">Total score: ${totalScore} / ${results.length}</span>
        <span class="status-badge ${passed ? "pass" : "fail"}">${passed ? "Pass" : "Fail"}</span>
      </div>
    </div>
    <ul class="results-list">
      ${createResultMarkup(results)}
    </ul>
  `;
  resultsPanel.hidden = false;
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

quizForm.addEventListener("reset", () => {
  questionFiveError.hidden = true;
  resultsPanel.hidden = true;
  resultsPanel.innerHTML = "";
});
