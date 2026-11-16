(() => {
  const list = document.querySelector('#stores-list');
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  list.replaceChildren(...window.CODEBEAN_STORES.map(store => {
    const card = create('li', 'store-card');
    const title = create('h2', '', store.name);
    const info = create('dl', 'store-info');
    for (const [label, value] of [['주소', store.address], ['영업시간', store.hours]]) {
      const row = create('div', 'store-info-row');
      row.append(create('dt', '', label), create('dd', '', value));
      info.append(row);
    }
    card.append(title, info);
    return card;
  }));
})();
