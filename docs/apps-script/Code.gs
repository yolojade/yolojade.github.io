function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var memberSheet = ss.getSheetByName("Members");
    var attendSheet = ss.getSheetByName("Attendance");

    if (!memberSheet || !attendSheet) {
      return output_({
        success: false,
        message: "Members 또는 Attendance 시트가 없습니다. setupSheets()를 먼저 실행하세요."
      }, callback);
    }

    if (action === "getMembers") {
      var q = ((e.parameter.q || "") + "").trim().toLowerCase();
      var members = getMembers_(memberSheet, q);
      return output_({ success: true, members: members }, callback);
    }

    if (action === "addMember") {
      var name = ((e.parameter.name || "") + "").trim();
      var phone = ((e.parameter.phone || "") + "").trim();

      if (!name) {
        return output_({ success: false, message: "이름이 비어 있습니다." }, callback);
      }

      var existing = findMemberByNameAndPhone_(memberSheet, name, phone);
      if (existing) {
        return output_({
          success: false,
          message: "같은 이름/전화번호의 회원이 이미 있습니다."
        }, callback);
      }

      var id = Utilities.getUuid();
      var memberNo = generateNextMemberNo_(memberSheet);
      var now = new Date();

      memberSheet.appendRow([id, memberNo, name, phone, 10, 10, now, now]);

      return output_({
        success: true,
        message: "회원 등록 완료",
        id: id,
        memberNo: memberNo
      }, callback);
    }

    if (action === "checkInByMemberNo") {
      var memberNo = ((e.parameter.memberNo || "") + "").trim().toUpperCase();
      if (!memberNo) {
        return output_({ success: false, message: "회원번호가 없습니다." }, callback);
      }
      var checkResult = updateRemainByMemberNo_(memberSheet, attendSheet, memberNo, -1, "checkin");
      return output_(checkResult, callback);
    }

    if (action === "addCount") {
      var addAmount = Number(e.parameter.amount || 10);
      var memberId = (e.parameter.id || "") + "";
      if (!memberId) {
        return output_({ success: false, message: "회원 ID가 없습니다." }, callback);
      }

      var addResult = updateRemainById_(memberSheet, attendSheet, memberId, addAmount, "add");
      return output_(addResult, callback);
    }

    if (action === "getAttendanceByDate") {
      var date = ((e.parameter.date || "") + "").trim();
      if (!date) {
        return output_({ success: false, message: "날짜가 없습니다." }, callback);
      }
      var records = getAttendanceByDate_(attendSheet, date);
      return output_({ success: true, date: date, records: records }, callback);
    }

    if (action === "getAttendanceMonthSummary") {
      var year = Number(e.parameter.year || 0);
      var month = Number(e.parameter.month || 0);
      if (!year || !month) {
        return output_({ success: false, message: "연월 정보가 없습니다." }, callback);
      }
      var summary = getAttendanceMonthSummary_(attendSheet, year, month);
      return output_({ success: true, summary: summary }, callback);
    }

    return output_({ success: false, message: "지원하지 않는 action입니다." }, callback);

  } catch (error) {
    return output_({
      success: false,
      message: error && error.message ? error.message : String(error)
    }, callback);
  }
}

function getMembers_(sheet, q) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var rows = values.slice(1);
  var members = rows.map(function(r) {
    return {
      id: r[0],
      memberNo: r[1],
      name: r[2],
      phone: r[3],
      totalCount: Number(r[4] || 0),
      remain: Number(r[5] || 0),
      createdAt: r[6],
      updatedAt: r[7]
    };
  });

  if (q) {
    members = members.filter(function(m) {
      return String(m.name).toLowerCase().indexOf(q) !== -1 ||
             String(m.phone || "").toLowerCase().indexOf(q) !== -1 ||
             String(m.memberNo || "").toLowerCase().indexOf(q) !== -1;
    });
  }

  members.sort(function(a, b) {
    return a.name.localeCompare(b.name, "ko");
  });

  return members;
}

function findMemberByNameAndPhone_(sheet, name, phone) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (String(row[2]).trim() === name && String(row[3] || "").trim() === phone) {
      return { rowIndex: i + 1, id: row[0], memberNo: row[1] };
    }
  }
  return null;
}

function generateNextMemberNo_(sheet) {
  var values = sheet.getDataRange().getValues();
  var maxNum = 0;

  for (var i = 1; i < values.length; i++) {
    var memberNo = String(values[i][1] || "").trim().toUpperCase();
    var match = memberNo.match(/^PT(\d+)$/);
    if (match) {
      var num = Number(match[1]);
      if (num > maxNum) maxNum = num;
    }
  }

  var nextNum = maxNum + 1;
  return "PT" + ("0000" + nextNum).slice(-4);
}

function updateRemainByMemberNo_(memberSheet, attendSheet, memberNo, delta, type) {
  var values = memberSheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { success: false, message: "회원 데이터가 없습니다." };
  }

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var rowMemberNo = String(row[1] || "").trim().toUpperCase();
    if (rowMemberNo === String(memberNo)) {
      return processRemainUpdate_(memberSheet, attendSheet, i + 1, row, delta, type);
    }
  }

  return { success: false, message: "해당 회원번호를 찾을 수 없습니다." };
}

function updateRemainById_(memberSheet, attendSheet, memberId, delta, type) {
  var values = memberSheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { success: false, message: "회원 데이터가 없습니다." };
  }

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var id = String(row[0] || "");
    if (id === String(memberId)) {
      return processRemainUpdate_(memberSheet, attendSheet, i + 1, row, delta, type);
    }
  }

  return { success: false, message: "회원을 찾을 수 없습니다." };
}

function processRemainUpdate_(memberSheet, attendSheet, sheetRowIndex, row, delta, type) {
  var id = row[0];
  var memberNo = row[1];
  var name = row[2];
  var totalCount = Number(row[4] || 0);
  var remain = Number(row[5] || 0);
  var now = new Date();

  if (type === "checkin") {
    if (remain <= 0) {
      return { success: false, message: "잔여 횟수가 0회입니다." };
    }
    remain -= 1;
  } else if (type === "add") {
    totalCount += delta;
    remain += delta;
  }

  memberSheet.getRange(sheetRowIndex, 5).setValue(totalCount);
  memberSheet.getRange(sheetRowIndex, 6).setValue(remain);
  memberSheet.getRange(sheetRowIndex, 8).setValue(now);

  attendSheet.appendRow([
    Utilities.getUuid(),
    id,
    memberNo,
    name,
    type,
    delta,
    remain,
    now
  ]);

  return {
    success: true,
    message: type === "checkin" ? "출석 완료" : "횟수 추가 완료",
    id: id,
    memberNo: memberNo,
    name: name,
    remain: remain,
    totalCount: totalCount
  };
}

function getAttendanceByDate_(sheet, dateKey) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var tz = Session.getScriptTimeZone() || "Asia/Seoul";
  var records = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var type = String(row[4] || "");
    var timestamp = row[7];

    if (type !== "checkin" || !timestamp) continue;

    var rowDateKey = Utilities.formatDate(new Date(timestamp), tz, "yyyy-MM-dd");
    if (rowDateKey === dateKey) {
      records.push({
        memberId: row[1],
        memberNo: row[2],
        name: row[3],
        time: Utilities.formatDate(new Date(timestamp), tz, "HH:mm"),
        timestamp: Utilities.formatDate(new Date(timestamp), tz, "yyyy-MM-dd'T'HH:mm:ss")
      });
    }
  }

  records.sort(function(a, b) {
    return a.time.localeCompare(b.time);
  });

  return records;
}

function getAttendanceMonthSummary_(sheet, year, month) {
  var values = sheet.getDataRange().getValues();
  var tz = Session.getScriptTimeZone() || "Asia/Seoul";
  var summary = {};
  var yearMonth = year + "-" + ("0" + month).slice(-2);

  if (values.length <= 1) return summary;

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var type = String(row[4] || "");
    var timestamp = row[7];

    if (type !== "checkin" || !timestamp) continue;

    var dateKey = Utilities.formatDate(new Date(timestamp), tz, "yyyy-MM-dd");
    if (dateKey.indexOf(yearMonth) !== 0) continue;

    if (!summary[dateKey]) {
      summary[dateKey] = { count: 0 };
    }
    summary[dateKey].count += 1;
  }

  return summary;
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

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var members = ss.getSheetByName("Members");
  if (!members) {
    members = ss.insertSheet("Members");
    members.appendRow(["id", "memberNo", "name", "phone", "totalCount", "remain", "createdAt", "updatedAt"]);
  }

  var attendance = ss.getSheetByName("Attendance");
  if (!attendance) {
    attendance = ss.insertSheet("Attendance");
    attendance.appendRow(["logId", "memberId", "memberNo", "name", "type", "delta", "remainAfter", "timestamp"]);
  }
}
