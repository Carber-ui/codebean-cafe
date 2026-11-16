// 이 파일의 계정은 현재 브라우저에만 저장됩니다.
const ACCOUNTS_KEY = 'your-cafe.accounts.v1';
const SESSION_KEY = 'your-cafe.session.v1';
const ITERATIONS = 120000;
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const title = document.querySelector('#account-title');
const message = document.querySelector('#account-message');
const returnToOrder = new URLSearchParams(location.search).get('next') === 'order';
if (returnToOrder) showMessage('주문하려면 로그인해 주세요.');

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function getAccounts() {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  const accounts = JSON.parse(raw);
  if (!Array.isArray(accounts)) throw new Error('저장된 계정 정보를 읽을 수 없습니다.');
  return accounts;
}

function normalizeId(id) {
  return id.trim().toLocaleLowerCase();
}

function toHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) throw new Error('저장된 계정 정보를 읽을 수 없습니다.');
  return Uint8Array.from(hex.match(/../g), byte => parseInt(byte, 16));
}

async function derivePassword(password, salt, iterations) {
  if (!globalThis.crypto?.subtle) throw new Error('이 브라우저에서는 로그인을 사용할 수 없습니다.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt, iterations}, key, 256);
  return toHex(new Uint8Array(bits));
}

function setMode(mode) {
  const isSignup = mode === 'signup';
  loginForm.hidden = isSignup;
  signupForm.hidden = !isSignup;
  title.textContent = isSignup ? '회원가입' : '로그인';
  document.title = `${title.textContent} | 코드빈`;
  showMessage('');
  (isSignup ? document.querySelector('#signup-id') : document.querySelector('#login-id')).focus();
}

document.querySelectorAll('[data-account-mode]').forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.accountMode));
});

signupForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = signupForm.querySelector('[type="submit"]');
  const id = document.querySelector('#signup-id').value.trim();
  const password = document.querySelector('#signup-password').value;
  const confirmation = document.querySelector('#signup-confirm').value;
  if (!/^[A-Za-z0-9가-힣_]{3,20}$/.test(id)) {
    showMessage('아이디는 한글, 영문, 숫자, 밑줄로 3~20자 입력해 주세요.');
    return;
  }
  if (password !== confirmation) {
    showMessage('비밀번호가 일치하지 않습니다.');
    return;
  }
  button.disabled = true;
  showMessage('');
  try {
    const key = normalizeId(id);
    if (getAccounts().some(account => account.key === key)) {
      showMessage('이미 사용 중인 아이디입니다.');
      return;
    }
    if (!globalThis.crypto?.subtle) throw new Error('이 브라우저에서는 회원가입을 사용할 수 없습니다.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await derivePassword(password, salt, ITERATIONS);
    const accounts = getAccounts();
    if (accounts.some(account => account.key === key)) {
      showMessage('이미 사용 중인 아이디입니다.');
      return;
    }
    accounts.push({id, key, salt:toHex(salt), hash, iterations:ITERATIONS});
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(SESSION_KEY, id);
    window.location.href = returnToOrder ? 'order.html' : 'index.html#top';
  } catch (error) {
    showMessage(error.message || '회원가입을 완료하지 못했습니다.');
  } finally {
    button.disabled = false;
  }
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = loginForm.querySelector('[type="submit"]');
  const id = normalizeId(document.querySelector('#login-id').value);
  const password = document.querySelector('#login-password').value;
  button.disabled = true;
  showMessage('');
  try {
    const account = getAccounts().find(item => item.key === id);
    if (!account) {
      showMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }
    const hash = await derivePassword(password, fromHex(account.salt), account.iterations);
    if (hash !== account.hash) {
      showMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }
    localStorage.setItem(SESSION_KEY, account.id);
    window.location.href = returnToOrder ? 'order.html' : 'index.html#top';
  } catch (error) {
    showMessage(error.message || '로그인을 완료하지 못했습니다.');
  } finally {
    button.disabled = false;
  }
});
