const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwqMOwkjgK6xXArUZnA-WKAWtfz2yfEoc1vd_5ljgipIWw5LJ5LSAq8yzecFuYjIHGyOA/exec";

// 진짜 보안을 원하면 서버 인증이 필요합니다.
// 이 PIN은 프론트에 있으므로 강한 보안은 아닙니다.
// 그래도 공개 화면에서 관리자 메뉴를 숨기는 용도로는 쓸 수 있습니다.
const ADMIN_PIN = "1234";

let adminUnlocked = false;

function setText(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function toggleAdminArea() {
  const area = document.getElementById("adminArea");
  const btn = document.getElementById("toggleAdminBtn");
  area.classList.toggle("hidden");
  btn.textContent = area.classList.contains("hidden") ? "열기" : "닫기";
}

function unlockAdmin() {
  const pin = document.getElementById("adminPinInput").value.trim();
  if (pin !== ADMIN_PIN) {
    setText("adminLockStatus", "PIN이 올바르지 않습니다.");
    return;
  }
  adminUnlocked = true;
  document.getElementById("adminLockBox").classList.add("hidden");
  document.getElementById("adminContent").classList.remove("hidden");
  setText("adminLockStatus", "");
  setText("adminSearchStatus", "관리자 메뉴 잠금 해제됨");
}

async function checkInByMemberNo() {
  const memberNo = document
    .getElementById("memberNoInput")
    .value.trim()
    .toUpperCase();
  if (!memberNo) {
    alert("회원번호를 입력하세요.");
    return;
  }

  setText("checkinStatus", "출석 처리 중...");
  try {
    const data = await jsonpRequest({ action: "checkInByMemberNo", memberNo });
    if (!data || !data.success)
      throw new Error(data?.message || "출석 처리 실패");
    setText("checkinStatus", `출석 완료 / 잔여 ${data.remain}회`);
    alert(`출석 완료\n회원번호: ${data.memberNo}\n잔여 ${data.remain}회`);
    document.getElementById("memberNoInput").value = "";
    document.getElementById("memberNoInput").focus();
  } catch (error) {
    console.error(error);
    setText("checkinStatus", "오류: " + error.message);
    alert("출석 실패: " + error.message);
  }
}

async function addMember() {
  if (!adminUnlocked) {
    alert("관리자 잠금을 먼저 해제하세요.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name) {
    alert("이름을 입력하세요.");
    return;
  }

  setText("registerStatus", "회원 등록 중...");
  try {
    const data = await jsonpRequest({ action: "addMember", name, phone });
    if (!data || !data.success)
      throw new Error(data?.message || "회원 등록 실패");
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    setText(
      "registerStatus",
      `${name} 회원 등록 완료 / 회원번호 ${data.memberNo}`,
    );
    alert(`${name} 회원 등록 완료\n회원번호: ${data.memberNo}\n기본 10회 등록`);
    await loadAdminMembers();
  } catch (error) {
    console.error(error);
    setText("registerStatus", "오류: " + error.message);
    alert("회원 등록 실패: " + error.message);
  }
}

async function loadAdminMembers() {
  if (!adminUnlocked) return;

  const q = document.getElementById("searchAdmin").value.trim();
  const list = document.getElementById("adminMemberList");
  list.innerHTML = "";
  setText("adminSearchStatus", "회원 불러오는 중...");

  try {
    const data = await jsonpRequest({ action: "getMembers", q });
    if (!data || !data.success)
      throw new Error(data?.message || "회원 조회 실패");
    renderAdminMembers(data.members || []);
    setText("adminSearchStatus", `회원 ${data.members.length}명 표시`);
  } catch (error) {
    console.error(error);
    setText("adminSearchStatus", "오류: " + error.message);
    list.innerHTML = `<div class="empty">회원 목록을 불러오지 못했습니다.</div>`;
  }
}

function renderAdminMembers(members) {
  const list = document.getElementById("adminMemberList");
  if (!members.length) {
    list.innerHTML = `<div class="empty">검색 결과가 없습니다.</div>`;
    return;
  }

  list.innerHTML = members
    .map(
      (m) => `
    <div class="card">
      <h3>${escapeHtml(m.name)}</h3>
      <div class="meta">회원번호: ${escapeHtml(m.memberNo)}</div>
      <div class="meta">전화번호: ${escapeHtml(m.phone || "-")}</div>
      <div class="meta">총 등록: ${escapeHtml(m.totalCount)}회</div>
      <div class="remain">잔여 ${escapeHtml(m.remain)}회</div>
      <div class="card-actions">
        <button class="action-plus" onclick="addCount('${escapeHtml(m.id)}', '${escapeHtml(m.name)}')">+10회 추가</button>
      </div>
    </div>
  `,
    )
    .join("");
}

async function addCount(id, name) {
  if (!adminUnlocked) {
    alert("관리자 잠금을 먼저 해제하세요.");
    return;
  }

  if (!confirm(`${name} 회원에게 10회를 추가할까요?`)) return;

  setText("adminSearchStatus", "횟수 추가 중...");
  try {
    const data = await jsonpRequest({ action: "addCount", id, amount: 10 });
    if (!data || !data.success)
      throw new Error(data?.message || "횟수 추가 실패");
    setText(
      "adminSearchStatus",
      `${name} +10회 추가 완료 / 잔여 ${data.remain}회`,
    );
    alert(
      `${name} 회원에게 10회가 추가되었습니다.\n회원번호: ${data.memberNo}\n잔여 ${data.remain}회`,
    );
    await loadAdminMembers();
  } catch (error) {
    console.error(error);
    setText("adminSearchStatus", "오류: " + error.message);
    alert("횟수 추가 실패: " + error.message);
  }
}

document
  .getElementById("checkInByNoBtn")
  .addEventListener("click", checkInByMemberNo);
document
  .getElementById("memberNoInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkInByMemberNo();
  });

document
  .getElementById("toggleAdminBtn")
  .addEventListener("click", toggleAdminArea);
document
  .getElementById("unlockAdminBtn")
  .addEventListener("click", unlockAdmin);
document
  .getElementById("adminPinInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") unlockAdmin();
  });

document.getElementById("addBtn").addEventListener("click", addMember);
document
  .getElementById("searchAdminBtn")
  .addEventListener("click", loadAdminMembers);
document
  .getElementById("searchAdmin")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") loadAdminMembers();
  });

window.addEventListener("load", function () {
  document.getElementById("memberNoInput").focus();
});
