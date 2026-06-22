// 사이트 전역 설정 및 비즈니스 정보 (E-E-A-T 신뢰 신호 포함)
export const site = {
  name: "안마 KING",
  legalName: "안마 KING 출장마사지 안내",
  tagline: "전국 출장마사지·홈타이 정보 안내 플랫폼",
  // 검색 색인용 기본 도메인 (배포 시 환경변수 SITE_URL 로 교체 가능)
  baseUrl: process.env.SITE_URL || "https://anmaking.com",
  phone: "0508-202-4719",
  phoneHref: "tel:0508-202-4719",
  email: "help@anmaking.com",
  locale: "ko_KR",
  // E-E-A-T: 책임 저자/검수자 정보
  author: {
    name: "안마 KING 편집팀",
    role: "출장마사지 정보 에디터",
    reviewer: "이용 안내 검수 담당",
    bio: "안마 KING 편집팀은 전국 출장마사지·홈타이 이용 기준을 직접 확인·정리하고, 이용자 문의를 바탕으로 안내 내용을 업데이트합니다.",
  },
  // 편집/운영 정책 공개 (구글 뉴스/E-E-A-T 신호)
  editorialPolicy:
    "안마 KING은 과장된 광고 문구 대신 이용자가 예약 전 반드시 확인해야 할 실제 기준을 안내합니다. 모든 가격·운영 정보는 변동될 수 있으므로 예약 전 업체에 직접 확인하도록 권장합니다.",
  social: {},
  // 비즈니스 문의(웹사이트 제작·제휴) 텔레그램
  telegram: "https://t.me/googleseolab",
  // 상담/영업 시간 — ⚠️ 실제 운영 시간으로 수정하세요 (구조화 데이터·푸터에 함께 사용)
  hours: {
    text: "연중무휴 · 24시간 전화 상담",
    opens: "00:00",
    closes: "23:59",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  // 결제 수단 — 실제 가능한 수단으로 수정하세요
  payments: ["현금", "계좌이체", "신용카드"],
  // 검색엔진 사이트 소유확인 메타 (없으면 비워 둠 → 메타 미출력)
  verification: {
    naver: "009881bd5e9da3019c7417a4dab188a0c89b196a",
    google: "", // 구글 서치콘솔 'HTML 태그' content 값을 넣으면 자동 노출
  },
  // IndexNow 키 (빙·네이버·얀덱스 즉시 색인 통보). dist/<키>.txt 로 게시됨.
  indexNowKey: "a8fca1ff1ef9e89a09341162c81b55a2",
};

// 상단 메뉴 (홈타이 단독 메뉴 없음)
export const primaryNav = [
  { label: "홈", url: "/" },
  { label: "출장마사지", url: "/outcall/" },
  { label: "지역별 찾기", url: "/region/", mega: "region" },
  { label: "지하철역별 찾기", url: "/subway/" },
  { label: "마사지 프로그램", url: "/program/", mega: "program" },
  { label: "예약 가이드", url: "/guide/" },
  { label: "이용 안내", url: "/about/" },
  { label: "문의하기", url: "/contact/" },
];

// 마사지 프로그램 메가메뉴 (PC 4열 / 모바일 아코디언)
export const programMenu = [
  {
    group: "관리 프로그램",
    items: [
      { label: "스웨디시", slug: "swedish" },
      { label: "타이마사지", slug: "thai-massage" },
      { label: "아로마테라피", slug: "aroma-therapy" },
      { label: "로미로미", slug: "lomi-lomi" },
      { label: "중국마사지", slug: "chinese-massage" },
      { label: "발마사지", slug: "foot-massage" },
      { label: "스포츠&경락", slug: "sports-kyunglak" },
      { label: "스킨케어", slug: "skin-care" },
      { label: "왁싱", slug: "waxing" },
    ],
  },
  {
    group: "방문·이용 방식",
    items: [
      { label: "홈타이", slug: "home-care" },
      { label: "스파/사우나", slug: "spa-sauna" },
      { label: "호텔식마사지", slug: "hotel-style-massage" },
      { label: "수면가능", slug: "rest-available" },
      { label: "24시간", slug: "24-hour" },
      { label: "1인샵/2인샵", slug: "private-shop" },
    ],
  },
  {
    group: "대상·관리사 기준",
    items: [
      { label: "남성전용", slug: "men-only" },
      { label: "여성전용", slug: "women-only" },
      { label: "남자관리사", slug: "male-therapist" },
      { label: "커플환영", slug: "couple-friendly" },
    ],
  },
  {
    group: "추천·혜택",
    items: [
      { label: "신규업소", slug: "new-shops" },
      { label: "할인업소", slug: "discount-shops" },
      { label: "두리코스", slug: "duri-course" },
    ],
  },
];

// 프로그램 slug -> label 빠른 조회
export const programLabelBySlug = Object.fromEntries(
  programMenu.flatMap((g) => g.items.map((i) => [i.slug, i.label]))
);
