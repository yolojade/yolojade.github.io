const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzSmFxCQrjUVKcmq71o1C0d3sohaPRmf6qzRUug63eXJbB5Sg6BzHKdvRyyLpQWc4T5/exec";

let quizData = [];
let submitted = false;
let currentStudent = {
  studentId: "",
  studentName: "",
};

fetch("quiz.txt")
  .then((response) => {
    if (!response.ok) {
      throw new Error("quiz.txt 파일을 불러오지 못했습니다.");
    }
    return response.text();
  })
  .then((text) => {
    const normalizedText = text.replace(/\r/g, "").trim();
    const blocks = normalizedText.split(/\n\s*\n/).filter(Boolean);

    quizData = blocks.map((block) => {
      const lines = block.split("\n");
      const number = lines[0].trim();
      const separatorIndex = lines.indexOf("===");

      if (separatorIndex === -1) {
        throw new Error("각 문제에는 반드시 === 구분자가 있어야 합니다.");
      }

      const question = lines.slice(1, separatorIndex).join("\n").trim();
      const answer = lines
        .slice(separatorIndex + 1)
        .join("\n")
        .trim();

      return {
        number,
        question,
        answer,
        isCorrect: false,
      };
    });
  })
  .catch((error) => {
    document.getElementById("result").innerText = `오류: ${error.message}`;
  });

function startQuiz() {
  const studentId = document.getElementById("student-id").value.trim();
  const studentName = document.getElementById("student-name").value.trim();

  if (!studentId || !studentName) {
    alert("학번과 이름을 모두 입력하세요.");
    return;
  }

  currentStudent.studentId = studentId;
  currentStudent.studentName = studentName;

  document.getElementById("start-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";

  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  quizData.forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "question-box";

    box.innerHTML = `
      <div class="number-box">${escapeHtml(item.number)}</div>
      <pre>${escapeHtml(item.question)}</pre>
      <div class="answer-label">정답</div>
      <textarea id="answer-${index}" placeholder="정답을 입력하세요"></textarea>
      <div id="feedback-${index}" class="feedback"></div>
      <div id="correct-answer-${index}" class="correct-answer"></div>
    `;

    container.appendChild(box);
  });
}

function normalize(text) {
  return text.replace(/\r/g, "").trim().replace(/\s+/g, "").toLowerCase();
}

async function submitQuiz() {
  if (quizData.length === 0) {
    document.getElementById("result").innerText = "문제가 없습니다.";
    return;
  }

  let correct = 0;
  submitted = true;
  const wrongNumbers = [];

  quizData.forEach((item, index) => {
    const input = document.getElementById(`answer-${index}`);
    const feedback = document.getElementById(`feedback-${index}`);
    const correctAnswerBox = document.getElementById(`correct-answer-${index}`);

    const userAnswer = normalize(input.value);
    const correctAnswer = normalize(item.answer);

    if (userAnswer === correctAnswer) {
      item.isCorrect = true;
      correct += 1;
      feedback.innerText = "✅ 정답";
      feedback.style.color = "green";
    } else {
      item.isCorrect = false;
      wrongNumbers.push(item.number);
      feedback.innerText = "❌ 오답";
      feedback.style.color = "red";
    }

    correctAnswerBox.innerText = "";
  });

  const totalCount = quizData.length;
  const score = Math.round((correct / totalCount) * 100);

  document.getElementById("result").innerText =
    `점수: ${score}점 (${correct}/${totalCount} 정답)\n제출 기록 저장 중...`;

  try {
    const payload = {
      studentId: currentStudent.studentId,
      studentName: currentStudent.studentName,
      score,
      correctCount: correct,
      totalCount,
      wrongNumbers,
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById("result").innerText =
        `점수: ${score}점 (${correct}/${totalCount} 정답)\n제출 기록이 저장되었습니다.`;
    } else {
      document.getElementById("result").innerText =
        `점수: ${score}점 (${correct}/${totalCount} 정답)\n기록 저장 실패: ${result.message}`;
    }
  } catch (error) {
    document.getElementById("result").innerText =
      `점수: ${score}점 (${correct}/${totalCount} 정답)\n기록 저장 실패: ${error.message}`;
  }
}

function showAnswers() {
  if (!submitted) {
    document.getElementById("result").innerText = "먼저 제출하기를 눌러주세요.";
    return;
  }

  quizData.forEach((item, index) => {
    const correctAnswerBox = document.getElementById(`correct-answer-${index}`);

    if (!item.isCorrect) {
      correctAnswerBox.innerText = `정답:\n${item.answer}`;
    } else {
      correctAnswerBox.innerText = "";
    }
  });
}

function resetQuiz() {
  submitted = false;

  quizData.forEach((item, index) => {
    item.isCorrect = false;
    document.getElementById(`answer-${index}`).value = "";
    document.getElementById(`feedback-${index}`).innerText = "";
    document.getElementById(`correct-answer-${index}`).innerText = "";
  });

  document.getElementById("result").innerText = "";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
