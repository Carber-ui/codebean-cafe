const grid = document.querySelector('#menu-grid');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty');
const dialog = document.querySelector('#detail-dialog');
const content = document.querySelector('#dialog-content');
const temperatureBar = document.querySelector('#temperature-bar');
const moreMenu = document.querySelector('#more-menu');
let category = '전체';
let temperature = '모두';
let visibleLimit = 18;
let previousFocus;

const categoryOrder = ['커피', '라떼', '에이드', '티', '주스', '스무디·프라페', '디저트'];
const menuProducts = [...products].sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
const productTemperature = product => product.category === '디저트' ? null : (product.temperature || '차가운');

// 검색어, 메뉴 분류, 온도를 함께 적용합니다.
function renderMenu() {
  const term = search.value.trim();
  const filtered = menuProducts.filter(product => {
    const matchesCategory = category === '전체'
      || (category === '음료' && product.category !== '디저트')
      || (category === '라떼' && product.category === '커피' && product.name.includes('라떼'))
      || product.category === category;
    const matchesTemperature = temperature === '모두' || productTemperature(product) === temperature;
    return matchesCategory && matchesTemperature
      && (matchesSearch(product.name, term) || matchesSearch(product.en, term));
  });
  const shown = filtered.slice(0, visibleLimit);
  empty.hidden = filtered.length !== 0;
  moreMenu.hidden = shown.length >= filtered.length;
  temperatureBar.hidden = category === '디저트';

  grid.replaceChildren(...shown.map(product => {
    const button = document.createElement('button');
    button.className = 'product';
    const temp = productTemperature(product);
    const tempLabel = temp === '따뜻한' ? 'HOT' : temp === '차가운' ? 'ICE' : '';
    const formattedPrice = `${window.CODEBEAN_PRICING.priceOf(product).toLocaleString('ko-KR')}원`;
    button.setAttribute('aria-label', `${product.name}${tempLabel ? ` ${tempLabel}` : ''} ${formattedPrice} 상세 보기`);

    const image = document.createElement('div');
    image.className = 'product-img';
    image.style.backgroundImage = `url('assets/${product.image}')`;
    image.style.backgroundPosition = product.position;
    if (temp) {
      const badge = document.createElement('span');
      badge.className = temp === '따뜻한' ? 'temperature-badge warm' : 'temperature-badge cold';
      badge.textContent = tempLabel;
      image.append(badge);
    }

    const info = document.createElement('div');
    info.className = 'product-info';
    const text = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = product.name;
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = formattedPrice;
    text.append(title, price);

    const arrow = document.createElement('span');
    arrow.className = 'product-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';

    info.append(text, arrow);
    button.append(image, info);
    button.addEventListener('click', () => openProduct(product));
    return button;
  }));
}

function showDialog(html) {
  previousFocus = document.activeElement;
  content.innerHTML = html;
  dialog.showModal();
  document.querySelector('#close-dialog').focus();
}

function openProduct(product) {
  showDialog(`<div class="dialog-content"><span class="dialog-kicker">${product.category === '디저트' ? '푸드' : product.category}</span><div class="dialog-img" role="img" aria-label="${product.name}" style="background-image:url('assets/${product.image}');background-position:${product.position}"></div><h3 id="dialog-title">${product.name}</h3><strong class="product-price">${window.CODEBEAN_PRICING.priceOf(product).toLocaleString('ko-KR')}원</strong><p>${product.description}</p></div>`);
}

function selectCategory(nextCategory) {
  category = nextCategory;
  visibleLimit = 18;
  if (category === '디저트') setTemperature('모두', false);
  document.querySelectorAll('.tab').forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderMenu();
}

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => selectCategory(button.dataset.category));
});

function setTemperature(nextTemperature, shouldRender = true) {
  temperature = nextTemperature;
  visibleLimit = 18;
  document.querySelectorAll('.temperature-option').forEach(button => {
    const active = button.dataset.temperature === temperature;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (shouldRender) renderMenu();
}
document.querySelectorAll('.temperature-option').forEach(button => {
  button.addEventListener('click', () => setTemperature(button.dataset.temperature));
});
moreMenu.addEventListener('click', () => {
  const firstNewIndex = visibleLimit;
  visibleLimit += 18;
  renderMenu();
  grid.children[firstNewIndex]?.focus({preventScroll: true});
});
search.addEventListener('input', () => {
  visibleLimit = 18;
  renderMenu();
});
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => previousFocus?.focus());

const initialCategory = new URLSearchParams(location.search).get('category');
if (['음료', '디저트', ...categoryOrder].includes(initialCategory)) selectCategory(initialCategory);
else renderMenu();

