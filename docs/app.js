const STORAGE_KEY = 'attendance_api_url';

const state = {
  apiBaseUrl: localStorage.getItem(STORAGE_KEY) || '',
};

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const settingsDialog = document.getElementById('settingsDialog');
const apiBaseUrlInput = document.getElementById('apiBaseUrl');
const memberResults = document.getElementById('memberResults');
const manageResults = document.getElementById('manageResults');

function setApiUrl(url) {
  state.apiBaseUrl = url.trim();
  localStorage.setItem(STORAGE_KEY, state.apiBaseUrl);
  apiBaseUrlInput.value = state.apiBaseUrl;
}

function ensureApiUrl() {
  if (!state.apiBaseUrl) {
    showToast('먼저 환경설정에서 Apps Script 웹앱 URL을 저장해 주세요.');
    settingsDialog.showModal();
    return false;
  }
  return true;
}

function switchTab(tabName) {
  tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  panels.forEach(panel => panel.classList.toggle('active', panel.id === tabName));
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('openSettingsBtn').addEventListener('click', () => {
  apiBaseUrlInput.value = state.apiBaseUrl;
  settingsDialog.showModal();
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  const value = apiBaseUrlInput.value.trim();
  if (!value) {
    showToast('웹앱 URL을 입력해 주세요.');
    return;
  }
  setApiUrl(value);
  settingsDialog.close();
  showToast('환경설정이 저장되었습니다.');
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
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
    url.searchParams.set('callback', callbackName);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    const script = document.createElement('script');
    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      delete window[callbackName];
      script.remove();
    }

    script.onerror = () => {
      cleanup();
      reject(new Error('API 호출 실패'));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function formatMemberInfo(member) {
  return `전화번호: ${member.phone || '-'}<br>
  회원코드: ${member.memberId}<br>
  과정: ${member.course || '-'}<br>
  총 등록횟수: ${member.totalSessions}<br>
  사용횟수: ${member.usedSessions}<br>
  시작일: ${member.startDate || '-'}<br>
  메모: ${member.note || '-'}`;
}

function renderCheckinResults(members) {
  if (!members || members.length === 0) {
    memberResults.className = 'member-list empty';
    memberResults.textContent = '검색 결과가 없습니다.';
    return;
  }

  memberResults.className = 'member-list';
  memberResults.innerHTML = '';
  const tpl = document.getElementById('memberCardTemplate');

  members.forEach(member => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.member-name').textContent = member.name;
    node.querySelector('.member-meta').textContent = `${member.course || '-'} · ${member.memberId}`;
    const badge = node.querySelector('.remaining');
    badge.textContent = `잔여 ${member.remainingSessions}회`;
    if (Number(member.remainingSessions) <= 0) badge.classList.add('zero');
    node.querySelector('.member-info').innerHTML = formatMemberInfo(member);

    node.querySelector('.checkin-btn').addEventListener('click', async () => {
      if (Number(member.remainingSessions) <= 0) {
        showToast('잔여횟수가 0회입니다. 먼저 회원관리에서 수정해 주세요.');
        return;
      }
      try {
        const result = await jsonp('checkin', { memberId: member.memberId });
        if (!result.success) throw new Error(result.message || '출석체크 실패');
        showToast(`${member.name} 출석 완료 · 잔여 ${result.data.remainingSessions}회`);
        searchMembers(document.getElementById('searchKeyword').value.trim());
      } catch (error) {
        showToast(error.message || '출석체크 중 오류가 발생했습니다.');
      }
    });

    node.querySelector('.refresh-btn').addEventListener('click', () => {
      searchMembers(document.getElementById('searchKeyword').value.trim());
    });

    memberResults.appendChild(node);
  });
}

function renderManageResults(members) {
  if (!members || members.length === 0) {
    manageResults.className = 'member-list empty';
    manageResults.textContent = '검색 결과가 없습니다.';
    return;
  }

  manageResults.className = 'member-list';
  manageResults.innerHTML = '';
  const tpl = document.getElementById('manageCardTemplate');

  members.forEach(member => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.member-name').textContent = member.name;
    node.querySelector('.member-meta').textContent = `${member.course || '-'} · ${member.memberId}`;
    const badge = node.querySelector('.remaining');
    badge.textContent = `잔여 ${member.remainingSessions}회`;
    if (Number(member.remainingSessions) <= 0) badge.classList.add('zero');
    node.querySelector('.member-info').innerHTML = formatMemberInfo(member);

    const form = node.querySelector('.manage-form');
    form.remainingSessions.value = member.remainingSessions;
    form.totalSessions.value = member.totalSessions;
    form.note.value = member.note || '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const result = await jsonp('updateMember', {
          memberId: member.memberId,
          remainingSessions: form.remainingSessions.value,
          totalSessions: form.totalSessions.value,
          note: form.note.value,
        });
        if (!result.success) throw new Error(result.message || '수정 실패');
        showToast(`${member.name} 회원정보 수정 완료`);
        manageMembers(document.getElementById('manageKeyword').value.trim());
      } catch (error) {
        showToast(error.message || '회원정보 수정 중 오류가 발생했습니다.');
      }
    });

    manageResults.appendChild(node);
  });
}

async function searchMembers(keyword) {
  try {
    const result = await jsonp('findMembers', { keyword });
    if (!result.success) throw new Error(result.message || '검색 실패');
    renderCheckinResults(result.data.members || []);
  } catch (error) {
    showToast(error.message || '회원 검색 중 오류가 발생했습니다.');
  }
}

async function manageMembers(keyword) {
  try {
    const result = await jsonp('findMembers', { keyword });
    if (!result.success) throw new Error(result.message || '검색 실패');
    renderManageResults(result.data.members || []);
  } catch (error) {
    showToast(error.message || '회원 검색 중 오류가 발생했습니다.');
  }
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('searchKeyword').value.trim();
  searchMembers(keyword);
});

document.getElementById('manageSearchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('manageKeyword').value.trim();
  manageMembers(keyword);
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await jsonp('registerMember', payload);
    if (!result.success) throw new Error(result.message || '회원 등록 실패');
    e.target.reset();
    showToast(`회원 등록 완료 · 회원코드 ${result.data.memberId}`);
    switchTab('manage');
    document.getElementById('manageKeyword').value = result.data.memberId;
    manageMembers(result.data.memberId);
  } catch (error) {
    showToast(error.message || '회원 등록 중 오류가 발생했습니다.');
  }
});

apiBaseUrlInput.value = state.apiBaseUrl;

const params = new URLSearchParams(location.search);
const queryKeyword = params.get('q');
if (queryKeyword) {
  document.getElementById('searchKeyword').value = queryKeyword;
  searchMembers(queryKeyword);
}
