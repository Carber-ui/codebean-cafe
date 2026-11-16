// 메뉴 이미지의 position은 3열 × 2행 이미지에서 각 메뉴의 위치입니다.
const products = [
  {name:'아이스 아메리카노',en:'ICED AMERICANO',category:'커피',image:'menu-grid.png',position:'0% 0%',description:'진한 에스프레소와 시원한 얼음이 어우러진 깔끔한 커피.'},
  {name:'아이스 카페라떼',en:'ICED CAFE LATTE',category:'커피',image:'menu-grid.png',position:'50% 0%',description:'고소한 우유와 에스프레소가 부드럽게 어우러진 라떼.'},
  {name:'바닐라라떼',en:'VANILLA LATTE',category:'커피',image:'coffee-grid.png',position:'0% 0%',description:'바닐라의 달콤한 향과 부드러운 우유가 어우러진 커피.'},
  {name:'카라멜마끼아또',en:'CARAMEL MACCHIATO',category:'커피',image:'coffee-grid.png',position:'50% 0%',description:'달콤한 카라멜과 에스프레소를 함께 즐기는 라떼.'},
  {name:'카페모카',en:'CAFE MOCHA',category:'커피',image:'coffee-grid.png',position:'100% 0%',description:'커피의 진한 풍미에 초콜릿의 달콤함을 더한 음료.'},
  {name:'큐브라떼',en:'CUBE LATTE',category:'커피',image:'coffee-grid.png',position:'0% 100%',description:'커피 얼음이 우유에 천천히 녹아드는 시원한 라떼.'},
  {name:'콜드브루 라떼',en:'COLD BREW LATTE',category:'커피',image:'coffee-grid.png',position:'50% 100%',description:'콜드브루 커피와 우유가 어우러진 부드러운 한 잔.'},
  {name:'헤이즐넛라떼',en:'HAZELNUT LATTE',category:'커피',image:'coffee-grid.png',position:'100% 100%',description:'고소한 헤이즐넛 향을 더한 달콤한 커피.'},
  {name:'아인슈페너',en:'EINSPANNER',category:'커피',image:'fruit-grid.png',position:'50% 100%',description:'쌉싸름한 커피 위에 부드러운 크림을 올린 음료.'},
  {name:'딸기라떼',en:'STRAWBERRY LATTE',category:'라떼',image:'menu-grid.png',position:'100% 0%',description:'달콤한 딸기와 부드러운 우유로 완성한 한 잔.'},
  {name:'녹차라떼',en:'GREEN TEA LATTE',category:'라떼',image:'latte-tea-grid.png',position:'0% 0%',description:'향긋한 녹차와 우유가 만나 부드러운 라떼.'},
  {name:'초코라떼',en:'CHOCOLATE LATTE',category:'라떼',image:'latte-tea-grid.png',position:'50% 0%',description:'진한 초콜릿과 우유가 어우러진 달콤한 음료.'},
  {name:'고구마라떼',en:'SWEET POTATO LATTE',category:'라떼',image:'latte-tea-grid.png',position:'100% 0%',description:'고구마의 달콤하고 고소한 맛을 담은 라떼.'},
  {name:'레몬에이드',en:'LEMON ADE',category:'에이드',image:'menu-grid.png',position:'0% 100%',description:'상큼한 레몬과 톡 쏘는 탄산이 만난 청량한 음료.'},
  {name:'블루레몬에이드',en:'BLUE LEMON ADE',category:'에이드',image:'fruit-grid.png',position:'0% 0%',description:'레몬의 상큼함을 시원하게 즐기는 푸른빛 에이드.'},
  {name:'자몽에이드',en:'GRAPEFRUIT ADE',category:'에이드',image:'fruit-grid.png',position:'50% 0%',description:'달콤쌉싸름한 자몽과 탄산이 만난 에이드.'},
  {name:'청포도에이드',en:'GREEN GRAPE ADE',category:'에이드',image:'fruit-grid.png',position:'100% 0%',description:'달콤한 청포도와 톡 쏘는 탄산이 어우러진 음료.'},
  {name:'로얄밀크티',en:'ROYAL MILK TEA',category:'티',image:'latte-tea-grid.png',position:'0% 100%',description:'홍차의 향과 우유의 부드러움을 담은 밀크티.'},
  {name:'복숭아 아이스티',en:'PEACH ICED TEA',category:'티',image:'latte-tea-grid.png',position:'50% 100%',description:'달콤한 복숭아 향으로 시원하게 즐기는 아이스티.'},
  {name:'허니자몽블랙티',en:'HONEY GRAPEFRUIT BLACK TEA',category:'티',image:'latte-tea-grid.png',position:'100% 100%',description:'자몽의 상큼함과 홍차의 깊은 향을 담은 과일티.'},
  {name:'유자차',en:'CITRON TEA',category:'티',image:'fruit-grid.png',position:'100% 100%',description:'달콤하고 향긋한 유자를 시원하게 즐기는 과일차.'},
  {name:'딸기요거트스무디',en:'STRAWBERRY YOGURT SMOOTHIE',category:'스무디·프라페',image:'smoothie-grid.png',position:'0% 0%',description:'상큼한 딸기와 요거트를 시원하게 갈아낸 스무디.'},
  {name:'블루베리요거트스무디',en:'BLUEBERRY YOGURT SMOOTHIE',category:'스무디·프라페',image:'smoothie-grid.png',position:'50% 0%',description:'새콤달콤한 블루베리와 요거트를 함께 즐기는 음료.'},
  {name:'골드망고스무디',en:'GOLD MANGO SMOOTHIE',category:'스무디·프라페',image:'smoothie-grid.png',position:'100% 0%',description:'달콤한 망고의 풍미를 담은 부드러운 스무디.'},
  {name:'쿠키프라페',en:'COOKIE FRAPPE',category:'스무디·프라페',image:'smoothie-grid.png',position:'0% 100%',description:'바삭한 쿠키와 부드러운 크림이 어우러진 프라페.'},
  {name:'코코넛 커피 스무디',en:'COCONUT COFFEE SMOOTHIE',category:'스무디·프라페',image:'smoothie-grid.png',position:'50% 100%',description:'고소한 코코넛과 커피를 시원하게 즐기는 스무디.'},
  {name:'녹차프라페',en:'GREEN TEA FRAPPE',category:'스무디·프라페',image:'smoothie-grid.png',position:'100% 100%',description:'쌉싸름한 녹차와 부드러운 크림을 더한 프라페.'},
  {name:'딸기바나나주스',en:'STRAWBERRY BANANA JUICE',category:'주스',image:'fruit-grid.png',position:'0% 100%',description:'딸기의 상큼함과 바나나의 달콤함을 담은 주스.'},
  {name:'버터 크루아상',en:'BUTTER CROISSANT',category:'디저트',image:'menu-grid.png',position:'50% 100%',description:'겹겹이 바삭하고 고소한 버터의 풍미가 가득한 크루아상.'},
  {name:'소금빵',en:'SALT BREAD',category:'디저트',image:'menu-grid.png',position:'100% 100%',description:'담백한 빵에 소금의 짭조름함을 더한 베이커리.'}
];
// 추가 메뉴도 같은 3열 × 2행 이미지에서 위치를 지정합니다.
products.push(
  {name:'아메리카노',en:'HOT AMERICANO',category:'커피',temperature:'따뜻한',image:'hot-coffee-grid.png',position:'0% 0%',description:'진한 에스프레소에 따뜻한 물을 더한 깔끔한 커피.'},
  {name:'카페라떼',en:'HOT CAFE LATTE',category:'커피',temperature:'따뜻한',image:'hot-coffee-grid.png',position:'50% 0%',description:'에스프레소와 따뜻한 우유가 어우러진 부드러운 라떼.'},
  {name:'바닐라라떼',en:'HOT VANILLA LATTE',category:'커피',temperature:'따뜻한',image:'hot-coffee-grid.png',position:'100% 0%',description:'바닐라 향을 더해 따뜻하고 달콤하게 즐기는 라떼.'},
  {name:'카라멜마끼아또',en:'HOT CARAMEL MACCHIATO',category:'커피',temperature:'따뜻한',image:'hot-coffee-grid.png',position:'0% 100%',description:'에스프레소와 우유 위에 카라멜의 달콤함을 더한 커피.'},
  {name:'카페모카',en:'HOT CAFE MOCHA',category:'커피',temperature:'따뜻한',image:'hot-coffee-grid.png',position:'50% 100%',description:'커피와 초콜릿의 진한 풍미를 따뜻하게 즐기는 음료.'},
  {name:'연유라떼',en:'HOT CONDENSED MILK LATTE',category:'커피',temperature:'따뜻한',image:'hot-coffee-grid.png',position:'100% 100%',description:'부드러운 우유와 달콤한 연유를 더한 따뜻한 커피.'},
  {name:'핫초코',en:'HOT CHOCOLATE',category:'라떼',temperature:'따뜻한',image:'hot-drinks-grid.png',position:'0% 0%',description:'진한 초콜릿과 우유를 따뜻하게 즐기는 음료.'},
  {name:'녹차라떼',en:'HOT GREEN TEA LATTE',category:'라떼',temperature:'따뜻한',image:'hot-drinks-grid.png',position:'50% 0%',description:'향긋한 녹차와 따뜻한 우유가 어우러진 라떼.'},
  {name:'토피넛라떼',en:'HOT TOFFEE NUT LATTE',category:'라떼',temperature:'따뜻한',image:'hot-drinks-grid.png',position:'100% 0%',description:'고소한 견과와 달콤한 토피 향을 담은 따뜻한 라떼.'},
  {name:'로얄밀크티',en:'HOT ROYAL MILK TEA',category:'티',temperature:'따뜻한',image:'hot-drinks-grid.png',position:'0% 100%',description:'은은한 홍차와 따뜻한 우유가 어우러진 밀크티.'},
  {name:'유자차',en:'HOT CITRON TEA',category:'티',temperature:'따뜻한',image:'hot-drinks-grid.png',position:'50% 100%',description:'상큼하고 달콤한 유자를 따뜻하게 즐기는 과일차.'},
  {name:'캐모마일',en:'HOT CHAMOMILE TEA',category:'티',temperature:'따뜻한',image:'hot-drinks-grid.png',position:'100% 100%',description:'은은한 꽃향을 따뜻하게 즐기는 허브티.'},
  {name:'트리플 시트러스 에이드',en:'CITRUS ADE',category:'에이드',image:'fruit-extra-grid.png',position:'0% 0%',description:'레몬, 라임, 자몽을 함께 즐기는 상큼한 탄산 음료.'},
  {name:'체리콜라',en:'CHERRY COLA',category:'에이드',image:'fruit-extra-grid.png',position:'50% 0%',description:'새콤달콤한 체리와 시원한 탄산이 어우러진 음료.'},
  {name:'망고주스',en:'MANGO JUICE',category:'주스',image:'fruit-extra-grid.png',position:'100% 0%',description:'진한 망고의 달콤함을 담은 과일 음료.'},
  {name:'키위주스',en:'KIWI JUICE',category:'주스',image:'fruit-extra-grid.png',position:'0% 100%',description:'키위의 새콤달콤한 풍미를 담은 주스.'},
  {name:'딸기주스',en:'STRAWBERRY JUICE',category:'주스',image:'fruit-extra-grid.png',position:'50% 100%',description:'상큼한 딸기를 시원하게 즐기는 과일 주스.'},
  {name:'블루베리플럼주스',en:'BLUEBERRY PLUM JUICE',category:'주스',image:'fruit-extra-grid.png',position:'100% 100%',description:'블루베리와 플럼의 새콤달콤한 맛을 담은 주스.'},
  {name:'타로라떼',en:'ICED TARO LATTE',category:'라떼',image:'iced-extra-grid.png',position:'0% 0%',description:'고소하고 달콤한 타로를 우유와 함께 즐기는 라떼.'},
  {name:'토피넛라떼',en:'ICED TOFFEE NUT LATTE',category:'라떼',image:'iced-extra-grid.png',position:'50% 0%',description:'고소한 견과와 달콤한 토피 향을 담은 차가운 라떼.'},
  {name:'흑당버블밀크티',en:'BROWN SUGAR BUBBLE MILK TEA',category:'티',image:'iced-extra-grid.png',position:'100% 0%',description:'달콤한 흑당과 쫄깃한 펄을 더한 밀크티.'},
  {name:'사과유자차',en:'ICED APPLE CITRON TEA',category:'티',image:'iced-extra-grid.png',position:'0% 100%',description:'사과와 유자의 달콤하고 상큼한 맛을 담은 과일차.'},
  {name:'캐모마일',en:'ICED CHAMOMILE TEA',category:'티',image:'iced-extra-grid.png',position:'50% 100%',description:'은은한 꽃향을 시원하게 즐기는 허브티.'},
  {name:'페퍼민트',en:'ICED PEPPERMINT TEA',category:'티',image:'iced-extra-grid.png',position:'100% 100%',description:'상쾌한 민트 향을 시원하게 즐기는 허브티.'},
  {name:'플레인 크로플',en:'PLAIN CROFFLE',category:'디저트',image:'bakery-grid.png',position:'0% 0%',description:'바삭한 크루아상 반죽으로 구운 고소한 크로플.'},
  {name:'치즈 케이크',en:'CHEESE CAKE',category:'디저트',image:'bakery-grid.png',position:'50% 0%',description:'진하고 부드러운 치즈의 풍미를 담은 케이크.'},
  {name:'초코무스 케이크',en:'CHOCOLATE MOUSSE CAKE',category:'디저트',image:'bakery-grid.png',position:'100% 0%',description:'진한 초콜릿을 부드럽게 즐기는 무스 케이크.'},
  {name:'티라미수 케이크',en:'TIRAMISU CAKE',category:'디저트',image:'bakery-grid.png',position:'0% 100%',description:'부드러운 크림과 코코아가 어우러진 티라미수.'},
  {name:'감자빵',en:'POTATO BREAD',category:'디저트',image:'bakery-grid.png',position:'50% 100%',description:'쫀득한 빵 안에 고소한 감자의 풍미를 담은 베이커리.'},
  {name:'크로크무슈',en:'CROQUE MONSIEUR',category:'디저트',image:'bakery-grid.png',position:'100% 100%',description:'햄과 치즈를 넣어 든든하게 즐기는 구운 샌드위치.'},
  {name:'딸기요거트 마카롱',en:'STRAWBERRY YOGURT MACARON',category:'디저트',image:'dessert-grid.png',position:'0% 0%',description:'딸기와 요거트의 상큼한 맛을 담은 마카롱.'},
  {name:'초콜릿칩 쿠키',en:'CHOCOLATE CHIP COOKIE',category:'디저트',image:'dessert-grid.png',position:'50% 0%',description:'초콜릿칩이 콕콕 박힌 달콤한 쿠키.'},
  {name:'마카다미아 쿠키',en:'MACADAMIA COOKIE',category:'디저트',image:'dessert-grid.png',position:'100% 0%',description:'고소한 마카다미아를 넣어 구운 쿠키.'},
  {name:'허니브레드',en:'HONEY BREAD',category:'디저트',image:'dessert-grid.png',position:'0% 100%',description:'두툼한 빵에 달콤한 크림과 꿀을 더한 디저트.'},
  {name:'초코 마카롱',en:'CHOCOLATE MACARON',category:'디저트',image:'dessert-grid.png',position:'50% 100%',description:'진한 초콜릿 맛을 담은 부드러운 마카롱.'},
  {name:'초코젤라또 크로플',en:'CHOCOLATE GELATO CROFFLE',category:'디저트',image:'dessert-grid.png',position:'100% 100%',description:'바삭한 크로플에 초콜릿 젤라또를 곁들인 디저트.'}
);

// 한글 초성은 음절의 유니코드 위치를 이용해 비교합니다.
const initials = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function matchesSearch(text, query) {
  const compact = value => Array.from(value.normalize('NFC').toLocaleLowerCase().replace(/\s+/g, ''));
  const characters = compact(text);
  const wanted = compact(query);
  if (wanted.length === 0) return true;
  for (let start = 0; start <= characters.length - wanted.length; start++) {
    const matched = wanted.every((letter, offset) => {
      const candidate = characters[start + offset];
      const code = candidate.charCodeAt(0) - 0xAC00;
      const initial = code >= 0 && code < 11172 ? initials[Math.floor(code / 588)] : candidate;
      return letter === candidate || (initials.includes(letter) && letter === initial);
    });
    if (matched) return true;
  }
  return false;
}

