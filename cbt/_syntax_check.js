
      const EXCEL_FILE_PATH = "./data/problem-set.xlsx";
      const CBT_SUBMIT_URL =
        "https://script.google.com/macros/s/AKfycbw-_0ePwzhIjQpcNw64OBrhFzg7uqHvAhU30XfgDCDqTHzOgM1u4WdUppzyiZQnsmvJyg/exec"; // Apps Script 웹앱 배포 URL
      const ANSWER_STORAGE_PREFIX = "quiz_sheet_answers_v2_";
      const WRONG_STORAGE_PREFIX = "quiz_sheet_wrong_v2_";
      const RESULT_STORAGE_PREFIX = "quiz_sheet_result_v1_";

      const workbookStore = {
        workbook: null,
        sheetNames: [],
        currentSheet: "",
        quizData: [],
      };

      let currentIndex = 0;
      let userAnswers = [];
      let gradingDone = false;
      let explanationVisible = false;
      let answerVisible = false;
      let wrongVisible = false;
      let submitPending = false;
      let submitResult = null;

      const sheetSelect = document.getElementById("sheetSelect");
      const introScreen = document.getElementById("introScreen");
      const quizApp = document.getElementById("quizApp");
      const introNameInput = document.getElementById("introNameInput");
      const startQuizBtn = document.getElementById("startQuizBtn");
      const sheetInfo = document.getElementById("sheetInfo");
      const questionGrid = document.getElementById("questionGrid");
      const questionTitle = document.getElementById("questionTitle");
      const currentBadge = document.getElementById("currentBadge");
      const questionBox = document.getElementById("questionBox");
      const studentNameDisplay = document.getElementById("studentNameDisplay");
      const studentNameInput = document.getElementById("studentNameInput");
      const choiceList = document.getElementById("choiceList");
      const progressText = document.getElementById("progressText");
      const scoreText = document.getElementById("scoreText");
      const gradeResult = document.getElementById("gradeResult");
      const answerBox = document.getElementById("answerBox");
      const explainBox = document.getElementById("explainBox");
      const wrongSection = document.getElementById("wrongSection");
      const wrongSummary = document.getElementById("wrongSummary");
      const wrongList = document.getElementById("wrongList");
      const wrongExport = document.getElementById("wrongExport");
      const gradeBtn = document.getElementById("gradeBtn");
      const showAnswerBtn = document.getElementById("showAnswerBtn");
      const toggleExplainBtn = document.getElementById("toggleExplainBtn");
      const resetSheetBtn = document.getElementById("resetSheetBtn");
      const prevBtn = document.getElementById("prevBtn");
      const nextBtn = document.getElementById("nextBtn");
      const submitBtn = document.getElementById("submitBtn");
      const showWrongBtn = document.getElementById("showWrongBtn");
      const submitSection = document.getElementById("submitSection");
      const submitStatus = document.getElementById("submitStatus");
      const submitSummary = document.getElementById("submitSummary");
      const correctSummary = document.getElementById("correctSummary");
      const wrongSummaryServer = document.getElementById("wrongSummaryServer");
      const downloadResultBtn = document.getElementById("downloadResultBtn");

      function getAnswerStorageKey(sheetName) {
        return `${ANSWER_STORAGE_PREFIX}${sheetName}`;
      }

      function getWrongStorageKey(sheetName) {
        return `${WRONG_STORAGE_PREFIX}${sheetName}`;
      }

      function getResultStorageKey(sheetName) {
        return `${RESULT_STORAGE_PREFIX}${sheetName}`;
      }

      function getStudentNameStorageKey(sheetName) {
        return `${RESULT_STORAGE_PREFIX}student_name_${sheetName}`;
      }

      function updateSheetSelectAvailability() {
        const canSelectSheet =
          !!workbookStore.workbook &&
          workbookStore.sheetNames.length > 0 &&
          !!getStudentName();
        sheetSelect.disabled = !canSelectSheet;

        if (!canSelectSheet) {
          sheetSelect.value = "";
        }
      }

      function updateStudentNameViews() {
        const studentName = getStudentName();
        introNameInput.value = studentName;
        studentNameDisplay.textContent = studentName || "-";
        startQuizBtn.disabled = !studentName;
      }

      function showIntroScreen() {
        introScreen.classList.remove("hidden");
        quizApp.classList.add("hidden");
      }

      function showQuizApp() {
        introScreen.classList.add("hidden");
        quizApp.classList.remove("hidden");
      }

      function resetViewToggles() {
        answerVisible = false;
        explanationVisible = false;
        showAnswerBtn.textContent = "정답 보기";
        toggleExplainBtn.textContent = "해설 보기";
      }

      function setButtonsEnabled(enabled) {
        gradeBtn.disabled = !enabled;
        showAnswerBtn.disabled = !enabled;
        toggleExplainBtn.disabled = !enabled;
        resetSheetBtn.disabled = !enabled;
        resetSheetBtn.textContent = workbookStore.currentSheet
          ? `새로 ${workbookStore.currentSheet}`
          : "새로 시작";
        prevBtn.disabled = !enabled;
        nextBtn.disabled = !enabled;
        submitBtn.disabled = !enabled || !gradingDone || submitPending;
        submitBtn.textContent = submitPending ? "제출 중..." : "제출하기";
        showWrongBtn.disabled = !enabled || !gradingDone;
        showWrongBtn.textContent = wrongVisible
          ? "틀린 문제 숨기기"
          : "틀린 문제 보기";
        downloadResultBtn.disabled =
          !submitResult || !submitResult.success || submitPending;
      }

      function resetSubmissionState() {
        submitPending = false;
        submitResult = null;
      }

      function clearSavedProgressForSheet(sheetName) {
        if (!sheetName) return;
        localStorage.removeItem(getAnswerStorageKey(sheetName));
        localStorage.removeItem(getWrongStorageKey(sheetName));
        localStorage.removeItem(getResultStorageKey(sheetName));
        localStorage.removeItem(getStudentNameStorageKey(sheetName));
      }

      function restartCurrentSheet() {
        if (!workbookStore.currentSheet || !workbookStore.quizData.length)
          return;
        clearSavedProgressForSheet(workbookStore.currentSheet);
        userAnswers = new Array(workbookStore.quizData.length).fill(null);
        currentIndex = 0;
        gradingDone = false;
        wrongVisible = false;
        resetSubmissionState();
        resetViewToggles();
        render();
      }

      function getSolvedCount() {
        return userAnswers.filter((v) => v !== null).length;
      }

      function calculateGradeSummary() {
        const totalCount = workbookStore.quizData.length;
        const correctNumbers = [];
        const wrongNumbers = [];

        workbookStore.quizData.forEach((q, index) => {
          if (userAnswers[index] === q.answer) correctNumbers.push(q.number);
          else wrongNumbers.push(q.number);
        });

        return {
          totalCount,
          score: correctNumbers.length,
          correctCount: correctNumbers.length,
          wrongCount: wrongNumbers.length,
          correctNumbers,
          wrongNumbers,
        };
      }

      function parseSheetToQuizData(sheet) {
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        const parsed = [];

        for (let i = 0; i < rows.length; i += 1) {
          const row = rows[i];
          if (!row || row.every((cell) => String(cell).trim() === "")) continue;

          const firstCell = String(row[0] ?? "").trim();
          const secondCell = String(row[1] ?? "").trim();
          if (
            i === 0 &&
            /문제|question/i.test(firstCell) &&
            /보기|choice|선택지/i.test(secondCell)
          ) {
            continue;
          }

          const question = String(row[0] ?? "").trim();
          const c1 = String(row[1] ?? "").trim();
          const c2 = String(row[2] ?? "").trim();
          const c3 = String(row[3] ?? "").trim();
          const c4 = String(row[4] ?? "").trim();
          const answer = Number(row[5]);
          const explanation = String(row[6] ?? "").trim() || "해설 없음";

          if (
            !question ||
            !c1 ||
            !c2 ||
            !c3 ||
            !c4 ||
            ![1, 2, 3, 4].includes(answer)
          )
            continue;

          parsed.push({
            number: parsed.length + 1,
            question,
            choices: [c1, c2, c3, c4],
            answer,
            explanation,
          });
        }

        return parsed;
      }

      function loadAnswersForSheet(sheetName) {
        try {
          const saved = localStorage.getItem(getAnswerStorageKey(sheetName));
          const parsed = saved ? JSON.parse(saved) : [];
          userAnswers =
            Array.isArray(parsed) &&
            parsed.length === workbookStore.quizData.length
              ? parsed
              : new Array(workbookStore.quizData.length).fill(null);
          studentNameInput.value =
            localStorage.getItem(getStudentNameStorageKey(sheetName)) || "";
          updateStudentNameViews();
        } catch {
          userAnswers = new Array(workbookStore.quizData.length).fill(null);
          studentNameInput.value = "";
          updateStudentNameViews();
        }
      }

      function saveAnswersForSheet() {
        if (!workbookStore.currentSheet) return;
        localStorage.setItem(
          getAnswerStorageKey(workbookStore.currentSheet),
          JSON.stringify(userAnswers),
        );
      }

      function getStudentName() {
        return studentNameInput.value.trim();
      }

      function saveStudentNameForSheet() {
        const studentName = getStudentName();
        if (!workbookStore.currentSheet) {
          updateStudentNameViews();
          return;
        }
        if (!studentName) {
          localStorage.removeItem(
            getStudentNameStorageKey(workbookStore.currentSheet),
          );
          updateStudentNameViews();
          return;
        }
        localStorage.setItem(
          getStudentNameStorageKey(workbookStore.currentSheet),
          studentName,
        );
        updateStudentNameViews();
      }

      function buildWrongAnswerData() {
        return workbookStore.quizData
          .map((q, index) => ({
            question: q,
            userAnswer: userAnswers[index],
            index,
          }))
          .filter(
            (item) =>
              item.userAnswer === null ||
              item.userAnswer !== item.question.answer,
          )
          .map((item) => ({
            number: item.question.number,
            question: item.question.question,
            choices: item.question.choices,
            correctAnswer: item.question.answer,
            correctChoiceText: item.question.choices[item.question.answer - 1],
            userAnswer: item.userAnswer,
            userChoiceText:
              item.userAnswer === null
                ? "미응답"
                : item.question.choices[item.userAnswer - 1] || "미응답",
            explanation: item.question.explanation,
          }));
      }

      function saveWrongAnswerData(wrongData) {
        if (!workbookStore.currentSheet) return;
        localStorage.setItem(
          getWrongStorageKey(workbookStore.currentSheet),
          JSON.stringify(wrongData),
        );
      }

      function saveResultData(resultData) {
        if (!workbookStore.currentSheet) return;
        localStorage.setItem(
          getResultStorageKey(workbookStore.currentSheet),
          JSON.stringify(resultData),
        );
      }

      function buildSubmitReport(resultData, wrongData) {
        const lines = [
          `응시자: ${resultData.studentName || "이름 미입력"}`,
          `회차: ${workbookStore.currentSheet}`,
          `제출 시각: ${resultData.submittedAt}`,
          `점수: ${resultData.score} / ${resultData.totalCount}`,
          `정답: ${resultData.correctCount}개`,
          `오답: ${resultData.wrongCount}개`,
          `맞은 문제: ${resultData.correctNumbers.length ? resultData.correctNumbers.join(", ") : "없음"}`,
          `틀린 문제: ${resultData.wrongNumbers.length ? resultData.wrongNumbers.join(", ") : "없음"}`,
          "",
          "[틀린 문제 상세]",
        ];

        if (!wrongData.length) {
          lines.push("틀린 문제가 없습니다.");
          return lines.join("\n");
        }

        wrongData.forEach((item) => {
          lines.push(`${item.number}번`);
          lines.push(`문제: ${item.question}`);
          lines.push(
            `내 답: ${item.userAnswer === null ? "미응답" : `${item.userAnswer}번 - ${item.userChoiceText}`}`,
          );
          lines.push(
            `정답: ${item.correctAnswer}번 - ${item.correctChoiceText}`,
          );
          lines.push(`해설: ${item.explanation}`);
          lines.push("");
        });

        return lines.join("\n");
      }

      function downloadSubmitReport() {
        if (!submitResult || !submitResult.success) return;
        const reportText = buildSubmitReport(
          submitResult,
          buildWrongAnswerData(),
        );
        const blob = new Blob([reportText], {
          type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const safeSheetName = (workbookStore.currentSheet || "quiz").replace(
          /[\\/:*?"<>|]/g,
          "-",
        );
        link.href = url;
        link.download = `${safeSheetName}-result.txt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      function renderSubmitResult() {
        if (!submitPending && !submitResult) {
          submitSection.classList.add("hidden");
          submitStatus.textContent = "";
          submitStatus.className = "small";
          submitSummary.textContent = "";
          correctSummary.textContent = "";
          wrongSummaryServer.textContent = "";
          downloadResultBtn.disabled = true;
          return;
        }

        submitSection.classList.remove("hidden");

        if (submitPending) {
          submitStatus.textContent = "서버에 제출 중입니다...";
          submitStatus.className = "small";
          submitSummary.textContent = "";
          correctSummary.textContent = "";
          wrongSummaryServer.textContent = "";
          downloadResultBtn.disabled = true;
          return;
        }

        if (!submitResult.success) {
          submitStatus.textContent = `제출 실패: ${submitResult.message}`;
          submitStatus.className = "small status-error";
          submitSummary.textContent = "";
          correctSummary.textContent = "";
          wrongSummaryServer.textContent = "";
          downloadResultBtn.disabled = true;
          return;
        }

        submitStatus.textContent = submitResult.savedLocally
          ? "제출이 완료되었습니다. 결과를 화면과 브라우저 저장소에 저장했습니다."
          : "제출이 완료되었습니다. 서버 기준 채점 결과입니다.";
        submitStatus.className = "small status-ok";
        submitSummary.textContent = `점수: ${submitResult.score} / ${submitResult.totalCount} · 정답 ${submitResult.correctCount}개 · 오답 ${submitResult.wrongCount}개`;
        correctSummary.textContent = `맞은 문제: ${submitResult.correctNumbers.length ? submitResult.correctNumbers.join(", ") : "없음"}`;
        wrongSummaryServer.textContent = `틀린 문제: ${submitResult.wrongNumbers.length ? submitResult.wrongNumbers.join(", ") : "없음"}`;
        downloadResultBtn.disabled = false;
      }

      function buildSubmitPayload(wrongData, resultSummary) {
        return {
          action: "submitCbtQuiz",
          studentName: getStudentName(),
          sheetName: workbookStore.currentSheet,
          submittedAt: new Date().toISOString(),
          userAnswers,
          wrongData,
          resultSummary,
          reportText: buildSubmitReport(resultSummary, wrongData),
          questions: workbookStore.quizData.map((q) => ({
            number: q.number,
            question: q.question,
            choices: q.choices,
            answer: q.answer,
            explanation: q.explanation,
          })),
        };
      }

      async function submitQuiz() {
        if (!workbookStore.currentSheet || !workbookStore.quizData.length) {
          alert("먼저 시트를 선택하세요.");
          return;
        }

        if (!gradingDone) {
          alert("채점하기를 먼저 눌러 결과를 확정해 주세요.");
          return;
        }

        if (!getStudentName()) {
          alert("이름을 입력한 뒤 제출해 주세요.");
          studentNameInput.focus();
          return;
        }

        const localResult = {
          success: true,
          savedLocally: !CBT_SUBMIT_URL,
          studentName: getStudentName(),
          submittedAt: new Date().toLocaleString("ko-KR"),
          ...calculateGradeSummary(),
        };

        const wrongData = buildWrongAnswerData();

        if (!CBT_SUBMIT_URL) {
          submitResult = localResult;
          saveWrongAnswerData(wrongData);
          saveResultData({
            ...localResult,
            reportText: buildSubmitReport(localResult, wrongData),
          });
          wrongVisible = true;
          render();
          return;
        }

        submitPending = true;
        submitResult = null;
        gradingDone = true;
        render();

        try {
          const response = await fetch(CBT_SUBMIT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(buildSubmitPayload(wrongData, localResult)),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const serverResult = await response.json();
          submitResult = {
            ...localResult,
            ...serverResult,
            success: serverResult.success !== false,
            savedLocally: true,
          };
          saveWrongAnswerData(wrongData);
          saveResultData({
            ...submitResult,
            reportText: buildSubmitReport(submitResult, wrongData),
          });
          wrongVisible = true;
        } catch (error) {
          submitResult = {
            success: false,
            message: error.message || "서버 제출 중 오류가 발생했습니다.",
          };
        } finally {
          submitPending = false;
          render();
          if (!submitSection.classList.contains("hidden")) {
            submitSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }

      function renderQuestionButtons() {
        questionGrid.innerHTML = "";
        workbookStore.quizData.forEach((q, index) => {
          const btn = document.createElement("button");
          btn.className = "q-btn";
          btn.textContent = q.number;
          if (index === currentIndex) btn.classList.add("active");

          if (gradingDone) {
            if (userAnswers[index] === null) btn.classList.add("wrong");
            else if (userAnswers[index] === q.answer)
              btn.classList.add("correct");
            else btn.classList.add("wrong");
          }

          btn.addEventListener("click", () => {
            currentIndex = index;
            resetViewToggles();
            render();
          });
          questionGrid.appendChild(btn);
        });
      }

      function renderChoices() {
        const current = workbookStore.quizData[currentIndex];
        choiceList.innerHTML = "";

        current.choices.forEach((choice, idx) => {
          const choiceNumber = idx + 1;
          const label = document.createElement("label");
          label.className = "choice";

          if (userAnswers[currentIndex] === choiceNumber)
            label.classList.add("selected");

          if (answerVisible) {
            if (choiceNumber === current.answer)
              label.classList.add("reveal-correct");
            if (
              userAnswers[currentIndex] === choiceNumber &&
              choiceNumber !== current.answer
            ) {
              label.classList.add("reveal-wrong");
            }
          }

          const input = document.createElement("input");
          input.type = "radio";
          input.name = "choice";
          input.checked = userAnswers[currentIndex] === choiceNumber;
          input.addEventListener("change", () => {
            userAnswers[currentIndex] = choiceNumber;
            if (gradingDone) {
              gradingDone = false;
              wrongVisible = false;
              resetViewToggles();
            }
            resetSubmissionState();
            saveAnswersForSheet();
            saveStudentNameForSheet();
            render();
          });

          const text = document.createElement("div");
          text.innerHTML = `<strong>${choiceNumber}.</strong> ${choice}`;

          label.appendChild(input);
          label.appendChild(text);
          choiceList.appendChild(label);
        });
      }

      function renderPanels() {
        const current = workbookStore.quizData[currentIndex];
        const selected = userAnswers[currentIndex];

        if (gradingDone) {
          gradeResult.classList.remove("hidden");
          if (selected === null) {
            gradeResult.innerHTML =
              "<strong>채점 결과</strong><br>미응답으로 오답 처리됩니다.";
          } else if (selected === current.answer) {
            gradeResult.innerHTML = "<strong>채점 결과</strong><br>정답입니다.";
          } else {
            gradeResult.innerHTML = "<strong>채점 결과</strong><br>오답입니다.";
          }
        } else {
          gradeResult.classList.add("hidden");
        }

        if (answerVisible) {
          answerBox.classList.remove("hidden");
          answerBox.innerHTML = `<strong>정답</strong><br>${current.answer}번 - ${current.choices[current.answer - 1]}`;
        } else {
          answerBox.classList.add("hidden");
        }

        if (explanationVisible) {
          explainBox.classList.remove("hidden");
          explainBox.innerHTML = `<strong>해설</strong><br>${current.explanation.replace(/\n/g, "<br>")}`;
          toggleExplainBtn.textContent = "해설 숨기기";
        } else {
          explainBox.classList.add("hidden");
          toggleExplainBtn.textContent = "해설 보기";
        }
      }

      function updateProgress() {
        const solvedCount = userAnswers.filter((v) => v !== null).length;
        progressText.textContent = `${solvedCount} / ${workbookStore.quizData.length} 문제 선택`;

        if (gradingDone) {
          const summary = calculateGradeSummary();
          scoreText.textContent = `점수: ${summary.score} / ${summary.totalCount} · 오답 ${summary.wrongCount}개`;
        } else {
          scoreText.textContent = "채점 전";
        }
      }

      function renderWrongAnswers() {
        if (!gradingDone) {
          wrongSection.classList.add("hidden");
          wrongList.innerHTML = "";
          wrongSummary.textContent = "";
          wrongExport.value = "";
          return;
        }

        const wrongData = buildWrongAnswerData();
        saveWrongAnswerData(wrongData);

        if (!wrongVisible) {
          wrongSection.classList.add("hidden");
          return;
        }

        wrongSection.classList.remove("hidden");
        if (wrongData.length === 0) {
          wrongSummary.textContent = "틀린 문제가 없습니다.";
          wrongList.innerHTML = "";
          wrongExport.value = "틀린 문제가 없습니다.";
          return;
        }

        wrongSummary.textContent = `총 ${wrongData.length}문제 틀렸습니다.`;

        wrongList.innerHTML = wrongData
          .map(
            (item) => `
        <div class="wrong-item">
          <strong>${item.number}번</strong>
          문제: ${item.question}

          보기:
          1. ${item.choices[0]}
          2. ${item.choices[1]}
          3. ${item.choices[2]}
          4. ${item.choices[3]}

          내가 고른 답: ${item.userAnswer === null ? "미응답" : `${item.userAnswer}번 - ${item.userChoiceText}`}
          정답: ${item.correctAnswer}번 - ${item.correctChoiceText}
          해설: ${item.explanation}
        </div>
      `,
          )
          .join("");

        wrongExport.value = wrongData
          .map((item) => {
            return [
              `${item.number}번`,
              `문제: ${item.question}`,
              "보기:",
              `1. ${item.choices[0]}`,
              `2. ${item.choices[1]}`,
              `3. ${item.choices[2]}`,
              `4. ${item.choices[3]}`,
              `내가 고른 답: ${item.userAnswer === null ? "미응답" : `${item.userAnswer}번 - ${item.userChoiceText}`}`,
              `정답: ${item.correctAnswer}번 - ${item.correctChoiceText}`,
              `해설: ${item.explanation}`,
            ].join("\n");
          })
          .join("\n\n--------------------\n\n");
      }

      function render() {
        if (!workbookStore.quizData.length) {
          questionTitle.textContent = getStudentName()
            ? "시트를 선택하세요"
            : "이름을 먼저 입력하세요";
          currentBadge.textContent = "-";
          questionBox.textContent = getStudentName()
            ? "왼쪽에서 원하는 회차를 선택하세요."
            : "응시자 이름을 입력하면 회차를 선택할 수 있습니다.";
          choiceList.innerHTML = "";
          questionGrid.innerHTML = "";
          progressText.textContent = "0 / 0 문제 선택";
          scoreText.textContent = "채점 전";
          submitSection.classList.add("hidden");
          wrongSection.classList.add("hidden");
          return;
        }

        if (currentIndex >= workbookStore.quizData.length)
          currentIndex = workbookStore.quizData.length - 1;
        if (currentIndex < 0) currentIndex = 0;

        const current = workbookStore.quizData[currentIndex];
        questionTitle.textContent = `${workbookStore.currentSheet} 문제 풀이`;
        currentBadge.textContent = `${current.number}번`;
        questionBox.textContent = current.question;
        sheetInfo.textContent = `${workbookStore.currentSheet} · 총 ${workbookStore.quizData.length}문제`;
        renderQuestionButtons();
        renderChoices();
        renderPanels();
        updateProgress();
        renderSubmitResult();
        renderWrongAnswers();
        setButtonsEnabled(true);
      }

      async function loadWorkbookFromPath() {
        try {
          const response = await fetch(EXCEL_FILE_PATH);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });

          workbookStore.workbook = workbook;
          workbookStore.sheetNames = workbook.SheetNames;
          workbookStore.currentSheet = "";
          workbookStore.quizData = [];

          sheetSelect.innerHTML = '<option value="">시트를 선택하세요</option>';
          workbookStore.sheetNames.forEach((sheetName) => {
            const option = document.createElement("option");
            option.value = sheetName;
            option.textContent = sheetName;
            sheetSelect.appendChild(option);
          });
          updateSheetSelectAvailability();
          updateStudentNameViews();

          questionTitle.textContent = "이름을 먼저 입력하세요";
          questionBox.textContent =
            "응시자 이름을 입력하면 회차를 선택할 수 있습니다.";
        } catch (error) {
          questionTitle.textContent = "엑셀 파일을 불러오지 못했습니다";
          questionBox.textContent = `파일 경로를 확인하세요.\n현재 경로: ${EXCEL_FILE_PATH}`;
          sheetInfo.textContent = "파일 로드 실패";
          setButtonsEnabled(false);
        }
      }

      sheetSelect.addEventListener("change", (event) => {
        const sheetName = event.target.value;
        if (!sheetName || !workbookStore.workbook) return;

        const sheet = workbookStore.workbook.Sheets[sheetName];
        const parsed = parseSheetToQuizData(sheet);

        workbookStore.currentSheet = sheetName;
        workbookStore.quizData = parsed;
        currentIndex = 0;
        gradingDone = false;
        wrongVisible = false;
        resetSubmissionState();
        resetViewToggles();
        loadAnswersForSheet(sheetName);
        render();
      });

      studentNameInput.addEventListener("input", () => {
        saveStudentNameForSheet();
        if (!getStudentName()) {
          workbookStore.currentSheet = "";
          workbookStore.quizData = [];
          userAnswers = [];
          currentIndex = 0;
          gradingDone = false;
          wrongVisible = false;
          resetSubmissionState();
          resetViewToggles();
        }
        updateSheetSelectAvailability();
        if (!workbookStore.currentSheet) {
          questionTitle.textContent = getStudentName()
            ? "시트를 선택하세요"
            : "이름을 먼저 입력하세요";
          questionBox.textContent = getStudentName()
            ? "왼쪽에서 원하는 회차 시트를 선택하면 문제가 표시됩니다."
            : "응시자 이름을 입력하면 회차를 선택할 수 있습니다.";
        }
        render();
      });

      introNameInput.addEventListener("input", () => {
        studentNameInput.value = introNameInput.value.trim();
        updateStudentNameViews();
        updateSheetSelectAvailability();
      });

      introNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !startQuizBtn.disabled) {
          event.preventDefault();
          startQuizBtn.click();
        }
      });

      startQuizBtn.addEventListener("click", () => {
        studentNameInput.value = introNameInput.value.trim();
        if (!getStudentName()) {
          introNameInput.focus();
          return;
        }
        if (workbookStore.currentSheet) {
          saveStudentNameForSheet();
        }
        updateStudentNameViews();
        updateSheetSelectAvailability();
        showQuizApp();
        render();
      });

      gradeBtn.addEventListener("click", () => {
        gradingDone = true;
        wrongVisible = false;
        render();
      });

      showAnswerBtn.addEventListener("click", () => {
        answerVisible = !answerVisible;
        showAnswerBtn.textContent = answerVisible ? "정답 숨기기" : "정답 보기";
        render();
      });

      toggleExplainBtn.addEventListener("click", () => {
        explanationVisible = !explanationVisible;
        render();
      });

      resetSheetBtn.addEventListener("click", () => {
        restartCurrentSheet();
      });

      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          resetViewToggles();
          render();
        }
      });

      nextBtn.addEventListener("click", () => {
        if (currentIndex < workbookStore.quizData.length - 1) {
          currentIndex += 1;
          resetViewToggles();
          render();
        }
      });

      submitBtn.addEventListener("click", () => {
        submitQuiz();
      });

      showWrongBtn.addEventListener("click", () => {
        if (!gradingDone) return;
        wrongVisible = !wrongVisible;
        render();
        if (wrongVisible) {
          wrongSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      downloadResultBtn.addEventListener("click", () => {
        downloadSubmitReport();
      });

      setButtonsEnabled(false);
      showIntroScreen();
      updateStudentNameViews();
      loadWorkbookFromPath();
      render();
    
