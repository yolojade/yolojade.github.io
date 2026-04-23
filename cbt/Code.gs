function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
  var requestData = getRequestData_(e);

  try {
    var action = requestData.action || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "submitCbtQuiz") {
      return output_(handleCbtQuizSubmission_(ss, requestData), callback);
    }

    return output_({ success: false, message: "지원하지 않는 action입니다." }, callback);
  } catch (error) {
    return output_({
      success: false,
      message: error && error.message ? error.message : String(error)
    }, callback);
  }
}

function getRequestData_(e) {
  var data = {};

  if (e && e.parameter) {
    for (var key in e.parameter) {
      if (Object.prototype.hasOwnProperty.call(e.parameter, key)) {
        data[key] = e.parameter[key];
      }
    }
  }

  var contents = e && e.postData && e.postData.contents ? String(e.postData.contents) : "";
  if (!contents) return data;

  try {
    var parsed = JSON.parse(contents);
    if (parsed && typeof parsed === "object") {
      for (var parsedKey in parsed) {
        if (Object.prototype.hasOwnProperty.call(parsed, parsedKey)) {
          data[parsedKey] = parsed[parsedKey];
        }
      }
    }
  } catch (error) {
    data.rawBody = contents;
  }

  return data;
}

function output_(obj, callback) {
  var text = JSON.stringify(obj);

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + text + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

function handleCbtQuizSubmission_(ss, payload) {
  var studentName = String(payload.studentName || "").trim();
  var sheetName = String(payload.sheetName || "").trim();
  var questions = Array.isArray(payload.questions) ? payload.questions : [];
  var userAnswers = Array.isArray(payload.userAnswers) ? payload.userAnswers : [];
  var wrongData = Array.isArray(payload.wrongData) ? payload.wrongData : [];
  var resultSummary = payload.resultSummary && typeof payload.resultSummary === "object" ? payload.resultSummary : null;
  var reportText = String(payload.reportText || "");

  if (!studentName) {
    return { success: false, message: "studentName이 없습니다." };
  }

  if (!sheetName) {
    return { success: false, message: "sheetName이 없습니다." };
  }

  if (!questions.length) {
    return { success: false, message: "questions가 비어 있습니다." };
  }

  if (questions.length !== userAnswers.length) {
    return { success: false, message: "문항 수와 응답 수가 일치하지 않습니다." };
  }

  var correctNumbers = [];
  var wrongNumbers = [];

  for (var i = 0; i < questions.length; i++) {
    var question = questions[i] || {};
    var questionNumber = Number(question.number || (i + 1));
    var correctAnswer = Number(question.answer || 0);
    var userAnswer = Number(userAnswers[i] || 0);

    if (userAnswer === correctAnswer) {
      correctNumbers.push(questionNumber);
    } else {
      wrongNumbers.push(questionNumber);
    }
  }

  var totalCount = questions.length;
  var correctCount = correctNumbers.length;
  var wrongCount = wrongNumbers.length;
  var score = correctCount;
  var now = new Date();
  var submissionId = Utilities.getUuid();
  var submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : now;
  if (String(submittedAt) === "Invalid Date") {
    submittedAt = now;
  }

  if (resultSummary) {
    score = Number(resultSummary.score || score);
    correctCount = Number(resultSummary.correctCount || correctCount);
    wrongCount = Number(resultSummary.wrongCount || wrongCount);
    totalCount = Number(resultSummary.totalCount || totalCount);
    if (Array.isArray(resultSummary.correctNumbers)) correctNumbers = resultSummary.correctNumbers;
    if (Array.isArray(resultSummary.wrongNumbers)) wrongNumbers = resultSummary.wrongNumbers;
  }

  var logSheet = getOrCreateQuizSubmissionsSheet_(ss);
  var wrongSheet = getOrCreateQuizWrongAnswersSheet_(ss);
  var wrongStartRow = "";
  var wrongSummaryText = wrongNumbers.length ? wrongNumbers.join(",") : "없음";
  var wrongDetailText = buildWrongDetailText_(wrongData);

  if (wrongData.length) {
    wrongStartRow = wrongSheet.getLastRow() + 1;
    var wrongRows = wrongData.map(function(item) {
      return [
        submissionId,
        studentName,
        sheetName,
        Number(item.number || ""),
        String(item.question || ""),
        item.userAnswer === null ? "" : Number(item.userAnswer),
        String(item.userChoiceText || ""),
        Number(item.correctAnswer || ""),
        String(item.correctChoiceText || ""),
        String(item.explanation || ""),
        buildWrongRowSummary_(item),
        submittedAt,
        now
      ];
    });
    wrongSheet
      .getRange(wrongStartRow, 1, wrongRows.length, wrongRows[0].length)
      .setValues(wrongRows);
  }

  var wrongSheetLink = "";
  if (wrongStartRow) {
    wrongSheetLink =
      '=HYPERLINK("#gid=' +
      wrongSheet.getSheetId() +
      '&range=A' +
      wrongStartRow +
      '","오답 상세 보기")';
  }

  logSheet.appendRow([
    submissionId,
    studentName,
    sheetName,
    totalCount,
    correctCount,
    wrongCount,
    score,
    correctNumbers.join(","),
    wrongNumbers.join(","),
    wrongSummaryText,
    wrongDetailText,
    wrongSheetLink,
    reportText,
    JSON.stringify(userAnswers),
    submittedAt,
    now
  ]);

  return {
    success: true,
    message: "제출이 저장되었습니다.",
    submissionId: submissionId,
    studentName: studentName,
    sheetName: sheetName,
    totalCount: totalCount,
    correctCount: correctCount,
    wrongCount: wrongCount,
    score: score,
    correctNumbers: correctNumbers,
    wrongNumbers: wrongNumbers,
    wrongSheetLink: wrongSheetLink
  };
}

function getOrCreateQuizSubmissionsSheet_(ss) {
  var sheet = ss.getSheetByName("QuizSubmissions");
  var headers = [
    "submissionId",
    "studentName",
    "sheetName",
    "totalCount",
    "correctCount",
    "wrongCount",
    "score",
    "correctNumbers",
    "wrongNumbers",
    "wrongSummaryText",
    "wrongDetailText",
    "wrongSheetLink",
    "reportText",
    "userAnswers",
    "submittedAt",
    "createdAt"
  ];

  if (!sheet) {
    sheet = ss.insertSheet("QuizSubmissions");
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else if (sheet.getLastColumn() < headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function getOrCreateQuizWrongAnswersSheet_(ss) {
  var sheet = ss.getSheetByName("QuizWrongAnswers");
  var headers = [
    "submissionId",
    "studentName",
    "sheetName",
    "questionNumber",
    "question",
    "userAnswer",
    "userChoiceText",
    "correctAnswer",
    "correctChoiceText",
    "explanation",
    "wrongSummaryText",
    "submittedAt",
    "createdAt"
  ];

  if (!sheet) {
    sheet = ss.insertSheet("QuizWrongAnswers");
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else if (sheet.getLastColumn() < headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function setupQuizSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateQuizSubmissionsSheet_(ss);
  getOrCreateQuizWrongAnswersSheet_(ss);
}

function buildWrongRowSummary_(item) {
  var userAnswerText = item.userAnswer === null
    ? "미응답"
    : item.userAnswer + "번 - " + String(item.userChoiceText || "");
  return [
    item.number + "번",
    "문제: " + String(item.question || ""),
    "내 답: " + userAnswerText,
    "정답: " + String(item.correctAnswer || "") + "번 - " + String(item.correctChoiceText || ""),
    "해설: " + String(item.explanation || "")
  ].join("\n");
}

function buildWrongDetailText_(wrongData) {
  if (!wrongData.length) return "틀린 문제가 없습니다.";
  return wrongData.map(function(item) {
    return String(item.number || "");
  }).filter(function(numberText) {
    return numberText !== "";
  }).join(",");
}
