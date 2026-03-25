# Create the requested docs/app.js file with the optimized content

content = """const state = {
  apiBaseUrl: localStorage.getItem('attendance_api_url') || '',
  searchResults: []
};

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  restoreApiUrl();
});

function bindEvents() {
  document.getElementById('saveApiUrlBtn')?.addEventListener('click', saveApiUrl);
  document.getElementById('testApiBtn')?.addEventListener('click', testApiConnection);
  document.getElementById('memberSearchBtn')?.addEventListener('click', searchMembers);
  document.getElementById('registerMemberBtn')?.addEventListener('click', registerMember);
}

function restoreApiUrl() {
  const input = document.getElementById('apiUrl');
  if (input) input.value = state.apiBaseUrl || '';
}

function saveApiUrl() {
  const input = document.getElementById('apiUrl');
  const value = String(input?.value || '').trim();

  if (!/^https:\\/\\/script\\.google\\.com\\/macros\\/s\\/.+\\/exec$/.test(value)) {
    alert('Apps Script 웹앱 URL 형식이 아닙니다. /exec 로 끝나는 주소를 넣어주세요.');
    return;
  }

  state.apiBaseUrl = value;
  localStorage.setItem('attendance_api_url', value);
  alert('저장되었습니다.');
}

function ensureApiUrl() {
  if (!state.apiBaseUrl) {
    alert('먼저 Apps Script 웹앱 URL을 저장하세요.');
    return false;
  }
  return true;
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    if (!ensureApiUrl()) {
      reject(new Error('API URL not set'));
      return;
    }

    const callbackName = `jsonp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const url = new URL(state.apiBaseUrl);
    url.searchParams.set('action', action);
    url.searchParams.set('cb', callbackName);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    const script = document.createElement('script');
    let done = false;

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      try { delete window[callbackName]; } catch (e) {}
    }

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error('응답 시간이 초과되었습니다.'));
    }, 10000);

    window[callbackName] = (data) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error('API 호출 실패'));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

async function testApiConnection() {
  try {
    const res = await jsonp('health');
    if (res.success) {
      alert('API 연결 성공');
    } else {
      alert('API 오류: ' + (res.error || '알 수 없음'));
    }
  } catch (err) {
    alert('API 호출 실패: ' + err.message);
  }
}

async function searchMembers() {
  const keyword = String(document.getElementById('memberSearchKeyword')?.value || '').trim();

  if (!keyword) {
    renderMemberResults([]);
    alert('이름, 회원ID, 전화번호 중 하나를 입력하세요.');
    return;
  }

  const btn = document.getElementById('memberSearchBtn');
  if (btn) btn.disabled = true;

  try {
    const res = await jsonp('findMembers', { keyword });

    if (!res.success) {
      throw new Error(res.error || '검색 실패');
    }

    state.searchResults = res.data?.members || [];
    renderMemberResults(state.searchResults);
  } catch (err) {
    alert('회원 검색 실패: ' + err.message);
    renderMemberResults([]);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderMemberResults(members) {
  const container = document.getElementById('memberSearchResults');
  if (!container) return;

  if (!members || members.length === 0) {
    container.innerHTML = '<p>검색 결과가 없습니다.</p>';
    return;
  }

  container.innerHTML = members.map(member => `
    <div class="member-card">
      <div><strong>${escapeHtml(member.name)}</strong> (${escapeHtml(member.memberId)})</div>
      <div>전화번호: ${escapeHtml(member.phone || '')}</div>
      <div>과정: ${escapeHtml(member.course || '')}</div>
      <div>잔여횟수: <span id="remaining-${escapeHtml(member.memberId)}">${member.remainingSessions ?? 0}</span></div>
      <div class="member-card-actions">
        <button onclick="checkinMember('${escapeJs(member.memberId)}')">출석체크</button>
      </div>
    </div>
  `).join('');
}

async function registerMember() {
  const payload = {
    name: document.getElementById('regName')?.value || '',
    phone: document.getElementById('regPhone')?.value || '',
    course: document.getElementById('regCourse')?.value || '',
    totalSessions: document.getElementById('regTotalSessions')?.value || 0,
    remainingSessions: document.getElementById('regRemainingSessions')?.value || 0,
    usedSessions: document.getElementById('regUsedSessions')?.value || 0,
    startDate: document.getElementById('regStartDate')?.value || '',
    note: document.getElementById('regNote')?.value || ''
  };

  const btn = document.getElementById('registerMemberBtn');
  if (btn) btn.disabled = true;

  try {
    const res = await jsonp('registerMember', payload);

    if (!res.success) {
      throw new Error(res.error || '회원등록 실패');
    }

    alert(`회원등록 완료: ${res.data.name} (${res.data.memberId})`);
    clearRegisterForm();
  } catch (err) {
    alert('회원등록 실패: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function checkinMember(memberId) {
  if (!memberId) return;

  try {
    const res = await jsonp('checkin', { memberId });

    if (!res.success) {
      throw new Error(res.error || '출석 실패');
    }

    const remainEl = document.getElementById(`remaining-${memberId}`);
    if (remainEl) {
      remainEl.textContent = res.data.remainingSessions;
    }

    alert(`${res.data.name} 출석 완료\\n잔여횟수: ${res.data.remainingSessions}`);
  } catch (err) {
    alert('출석 실패: ' + err.message);
  }
}

function clearRegisterForm() {
  ['regName', 'regPhone', 'regCourse', 'regTotalSessions', 'regRemainingSessions', 'regUsedSessions', 'regStartDate', 'regNote']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(value) {
  return String(value ?? '').replace(/'/g, "\\\\'");
}
"""

file_path = "/mnt/data/app.js"
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

file_path