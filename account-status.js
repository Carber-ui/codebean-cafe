// 상단 로그인 상태를 현재 브라우저의 계정 상태와 맞춥니다.
const CAFE_SESSION_KEY = 'your-cafe.session.v1';
const accountLink = document.querySelector('[data-account-link]');
const accountName = document.querySelector('[data-account-name]');
const logoutButton = document.querySelector('[data-account-logout]');

function updateAccountStatus() {
  let id = '';
  try { id = localStorage.getItem(CAFE_SESSION_KEY) || ''; } catch { /* 저장소를 사용할 수 없는 경우 로그인 링크를 표시합니다. */ }
  accountLink.hidden = Boolean(id);
  accountName.hidden = !id;
  logoutButton.hidden = !id;
  accountName.textContent = id ? `${id}님` : '';
  accountName.title = id ? `${id}님` : '';
}

logoutButton.addEventListener('click', () => {
  localStorage.removeItem(CAFE_SESSION_KEY);
  updateAccountStatus();
  document.dispatchEvent(new Event('cafe:sessionchange'));
  accountLink.focus();
});
window.addEventListener('storage', event => {
  if (event.key === CAFE_SESSION_KEY || event.key === null) updateAccountStatus();
});
updateAccountStatus();
