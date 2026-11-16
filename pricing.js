// 메뉴와 주문 화면에서 같은 가격을 사용합니다.
(() => {
  const prices = {
    'ICED AMERICANO': 2000, 'HOT AMERICANO': 2000,
    'ICED CAFE LATTE': 3500, 'HOT CAFE LATTE': 3500,
    'STRAWBERRY LATTE': 4000, 'LEMON ADE': 4000,
    'BUTTER CROISSANT': 3500, 'SALT BREAD': 3000
  };
  const categoryPrices = { '커피': 3900, '라떼': 4000, '에이드': 4000, '티': 3500, '주스': 4500, '스무디·프라페': 4800, '디저트': 3800 };
  const productById = new Map(products.map(product => [product.en, product]));
  const temperaturePairs = [
    ['HOT AMERICANO', 'ICED AMERICANO'], ['HOT CAFE LATTE', 'ICED CAFE LATTE'],
    ['HOT VANILLA LATTE', 'VANILLA LATTE'], ['HOT CARAMEL MACCHIATO', 'CARAMEL MACCHIATO'],
    ['HOT CAFE MOCHA', 'CAFE MOCHA'], ['HOT GREEN TEA LATTE', 'GREEN TEA LATTE'],
    ['HOT TOFFEE NUT LATTE', 'ICED TOFFEE NUT LATTE'], ['HOT ROYAL MILK TEA', 'ROYAL MILK TEA'],
    ['HOT CITRON TEA', 'CITRON TEA'], ['HOT CHAMOMILE TEA', 'ICED CHAMOMILE TEA']
  ];
  const temperaturePair = new Map(temperaturePairs.flatMap(pair => pair.map(id => [id, pair])));
  const basePrice = product => prices[product.en] ?? categoryPrices[product.category];
  const priceOf = product => {
    const pair = temperaturePair.get(product.en);
    return pair ? basePrice(productById.get(pair[0])) + (product.en === pair[1] ? 500 : 0) : basePrice(product);
  };
  window.CODEBEAN_PRICING = { productById, temperaturePair, priceOf };
  document.querySelectorAll('[data-product-price]').forEach(element => {
    const product = productById.get(element.dataset.productPrice);
    if (product) element.textContent = `${priceOf(product).toLocaleString('ko-KR')}원`;
  });
})();
