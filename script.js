let quizData = [];

async function loadQuiz() {
  try {
    const response = await fetch('quiz.txt');
    const text = await response.text();

    quizData = text
      .trim()
      .split('\n\n')
      .map((block) => {
        const lines = block.split('\n');
        const number = lines[0].trim();
        const answer = lines[lines.length - 1].trim();
        const code = lines.slice(1, -1).join('\n').trim();
        return { number, code, answer };
      })
      .filter((item) => item.number && item.code && item.answer);

    renderQuiz();
  } catch (error) {
    document.getElementById('quiz-container').innerHTML = '<p>문제를 불러오지 못했습니다.</p>';
    console.error(error);
  }
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  quizData.forEach((item, index) => {
    const card = document.createElement('section');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div class="quiz-number">${escapeHtml(item.number)}</div>
      <div class="code-area">
        <pre class="code-block">${escapeHtml(item.code)}</pre>
      </div>
      <div class="answer-area">
        <div class="answer-label">정답</div>
        <div class="answer-input-wrap">
          <input
            type="text"
            class="answer-input"
            id="answer-${index}"
            placeholder="정답을 입력하세요"
            autocomplete="off"
          />
        </div>
        <div class="feedback" id="feedback-${index}"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function normalize(text) {
  return text.replace(/\s+/g, '').toLowerCase();
}

function submitQuiz() {
  let correctCount = 0;

  quizData.forEach((item, index) => {
    const input = document.getElementById(`answer-${index}`);
    const feedback = document.getElementById(`feedback-${index}`);
    const userAnswer = input.value.trim();
    const isCorrect = normalize(userAnswer) === normalize(item.answer);

    input.classList.remove('correct', 'wrong');
    feedback.classList.remove('correct', 'wrong');

    if (isCorrect) {
      correctCount += 1;
      input.classList.add('correct');
      feedback.classList.add('correct');
      feedback.textContent = '정답입니다.';
    } else {
      input.classList.add('wrong');
      feedback.classList.add('wrong');
      feedback.textContent = `오답입니다. 정답: ${item.answer}`;
    }
  });

  const score = Math.round((correctCount / quizData.length) * 100);
  const resultPanel = document.getElementById('result-panel');
  resultPanel.classList.remove('hidden');
  resultPanel.textContent = `총 ${quizData.length}문제 중 ${correctCount}문제 정답 / 점수 ${score}점`;
}

function resetQuiz() {
  quizData.forEach((_, index) => {
    const input = document.getElementById(`answer-${index}`);
    const feedback = document.getElementById(`feedback-${index}`);

    input.value = '';
    input.classList.remove('correct', 'wrong');
    feedback.textContent = '';
    feedback.classList.remove('correct', 'wrong');
  });

  const resultPanel = document.getElementById('result-panel');
  resultPanel.textContent = '';
  resultPanel.classList.add('hidden');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.getElementById('submit-btn').addEventListener('click', submitQuiz);
document.getElementById('retry-btn').addEventListener('click', resetQuiz);

loadQuiz();
