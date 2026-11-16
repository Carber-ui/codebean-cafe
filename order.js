// 결제와 주문은 브라우저 안에서만 진행되는 시연입니다.
(() => {
  const sessionKey = 'your-cafe.session.v1';
  const session = () => { try { return localStorage.getItem(sessionKey) || ''; } catch { return ''; } };
  const member = session();
  if (!member) { location.replace('account.html?next=order'); return; }
  const cartKey = `your-cafe.cart.v1.${encodeURIComponent(member)}`;
  const guard = () => {
    if (session() === member) return true;
    location.replace('account.html?next=order');
    return false;
  };
  document.addEventListener('cafe:sessionchange', guard);
  window.addEventListener('storage', event => { if (event.key === sessionKey || event.key === null) guard(); });

  const { productById, temperaturePair, priceOf } = window.CODEBEAN_PRICING;
  const addOns = {
    shot: { name: '샷 추가', price: 500 },
    syrup: { name: '바닐라 시럽', price: 500 },
    caramel: { name: '카라멜 시럽', price: 500 },
    cream: { name: '휘핑크림 추가', price: 500 },
    pearl: { name: '펄 추가', price: 700 },
    aloe: { name: '알로에 추가', price: 700 },
    coconut: { name: '코코넛 젤리 추가', price: 700 }
  };
  const availableAddOns = product => {
    if (product.category === '커피') return ['shot', 'syrup', 'caramel', 'cream'];
    if (product.category === '라떼') return ['pearl', 'caramel', 'cream'];
    if (product.category === '에이드' || product.category === '주스') return ['aloe', 'coconut'];
    if (product.category === '티' && product.en.includes('MILK TEA')) return ['pearl', 'coconut', 'cream'];
    if (product.category === '티') return ['aloe', 'coconut'];
    if (product.category === '스무디·프라페') return ['cream'];
    return [];
  };
  const cold = product => product.category !== '디저트' && product.temperature !== '따뜻한';
  const adjustableIce = product => cold(product) && product.category !== '스무디·프라페' && product.en !== 'CUBE LATTE';
  const initialIce = product => adjustableIce(product) ? '보통' : '';
  const adjustableSweetness = product => product.category === '에이드' && product.en !== 'CHERRY COLA';
  const initialSweetness = product => adjustableSweetness(product) ? '보통' : '';
  const sizeAvailable = product => product.category !== '디저트' && product.en !== 'CUBE LATTE';
  const initialSize = product => sizeAvailable(product) ? '기본' : '';
  const lineKey = (id, ice, extras, sweetness, size) => JSON.stringify([id, ice, [...extras].sort(), sweetness, size]);
  const itemPrice = (product, extras, size) => priceOf(product) + extras.reduce((sum, extra) => sum + addOns[extra].price, 0) + (size === '사이즈 업' ? 1000 : 0);
  function decodeLine(key) {
    if (productById.has(key)) {
      const product = productById.get(key);
      return { product, ice: initialIce(product), extras: [], sweetness: initialSweetness(product), size: initialSize(product) };
    }
    let data;
    try { data = JSON.parse(key); } catch { return null; }
    if (!Array.isArray(data) || ![3, 4, 5].includes(data.length) || !productById.has(data[0]) || !Array.isArray(data[2])) return null;
    const product = productById.get(data[0]);
    const ice = data[1];
    const extras = data[2];
    const sweetness = data.length === 3 ? initialSweetness(product) : data[3];
    const size = data.length < 5 ? initialSize(product) : data[4];
    if (!(sizeAvailable(product) ? ['기본', '사이즈 업'].includes(size) : size === '')) return null;
    if (!(adjustableSweetness(product) ? ['보통', '덜 달게', '더 달게'].includes(sweetness) : sweetness === '')) return null;
    if (!(adjustableIce(product) ? ['보통', '적게', '많이', '없음'].includes(ice) : ice === '')) return null;
    if (extras.some(extra => !availableAddOns(product).includes(extra)) || new Set(extras).size !== extras.length) return null;
    return { product, ice, extras: [...extras].sort(), sweetness, size };
  }
  function optionText(item) {
    const parts = [];
    if (item.size === '사이즈 업') parts.push('사이즈 업');
    if (item.ice) parts.push(`얼음 ${item.ice}`);
    if (item.sweetness) parts.push(`당도: ${item.sweetness}`);
    parts.push(...item.extras.map(extra => addOns[extra].name));
    return parts.join(' · ');
  }
  const won = amount => `${amount.toLocaleString('ko-KR')}원`;
  const productGrid = document.querySelector('#order-products');
  const search = document.querySelector('#order-search');
  const empty = document.querySelector('#order-empty');
  const cartItems = document.querySelector('#cart-items');
  const cartEmpty = document.querySelector('#cart-empty');
  const cartCount = document.querySelector('#cart-count');
  const cartTotal = document.querySelector('#cart-total');
  const checkout = document.querySelector('#checkout-button');
  const mobileCart = document.querySelector('#mobile-cart');
  const dialog = document.querySelector('#checkout-dialog');
  const dialogContent = document.querySelector('#checkout-content');
  const optionDialog = document.querySelector('#option-dialog');
  const optionContent = document.querySelector('#option-content');
  const cartToast = document.querySelector('#cart-toast');
  let toastTimer;
  let selectedCategory = '전체';
  let selectedTemperature = '모두';
  let cart = {};

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || '{}');
      cart = {};
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      for (const [key, value] of Object.entries(saved)) {
        const line = decodeLine(key);
        if (!line || !Number.isInteger(value) || value <= 0 || value > 99) continue;
        const canonical = lineKey(line.product.en, line.ice, line.extras, line.sweetness, line.size);
        cart[canonical] = Math.min((cart[canonical] || 0) + value, 99);
      }
    } catch { cart = {}; }
  }
  function saveCart() {
    try { localStorage.setItem(cartKey, JSON.stringify(cart)); }
    catch { document.querySelector('#cart-error').hidden = false; }
  }
  function entries() { return Object.entries(cart).map(([id, quantity]) => ({ id, quantity, ...decodeLine(id) })); }
  function total() { return entries().reduce((sum, item) => sum + itemPrice(item.product, item.extras, item.size) * item.quantity, 0); }
  function quantity() { return entries().reduce((sum, item) => sum + item.quantity, 0); }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function changeQuantity(id, change) {
    if (!guard()) return;
    const next = (cart[id] || 0) + change;
    if (next <= 0) delete cart[id]; else cart[id] = Math.min(next, 99);
    saveCart(); renderCart();
  }
  function renderCart() {
    const items = entries();
    cartEmpty.hidden = items.length > 0;
    cartItems.replaceChildren(...items.map(({ id, quantity: count, product, ice, extras, sweetness, size }) => {
      const row = el('li', 'cart-item');
      const info = el('div', 'cart-item-info');
      const name = el('strong', '', product.name);
      const kind = product.category === '디저트' ? '' : product.temperature === '따뜻한' ? 'HOT' : 'ICE';
      info.append(name);
      if (kind) info.append(el('span', 'cart-kind', kind));
      const options = optionText({ ice, extras, sweetness, size });
      if (options) info.append(el('span', 'cart-item-options', options));
      const price = el('span', 'cart-item-price', won(itemPrice(product, extras, size) * count));
      const controls = el('div', 'quantity');
      const minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', `${product.name} ${kind} ${options} 수량 줄이기`); minus.addEventListener('click', () => changeQuantity(id, -1));
      const value = el('span', '', String(count));
      const plus = el('button', '', '+'); plus.type = 'button'; plus.disabled = count >= 99; plus.setAttribute('aria-label', `${product.name} ${kind} ${options} 수량 늘리기`); plus.addEventListener('click', () => changeQuantity(id, 1));
      controls.append(minus, value, plus);
      row.append(info, price, controls);
      return row;
    }));
    const count = quantity();
    cartCount.textContent = `${count}개`;
    cartTotal.textContent = won(total());
    checkout.disabled = count === 0;
    mobileCart.hidden = count === 0;
    document.querySelector('#mobile-count').textContent = count;
    document.querySelector('#mobile-total').textContent = won(total());
  }
  function renderProducts() {
    const term = search.value.trim();
    const filtered = products.map(product => ({ product, id: product.en })).filter(({ product }) => {
      const matchesCategory = selectedCategory === '전체' || product.category === selectedCategory || (selectedCategory === '라떼' && product.category === '커피' && product.name.includes('라떼'));
      const temp = product.category === '디저트' ? null : (product.temperature || '차가운');
      const matchesTemp = selectedTemperature === '모두' || selectedTemperature === temp;
      return matchesCategory && matchesTemp && (matchesSearch(product.name, term) || matchesSearch(product.en, term));
    });
    empty.hidden = filtered.length !== 0;
    productGrid.replaceChildren(...filtered.map(({ product, id }) => {
      const card = el('button', 'order-product');
      card.type = 'button';
      card.setAttribute('aria-label', `${product.name}${product.category === '디저트' ? '' : product.temperature === '따뜻한' ? ' HOT' : ' ICE'} 선택`);
      const image = el('div', 'order-product-image');
      image.style.backgroundImage = `url('assets/${product.image}')`;
      image.style.backgroundPosition = product.position;
      image.setAttribute('aria-hidden', 'true');
      const name = el('span', 'order-product-name', product.name);
      if (product.category !== '디저트') name.append(el('span', 'order-temperature', product.temperature === '따뜻한' ? 'HOT' : 'ICE'));
      const bottom = el('div', 'order-product-bottom');
      bottom.append(el('strong', '', won(priceOf(product))));
      card.append(image, name, bottom);
      card.addEventListener('click', () => openOptions(product));
      return card;
    }));
  }
  document.querySelectorAll('.order-filter').forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    const temperatures = document.querySelector('#order-temperatures');
    temperatures.hidden = selectedCategory === '디저트';
    if (temperatures.hidden) setTemperature('모두');
    document.querySelectorAll('.order-filter').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    renderProducts();
  }));
  function setTemperature(value) {
    selectedTemperature = value;
    document.querySelectorAll('.order-temp').forEach(button => { const active = button.dataset.temperature === value; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  }
  document.querySelectorAll('.order-temp').forEach(button => button.addEventListener('click', () => { setTemperature(button.dataset.temperature); renderProducts(); }));
  search.addEventListener('input', renderProducts);

  function openOptions(originalProduct) {
    if (!guard()) return;
    let selectedProduct = originalProduct;
    const pair = temperaturePair.get(originalProduct.en);
    const temperatures = pair ? `<fieldset class="option-section"><legend>HOT / ICE</legend><div class="option-choices">${pair.map((id, index) => `<label><input type="radio" name="drink-temperature" value="${id}" ${id === originalProduct.en ? 'checked' : ''}><span>${index === 0 ? 'HOT' : 'ICE'}${index === 1 ? ' +500원' : ''}</span></label>`).join('')}</div></fieldset>` : '';
    const size = sizeAvailable(originalProduct) ? `<fieldset class="option-section"><legend>사이즈</legend><div class="option-choices"><label><input type="radio" name="size" value="기본" checked><span>기본</span></label><label><input type="radio" name="size" value="사이즈 업"><span>사이즈 업 +1,000원</span></label></div></fieldset>` : '';
    const options = availableAddOns(originalProduct);
    const extras = options.length ? `<fieldset class="option-section"><legend>추가 옵션</legend><div class="option-extras">${options.map(id => `<label><input type="checkbox" name="extra" value="${id}"><span>${addOns[id].name}</span><strong>+${won(addOns[id].price)}</strong></label>`).join('')}</div></fieldset>` : '';
    const sweetness = adjustableSweetness(originalProduct) ? `<fieldset class="option-section"><legend>당도</legend><div class="option-choices">${['보통','덜 달게','더 달게'].map((value, index) => `<label><input type="radio" name="sweetness" value="${value}" ${index === 0 ? 'checked' : ''}><span>${value}</span></label>`).join('')}</div></fieldset>` : '';
    optionContent.innerHTML = `<button class="option-close" type="button" aria-label="닫기">×</button><div class="option-product"><div class="option-image" aria-hidden="true"></div><div><h2 id="option-title"></h2><p class="option-description"></p><strong class="option-base-price"></strong></div></div>${temperatures}<fieldset class="option-section" id="ice-options" hidden><legend>얼음</legend><div class="option-choices">${['보통','적게','많이','없음'].map((value, index) => `<label><input type="radio" name="ice" value="${value}" ${index === 0 ? 'checked' : ''}><span>${value}</span></label>`).join('')}</div></fieldset>${size}${sweetness}${extras}<button class="option-add" type="button"><span>장바구니에 담기</span><strong></strong></button>`;
    const image = optionContent.querySelector('.option-image');
    const iceOptions = optionContent.querySelector('#ice-options');
    const addButton = optionContent.querySelector('.option-add');
    function selectedExtras() { return [...optionContent.querySelectorAll('input[name="extra"]:checked')].map(input => input.value); }
    function updateOptions() {
      const temperature = optionContent.querySelector('input[name="drink-temperature"]:checked');
      if (temperature) selectedProduct = productById.get(temperature.value);
      optionContent.querySelector('#option-title').textContent = selectedProduct.name;
      optionContent.querySelector('.option-description').textContent = selectedProduct.description;
      optionContent.querySelector('.option-base-price').textContent = won(priceOf(selectedProduct));
      image.style.backgroundImage = `url('assets/${selectedProduct.image}')`;
      image.style.backgroundPosition = selectedProduct.position;
      iceOptions.hidden = !adjustableIce(selectedProduct);
      const size = optionContent.querySelector('input[name="size"]:checked')?.value || '';
      addButton.querySelector('strong').textContent = won(itemPrice(selectedProduct, selectedExtras(), size));
    }
    optionContent.onchange = updateOptions;
    optionContent.querySelector('.option-close').addEventListener('click', () => optionDialog.close());
    addButton.addEventListener('click', () => {
      if (!guard()) return;
      const ice = adjustableIce(selectedProduct) ? optionContent.querySelector('input[name="ice"]:checked').value : '';
      const sweetness = adjustableSweetness(selectedProduct) ? optionContent.querySelector('input[name="sweetness"]:checked').value : '';
      const size = sizeAvailable(selectedProduct) ? optionContent.querySelector('input[name="size"]:checked').value : '';
      const id = lineKey(selectedProduct.en, ice, selectedExtras(), sweetness, size);
      changeQuantity(id, 1);
      optionDialog.close();
      cartToast.textContent = '장바구니에 담았습니다.';
      cartToast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { cartToast.hidden = true; }, 2200);
    });
    updateOptions();
    optionDialog.showModal();
    optionContent.querySelector('.option-close').focus();
  }
  optionDialog.addEventListener('click', event => { if (event.target === optionDialog) optionDialog.close(); });

  const stores = window.CODEBEAN_STORES;
  const paymentChoices = [
    { name: '토스', image: 'payment-toss-app.jpg' },
    { name: '카카오페이', image: 'payment-kakaopay-app.jpg' },
    { name: '네이버페이', image: 'payment-naverpay-app.jpg' },
    { name: '카카오뱅크', image: 'payment-kakaobank-app.jpg' },
    { name: '카드', image: 'payment-card.svg' },
    { name: '계좌이체', image: 'payment-transfer.svg' }
  ];
  function orderLine(item) {
    const line = el('li', 'checkout-item');
    const temperature = item.product.category === '디저트' ? '' : item.product.temperature === '따뜻한' ? ' HOT' : ' ICE';
    const info = el('span', 'checkout-item-info', `${item.product.name}${temperature} · ${item.quantity}개`);
    const options = optionText(item);
    if (options) info.append(el('span', 'checkout-item-options', options));
    line.append(info, el('strong', '', won(itemPrice(item.product, item.extras, item.size) * item.quantity)));
    return line;
  }
  function showCheckout(stage, order) {
    if (stage !== 'complete' && (!guard() || quantity() === 0)) { if (dialog.open) dialog.close(); return; }
    if (stage === 'complete') {
      dialogContent.innerHTML = `<div class="checkout-complete"><div class="complete-mark" aria-hidden="true">✓</div><h2 id="checkout-title">주문 완료</h2><div class="receipt"><ul class="checkout-items" id="receipt-items"></ul><dl class="receipt-details"><div><dt>매장</dt><dd id="receipt-store"></dd></div><div><dt>이용 방법</dt><dd id="receipt-service"></dd></div><div id="receipt-address-row" hidden><dt>배달 주소</dt><dd id="receipt-address"></dd></div><div><dt>일회용품</dt><dd id="receipt-supplies"></dd></div><div><dt>결제 수단</dt><dd id="receipt-payment"></dd></div><div id="receipt-request-row" hidden><dt>요청사항</dt><dd id="receipt-request"></dd></div><div class="receipt-total"><dt>결제 금액</dt><dd id="receipt-total"></dd></div></dl></div><button class="checkout-primary" type="button" id="finish-order">확인</button></div>`;
      document.querySelector('#receipt-items').replaceChildren(...order.items.map(orderLine));
      document.querySelector('#receipt-store').textContent = order.store;
      document.querySelector('#receipt-service').textContent = order.service;
      if (order.address) {
        document.querySelector('#receipt-address-row').hidden = false;
        document.querySelector('#receipt-address').textContent = order.address;
      }
      document.querySelector('#receipt-supplies').textContent = order.supplies ? '받기' : '받지 않음';
      document.querySelector('#receipt-payment').textContent = order.payment;
      document.querySelector('#receipt-total').textContent = won(order.amount);
      if (order.request) {
        document.querySelector('#receipt-request-row').hidden = false;
        document.querySelector('#receipt-request').textContent = order.request;
      }
      document.querySelector('#finish-order').addEventListener('click', () => dialog.close());
    } else {
      const paymentOptions = paymentChoices.map((method, index) => `<label class="payment-option"><input type="radio" name="payment" value="${method.name}" ${index === 0 ? 'checked' : ''}><span class="payment-option-body"><img src="assets/${method.image}" alt=""><span>${method.name}</span></span></label>`).join('');
      dialogContent.innerHTML = `<button class="checkout-close" type="button" aria-label="닫기">×</button><h2 id="checkout-title">가상 결제</h2>
        <section class="checkout-section"><h3>주문 메뉴 <span id="checkout-count"></span></h3><ul class="checkout-items" id="checkout-items"></ul><div class="checkout-total"><span>결제 금액</span><strong id="checkout-amount"></strong></div></section>
        <div class="checkout-section store-section"><h3>매장 선택</h3><details class="store-picker" id="checkout-store"><summary class="store-summary" aria-describedby="store-error"><span class="store-pin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z"></path><circle cx="12" cy="10" r="2.4"></circle></svg></span><span class="store-summary-text"><strong id="store-selected">매장을 선택해 주세요</strong><small id="store-region">안양시</small></span><span class="store-chevron" aria-hidden="true">⌄</span></summary><fieldset class="store-options" aria-label="매장 선택"><div class="store-grid" id="store-options"></div></fieldset></details><p class="store-error" id="store-error" role="alert" hidden>매장을 선택해 주세요.</p></div>
        <fieldset class="checkout-section choice-section"><legend>이용 방법</legend><div class="service-options"><label><input type="radio" name="service" value="포장" checked><span>포장</span></label><label><input type="radio" name="service" value="매장"><span>매장</span></label><label><input type="radio" name="service" value="배달"><span>배달</span></label></div></fieldset>
        <div class="checkout-section delivery-address" hidden><label for="delivery-address">배달 주소</label><input type="text" id="delivery-address" autocomplete="street-address" maxlength="120" placeholder="주소를 입력해 주세요"><label class="address-detail-label" for="delivery-detail">상세 주소 <span>선택</span></label><input type="text" id="delivery-detail" autocomplete="address-line2" maxlength="80" placeholder="동·호수 등"></div>
        <div class="checkout-section supply-options"><label><input type="checkbox" name="supplies"><span>일회용품 받기</span></label></div>
        <div class="checkout-section request-section"><label for="checkout-request">요청사항 <span>선택</span></label><textarea id="checkout-request" rows="2" maxlength="100" placeholder="요청사항을 입력해 주세요."></textarea></div>
        <fieldset class="checkout-section payment-methods"><legend>결제 수단</legend><div class="payment-options">${paymentOptions}</div></fieldset><button class="checkout-primary" type="button" id="checkout-next">결제하기</button>`;
      document.querySelector('#checkout-items').replaceChildren(...entries().map(orderLine));
      document.querySelector('#checkout-count').textContent = `${quantity()}개`;
      document.querySelector('#checkout-amount').textContent = won(total());
      document.querySelector('.checkout-close').addEventListener('click', () => dialog.close());
      const storePicker = document.querySelector('#checkout-store');
      const storeSummary = storePicker.querySelector('summary');
      const storeError = document.querySelector('#store-error');
      const storeOptions = document.querySelector('#store-options');
      const selectedStore = () => storeOptions.querySelector('input[name="store"]:checked');
      stores.forEach(store => {
        const option = el('label', 'store-option');
        const input = el('input');
        input.type = 'radio'; input.name = 'store'; input.value = store.name;
        const content = el('span', 'store-option-content');
        const district = store.address.includes('만안구') ? '만안구' : '동안구';
        content.append(el('strong', '', store.name), el('small', '', district));
        const check = el('span', 'store-option-check', '✓'); check.setAttribute('aria-hidden', 'true');
        option.append(input, content, check);
        storeOptions.append(option);
        input.addEventListener('change', () => {
          document.querySelector('#store-selected').textContent = store.name;
          document.querySelector('#store-region').textContent = district;
          storeError.hidden = true;
          storeSummary.removeAttribute('aria-invalid');
        });
        input.addEventListener('click', () => { storePicker.open = false; storeSummary.focus({ preventScroll: true }); });
        input.addEventListener('keydown', event => {
          if (event.key === 'Enter') { event.preventDefault(); storePicker.open = false; storeSummary.focus({ preventScroll: true }); }
        });
      });
      const addressSection = document.querySelector('.delivery-address');
      const addressInput = document.querySelector('#delivery-address');
      const addressDetail = document.querySelector('#delivery-detail');
      const selectedService = () => dialogContent.querySelector('input[name="service"]:checked').value;
      dialogContent.querySelectorAll('input[name="service"]').forEach(input => input.addEventListener('change', () => {
        addressSection.hidden = selectedService() !== '배달';
        addressInput.required = !addressSection.hidden;
        addressInput.setCustomValidity('');
      }));
      addressInput.addEventListener('input', () => addressInput.setCustomValidity(''));
      document.querySelector('#checkout-next').addEventListener('click', () => {
        if (!guard() || quantity() === 0) return;
        if (!selectedStore()) {
          storeError.hidden = false; storeSummary.setAttribute('aria-invalid', 'true');
          storePicker.open = true; storeSummary.focus(); return;
        }
        if (selectedService() === '배달') {
          addressInput.setCustomValidity(addressInput.value.trim() ? '' : '배달 주소를 입력해 주세요.');
          if (!addressInput.reportValidity()) return;
        }
        const order = {
          items: entries(), amount: total(),
          service: selectedService(), store: selectedStore().value,
          address: selectedService() === '배달' ? [addressInput.value.trim(), addressDetail.value.trim()].filter(Boolean).join(' ') : '',
          supplies: dialogContent.querySelector('input[name="supplies"]').checked,
          payment: dialogContent.querySelector('input[name="payment"]:checked').value,
          request: document.querySelector('#checkout-request').value.trim()
        };
        cart = {}; saveCart(); renderCart(); closeMobileCart(); showCheckout('complete', order);
      });
    }
    dialog.scrollTop = 0;
    dialogContent.querySelector('button')?.focus();
  }
  checkout.addEventListener('click', () => { if (!guard() || !quantity()) return; showCheckout('payment'); dialog.showModal(); dialogContent.querySelector('button')?.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (!dialog.open) dialogContent.replaceChildren(); });
  window.addEventListener('storage', event => {
    if (event.key === cartKey && !dialog.open) { loadCart(); renderCart(); }
  });
  const cartPanel = document.querySelector('#cart');
  const cartBackdrop = document.querySelector('.cart-backdrop');
  function closeMobileCart() {
    cartPanel.classList.remove('is-open');
    cartBackdrop.hidden = true;
    mobileCart.setAttribute('aria-expanded', 'false');
  }
  mobileCart.addEventListener('click', () => {
    cartToast.hidden = true;
    clearTimeout(toastTimer);
    cartPanel.classList.add('is-open');
    cartBackdrop.hidden = false;
    mobileCart.setAttribute('aria-expanded', 'true');
    document.querySelector('.cart-close').focus();
  });
  document.querySelector('.cart-close').addEventListener('click', () => { closeMobileCart(); if (!mobileCart.hidden) mobileCart.focus(); });
  cartBackdrop.addEventListener('click', closeMobileCart);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.open && cartPanel.classList.contains('is-open')) closeMobileCart(); });
  window.matchMedia('(min-width: 721px)').addEventListener('change', event => { if (event.matches) closeMobileCart(); });
  loadCart(); renderProducts(); renderCart();
})();
