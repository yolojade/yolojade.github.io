const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwqMOwkjgK6xXArUZnA-WKAWtfz2yfEoc1vd_5ljgipIWw5LJ5LSAq8yzecFuYjIHGyOA/exec";

const state = {
  currentDate: new Date(),
  selectedDate: new Date(),
  monthSummary: {},
};

function jsonpRequest(params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "jsonpCallback_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    const script = document.createElement("script");

    params.callback = callbackName;
    const queryString = new URLSearchParams(params).toString();
    const url = `${APPS_SCRIPT_URL}?${queryString}`;

    let timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("요청 시간 초과"));
    }, 15000);

    function cleanup() {
      clearTimeout(timeoutId);
      if (script.parentNode) script.parentNode.removeChild(script);
      try {
        delete window[callbackName];
      } catch (e) {}
    }

    window[callbackName] = function (data) {
      cleanup();
      resolve(data);
    };

    script.onerror = function () {
      cleanup();
      reject(new Error("Apps Script 호출 실패"));
    };

    script.src = url;
    document.body.appendChild(script);
  });
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTitle(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function formatSelectedDateLabel(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

function formatTime(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

async function loadMonthSummary() {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth() + 1;
  const data = await jsonpRequest({
    action: "getAttendanceMonthSummary",
    year,
    month,
  });
  if (!data || !data.success)
    throw new Error(data?.message || "월별 출석 요약을 불러오지 못했습니다.");
  state.monthSummary = data.summary || {};
}

async function loadAttendanceByDate() {
  const date = formatDateKey(state.selectedDate);
  const data = await jsonpRequest({ action: "getAttendanceByDate", date });
  if (!data || !data.success)
    throw new Error(data?.message || "일자별 출석 기록을 불러오지 못했습니다.");
  renderSelectedDate(data.date, data.records || []);
}

function renderCalendar() {
  document.getElementById("calendarTitle").textContent = formatTitle(
    state.currentDate,
  );

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    const dayNum = prevMonthDays - startWeekday + i + 1;
    const d = new Date(year, month - 1, dayNum);
    cells.push({ date: d, muted: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), muted: false });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), muted: true });
  }

  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(state.selectedDate);

  cells.forEach(({ date, muted }) => {
    const dateKey = formatDateKey(date);
    const summary = state.monthSummary[dateKey];
    const count = summary ? summary.count : 0;

    const el = document.createElement("button");
    el.className = "calendar-day";
    if (muted) el.classList.add("muted");
    if (dateKey === selectedKey) el.classList.add("selected");
    if (dateKey === todayKey) el.classList.add("today");

    el.innerHTML = `
      <div class="day-number">${date.getDate()}</div>
      <div class="day-badges">
        ${count > 0 ? `<span class="badge attendance">출석 ${count}명</span>` : ""}
      </div>
    `;

    el.addEventListener("click", async () => {
      state.selectedDate = new Date(date);
      if (
        date.getMonth() !== state.currentDate.getMonth() ||
        date.getFullYear() !== state.currentDate.getFullYear()
      ) {
        state.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
        await refreshCalendarAndDay();
      } else {
        renderCalendar();
        await loadAttendanceByDate();
      }
    });

    grid.appendChild(el);
  });
}

function renderSelectedDate(dateString, records) {
  const dateObj = new Date(dateString + "T00:00:00");
  document.getElementById("selectedDateTitle").textContent =
    formatSelectedDateLabel(dateObj);
  document.getElementById("selectedDateSummary").textContent = records.length
    ? `총 ${records.length}건의 출석 기록이 있습니다.`
    : "이 날짜에는 출석 기록이 없습니다.";

  document.getElementById("attendanceCount").textContent =
    `${records.length}명`;

  const times = records.map((r) => r.time).sort();
  document.getElementById("firstCheckin").textContent = times.length
    ? times[0]
    : "-";
  document.getElementById("lastCheckin").textContent = times.length
    ? times[times.length - 1]
    : "-";

  const list = document.getElementById("attendanceList");
  if (!records.length) {
    list.innerHTML = `<div class="empty">출석 기록이 없습니다.</div>`;
    return;
  }

  list.innerHTML = records
    .map(
      (r) => `
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${escapeHtml(r.name)}</div>
        <div class="list-sub">회원번호 ${escapeHtml(r.memberNo)}</div>
      </div>
      <div class="list-time">${escapeHtml(r.time)}</div>
    </div>
  `,
    )
    .join("");
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindTabs() {
  const attendanceBtn = document.getElementById("attendanceTabBtn");
  const reservationBtn = document.getElementById("reservationTabBtn");
  const attendanceTab = document.getElementById("attendanceTab");
  const reservationTab = document.getElementById("reservationTab");

  attendanceBtn.addEventListener("click", () => {
    attendanceBtn.classList.add("active");
    reservationBtn.classList.remove("active");
    attendanceTab.classList.remove("hidden");
    reservationTab.classList.add("hidden");
  });

  reservationBtn.addEventListener("click", () => {
    reservationBtn.classList.add("active");
    attendanceBtn.classList.remove("active");
    reservationTab.classList.remove("hidden");
    attendanceTab.classList.add("hidden");
  });
}

async function refreshCalendarAndDay() {
  await loadMonthSummary();
  renderCalendar();
  await loadAttendanceByDate();
}

document.getElementById("prevMonthBtn").addEventListener("click", async () => {
  state.currentDate = new Date(
    state.currentDate.getFullYear(),
    state.currentDate.getMonth() - 1,
    1,
  );
  state.selectedDate = new Date(
    state.currentDate.getFullYear(),
    state.currentDate.getMonth(),
    1,
  );
  await refreshCalendarAndDay();
});

document.getElementById("nextMonthBtn").addEventListener("click", async () => {
  state.currentDate = new Date(
    state.currentDate.getFullYear(),
    state.currentDate.getMonth() + 1,
    1,
  );
  state.selectedDate = new Date(
    state.currentDate.getFullYear(),
    state.currentDate.getMonth(),
    1,
  );
  await refreshCalendarAndDay();
});

document.getElementById("todayBtn").addEventListener("click", async () => {
  const today = new Date();
  state.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  state.selectedDate = today;
  await refreshCalendarAndDay();
});

window.addEventListener("load", async () => {
  bindTabs();
  try {
    await refreshCalendarAndDay();
  } catch (error) {
    console.error(error);
    document.getElementById("attendanceList").innerHTML =
      `<div class="empty">일정 데이터를 불러오지 못했습니다.<br>${escapeHtml(error.message)}</div>`;
  }
});
