const quizList = document.getElementById("quiz-list");

quizList.innerHTML = QUIZZES.map(
  (quiz) => `
    <a class="card" href="./quiz-test/quiz.html?id=${encodeURIComponent(quiz.id)}">
      <h2>${escapeHtml(quiz.title)}</h2>
      <p>${escapeHtml(quiz.description)}</p>
    </a>
  `,
).join("");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
