// 서울 계층(광역 → 자치구 → 행정동) 페이지 생성기
// - 각 페이지 2000~2500자 목표
// - 구별 실제 정보(역·랜드마크·특징) + 동별 인접 동 목록을 주입해 고유성 확보
import { layout, esc, faqLd, articleLd, pricingTable, pricingLd, reviewsSection } from "../src/templates/layout.mjs";
import { site } from "../data/site.mjs";
import { programBySlug } from "../data/programs.mjs";
import { seoul } from "../data/seoul.mjs";
import { slugify } from "./romanize.mjs";
import { dongMeta, branchMeta } from "./region-tree.mjs";
import { vpick, vsubset, vshuffle } from "./variants.mjs";

const MODIFIED = "2026-06-21";
const PROGRAM_PICKS = ["swedish", "aroma-therapy", "thai-massage", "home-care", "foot-massage"];

// 문자열 → 안정적 정수 시드
function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const pick = (s, arr) => arr[s % arr.length];

function authorBox() {
  return `
  <aside class="author-box">
    <div class="avatar">AK</div>
    <div class="meta">
      <strong>${esc(site.author.name)}</strong> · ${esc(site.author.role)}
      <p>${esc(site.author.bio)}</p>
      <p class="updated">최종 수정일 ${MODIFIED} · 검수: ${esc(site.author.reviewer)}</p>
    </div>
  </aside>`;
}

// 롱테일 앵커 변형 (지역+프로그램 문맥, 페이지마다 다르게)
const CHIP_FORMS = [
  (pre, lb) => `${pre}${lb} 출장마사지`,
  (pre, lb) => `${pre}${lb} 홈타이 안내`,
  (pre, lb) => `${pre}방문 ${lb} 코스`,
  (pre, lb) => `${pre}${lb} 케어 받기`,
];

function programChips(place) {
  const pre = place ? `${place} ` : "";
  return `<div class="link-cloud">${PROGRAM_PICKS.map((slug) => {
    const lb = programBySlug[slug].label;
    const form = vpick(place || "전국", "chip-" + slug, CHIP_FORMS);
    return `<a href="/program/${slug}/">${esc(form(pre, lb))}</a>`;
  }).join("")}</div>`;
}

const phone = site.phone;
const ctaBtn = (label) =>
  `<p><a class="btn btn-primary" href="${site.phoneHref}">📞 ${esc(label)} 전화예약 ${esc(phone)}</a></p>`;

function callout() {
  return `<div class="callout">적혀 있는 내용과 가격은 바뀔 수 있으므로, <strong>실제 방문 여부와 비용은 예약 전에 ${esc(
    phone
  )}로 직접 확인</strong>하는 편이 정확합니다.</div>`;
}

// ---------- 동 페이지 ----------
function dongPage(gu, dongName, siblings) {
  const s = seed(gu.name + dongName);
  const guSlug = gu.slug;
  const dongSlug = gu.dongSlug[dongName];
  const path = `/region/seoul/${guSlug}/${dongSlug}/`;
  const stationText = gu.stations.slice(0, 3).join("·");
  const landmarkText = gu.landmarks.slice(0, 3).join("·");
  const near = siblings.filter((d) => d !== dongName).slice(0, 5);
  const nearText = near.length ? near.join("·") : gu.name + " 일대";

  const vb = "SDG␟서울␟" + gu.name + "␟" + dongName;
  const openA = vpick(vb, "openA", [
    `${dongName}은(는) 행정 구역상 서울 ${gu.name}에 자리한 동네로, ${gu.character}`,
    `서울 ${gu.name}의 ${dongName} 주변은 ${gu.character}`,
    `${gu.name} 소속인 ${dongName}은(는) ${gu.character}`,
    `${dongName}은(는) 서울 ${gu.name} 안에서도 생활 동선이 뚜렷하게 묶이는 곳으로, ${gu.character}`,
    `이웃한 동들과 자연스럽게 권역이 맞물리는 서울 ${gu.name} ${dongName}은(는) ${gu.character}`,
  ]);
  const demand = vpick(vb, "demand", [
    `${dongName} 일대에서 출장마사지나 홈타이를 알아본다면, 먼저 동네의 위치와 방문이 닿는 권역을 짚어 두는 편이 수월합니다.`,
    `${dongName}에서 출장마사지·홈타이를 받아 보려는 분들은 방문이 가능한 범위와 도착까지 걸리는 시간을 미리 살펴보는 일이 많습니다.`,
    `${dongName} 주변에서 방문 관리를 알아볼 때는, 같은 ${gu.name} 안이라도 어느 권역이냐에 따라 도착 시간이 제법 달라질 수 있다는 점을 기억해 두면 좋습니다.`,
    `${nearText} 등과 경계를 맞댄 ${dongName}은(는) 어디서 출발하느냐에 따라 도착 시간이 달라지므로, 위치를 분명히 전하면 그만큼 안내가 빨라집니다.`,
  ]);
  const tip = vpick(vb, "tip", [
    `${dongName}처럼 생활권이 잘 갖춰진 동네는 선호하는 시간대로 예약이 몰리기 쉬우므로, 원하는 시간을 정해 두고 먼저 문의하면 안내가 한결 빠릅니다.`,
    `${dongName}이 처음이라면 자극이 순한 스웨디시나 다리 위주의 발마사지처럼 가벼운 프로그램부터 견주어 보는 것도 좋은 방법입니다.`,
    `${dongName} 주변은 ${stationText} 등을 따라 이동이 이어지는 편이어서, 방문에 걸리는 시간은 출발 지점에 따라 차이가 납니다.`,
  ]);
  const comparePara = vpick(vb, "compare", [
    `포근한 오일 관리가 끌린다면 스웨디시나 아로마테라피를, 시원하게 늘려 주는 느낌을 원한다면 타이마사지를 견주어 보세요. 집이나 숙소에서 편히 받고 싶을 땐 홈타이, 다리만 가볍게 풀고 싶을 땐 발마사지 같은 부분 관리도 고를 수 있습니다.`,
    `${dongName} 주변이라면 오일을 쓰는 스웨디시·아로마, 근육을 펴 주는 타이마사지, 찾아오는 홈타이, 부위만 다루는 발마사지를 목적에 맞춰 정하면 됩니다. 어디가 뭉쳤는지와 강도를 먼저 떠올리면 선택이 한결 수월합니다.`,
    `처음이라면 부담이 덜한 스웨디시나 발마사지로 시작하고, 뭉침이 심하다면 타이마사지나 경락 쪽을 살펴보세요. 굳이 나가지 않고 받고 싶다면 ${dongName} 주변 방문이 가능한 홈타이를 확인하면 됩니다.`,
  ]);
  const flowPara = vpick(vb, "flow", [
    `예약할 때 ${dongName} 위치와 받고 싶은 프로그램·시간을 알려 주면, 방문이 되는지와 도착 예정 시간을 안내받게 됩니다. 찾아오는 방식(홈타이)은 관리할 자리와 수건 정도만 준비하면 익숙한 공간에서 받을 수 있고, 끝난 뒤 따로 움직이지 않고 그대로 쉴 수 있다는 점이 좋습니다. 늦은 시간을 원한다면 심야 방문 여부와 추가 요금을 먼저 짚어 두세요.`,
    `${dongName}에서의 진행은 위치 전달 → 프로그램·시간 고르기 → 방문 가능 여부와 비용 확인 → 전화예약 순으로 가면 매끄럽습니다. 홈타이는 오가는 수고가 적은 대신 관리 자리·수건 같은 준비물을 미리 챙겨 두면 좋고, 심야에는 추가 요금도 함께 확인해 두세요.`,
    `우선 ${dongName} 위치와 시간대를 정해 문의하면 도착 예정 시간을 안내받을 수 있습니다. 방문(홈타이)은 관리사가 내 공간으로 찾아오는 방식이라 움직일 일이 없는 대신, 준비물과 출입 방법을 예약 단계에서 맞춰 두면 진행이 한결 부드럽습니다.`,
  ]);

  const faqs = [
    {
      q: `${dongName} 출장마사지, 예약은 어떤 순서로 하면 되나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${dongName}(서울 ${gu.name}) 위치와 받고 싶은 프로그램, 시간을 전하면 방문이 되는지와 도착까지 걸리는 시간을 안내받을 수 있습니다. 비용과 어디까지 포함되는지도 같이 물어보세요.`,
        `서울 ${gu.name} ${dongName}이라고 위치를 밝히고 프로그램·시간을 알려 주면 도착 예정 시간과 비용을 안내받습니다. 추가 요금이 포함되는지도 미리 확인해 두세요.`,
      ]),
    },
    {
      q: `${dongName} 쪽도 홈타이로 받아 볼 수 있을까요?`,
      a: vpick(vb, "fa2", [
        `홈타이는 집이나 숙소로 받는 방문형 출장마사지를 가리키며, ${dongName}이 방문이 닿는 권역인지 예약할 때 확인하면 됩니다. 스웨디시·아로마·타이마사지 등에서 골라 받을 수 있습니다.`,
        `이용할 수 있습니다. 홈타이는 ${dongName} 주변 집·숙소로 찾아오는 방문 관리이며, 권역에 드는지 예약 시 짚어 보고 원하는 프로그램·시간을 함께 정하면 됩니다.`,
      ]),
    },
    {
      q: `${dongName}까지 도착하는 데 시간이 얼마나 드나요?`,
      a: vpick(vb, "fa3", [
        `출발 지점과 시간대, ${gu.name} 안에서 어느 권역이냐에 따라 달라집니다. 실제로 걸리는 시간은 예약하면서 확인하는 편이 정확합니다.`,
        `${dongName}은(는) 어디서 출발하느냐와 교통 상황에 따라 도착 시간이 갈립니다. 예약 시 위치를 알려 주면 예상 소요 시간을 안내받을 수 있습니다.`,
      ]),
    },
  ];

  const secOverview = `
    <h2>${esc(dongName)} 동네 한눈에 보기</h2>
    <p>${esc(openA)} 가까이에는 ${esc(stationText)} 등이 자리해 오가기가 수월하며, ${esc(
    landmarkText
  )} 같은 곳이 생활권을 가늠하는 기준점 노릇을 합니다.</p>
    <p>${esc(demand)} 같은 ${esc(gu.name)} 안에서도 ${esc(
    nearText
  )} 등 이웃 동과 권역이 서로 닿아 있어, 방문 위치를 또렷이 일러 주면 안내가 한결 매끄럽습니다.</p>`;
  const secWho = `
    <h2>${esc(dongName)}에서 방문 케어를 찾게 되는 순간</h2>
    <ul>${vsubset(vb, "who", [
      `${gu.name} 안에서 굳이 나가지 않고 집·숙소에서 느긋하게 받고 싶을 때`,
      `퇴근 뒤나 늦은 밤 ${dongName} 주변에서 받아 보고 싶을 때`,
      `${stationText} 등으로 이동이 잦아 어깨·허리에 피로가 쌓였을 때`,
      `처음이라 순한 스웨디시나 발마사지처럼 가벼운 프로그램부터 견주고 싶을 때`,
      `${nearText.split("·")[0]} 등 이웃 동까지 권역에 두고 ${dongName}을(를) 함께 살펴보고 싶을 때`,
      `다른 지역에서 ${gu.name}을(를) 찾아와 숙소에서 방문 관리를 받고 싶을 때`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCheck = `
    <h2>${esc(dongName)}에서 받기 전에 짚어 둘 점</h2>
    <p>${esc(tip)} 적혀 있는 운영 시간이나 가격은 바뀔 수 있으므로, 방문이 되는지·전체 비용·추가 요금은 예약 단계에서 직접 확인해 두는 편이 안전합니다.</p>
    <ul>${vsubset(vb, "check", [
      `${dongName} 방문이 닿는 권역과 도착까지 걸리는 시간`,
      `받고 싶은 프로그램(스웨디시·아로마·타이마사지 등)과 관리 시간`,
      `적힌 가격에 방문비·심야 요금이 들어 있는지`,
      `관리사 성별 지정 같은 추가 요청이 되는지`,
      `관리할 자리·수건 등 준비물`,
      `${gu.name} 안 이동 동선에 따른 방문 시간대`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    ${callout()}`;
  const secCompare = `
    <h2>${esc(dongName)}에서 견줘 볼 케어 방식</h2>
    <p>${esc(comparePara)}</p>
    ${programChips(dongName)}`;
  const secFlow = `
    <h2>${esc(dongName)} 출장마사지·홈타이 진행 순서</h2>
    <p>${esc(flowPara)}</p>
    <p>${esc(vpick(vb, "flow2", [
      `${dongName}처럼 생활권이 잘 묶인 동네에서는 매장 이용과 방문(홈타이)을 나란히 견주는 일이 잦습니다. 매장 이용이 시설과 부대 서비스를 함께 쓰는 방식이라면, 홈타이는 관리사가 내 공간까지 찾아오는 방식이라는 점이 가장 큰 차이입니다.`,
      `${dongName}에서는 시설을 같이 쓰는 매장 이용과, 집·숙소로 받는 홈타이 가운데 목적에 맞춰 고르면 됩니다. 홈타이는 오갈 일도 기다릴 일도 없는 대신 준비물을 직접 갖춰야 한다는 점이 다릅니다.`,
      `${gu.name} ${dongName} 일대에서는 매장 이용과 홈타이를 함께 저울질하는 경우가 많은데, 갈림길은 결국 ‘내가 가느냐, 관리사가 오느냐’입니다.`,
    ]))} 어느 쪽이 맞을지는 이용 목적과 시간에 따라 달라지므로, 예약하면서 준비물·주차·출입 방법과 전체 비용을 함께 확인하면 진행이 매끄럽습니다.</p>`;

  const secTips = `
    <h2>${esc(dongName)} 코스·시간대 고르기</h2>
    <p>${esc(vpick(vb, "tipA", [
      `${dongName} 주변이 처음이라면 60분 코스로 컨디션을 본 뒤 뭉침이 심할 때 90·120분으로 늘리는 방식이 부담이 적습니다. 코스가 길수록 온몸을 천천히 풀 수 있어 피로가 오래 쌓인 경우에 잘 맞습니다.`,
      `${dongName}에서는 가볍게 풀고 싶으면 60분, 전신을 고루 받고 싶으면 90분, 집중적으로 다루고 싶으면 120분이 기준이 됩니다. 원하는 부위와 시간 여유에 맞추면 고르기가 쉬워집니다.`,
      `${gu.name} 일대에서 코스를 정할 땐 ‘오늘 어느 정도 풀고 싶은지’를 먼저 가늠하면 됩니다. 짧게 60분, 표준 90분, 집중 120분으로 나눠 두고 ${dongName} 방문 시간대와 함께 잡으면 편합니다.`,
      `${dongName} 주변 이용이 처음이라면 무리한 강도 대신 60·90분 코스로 시작해 몸 상태를 보며 조절하는 편이 낫습니다. 강도와 시간은 시작 전에 미리 일러 두면 그에 맞춰 받기가 수월합니다.`,
    ]))}</p>
    <p>${esc(vpick(vb, "tipB", [
      `${dongName}에서 홈타이로 받을 땐 받을 자리를 미리 비워 두고 큰 수건을 챙겨 두면 진행이 매끄럽습니다. 심야 시간대는 방문 여부와 추가 요금이 달라질 수 있으니 예약하면서 함께 확인하세요.`,
      `방문(홈타이)으로 ${dongName}에서 받는다면 매트를 펼 자리와 수건 정도만 갖추면 됩니다. 늦은 시간대는 도착이 늦어질 수 있어, 원하는 시간을 미리 일러 두는 편이 좋습니다.`,
      `${dongName} 주변에서 늦은 시간 이용을 생각한다면 심야 방문 여부와 추가 요금, 도착에 걸리는 시간을 예약 단계에서 짚어 두면 당일 진행이 한결 수월합니다.`,
      `${dongName}에서 홈타이가 처음이라면 출입 방법과 주차, 준비물(수건·관리 자리)을 예약 시 미리 맞춰 두면 관리사가 도착하자마자 시작할 수 있어 시간을 아낄 수 있습니다.`,
    ]))}</p>`;

  const middle = vshuffle(vb, "order", [secWho, secCheck, secCompare, secFlow, secTips]).join("\n");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/region/">지역별 찾기</a><span>›</span><a href="/region/seoul/">서울</a><span>›</span><a href="/region/seoul/${guSlug}/">${esc(
    gu.name
  )}</a><span>›</span>${esc(dongName)}
  </nav>
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">서울 ${esc(
      gu.name
    )}</p>
    <h1>${esc(dongName)} 출장마사지·홈타이 이용 안내</h1>
    ${secOverview}
    ${middle}

    <h2>${esc(dongName)} 이웃 동 둘러보기</h2>
    <p>같은 ${esc(gu.name)} 안의 ${esc(
    nearText
  )} 등 이웃 동까지 묶어 살펴보면 방문 권역을 가늠하기가 한결 쉽습니다.</p>
    <div class="link-cloud">
      ${near
        .map(
          (d) =>
            `<a href="/region/seoul/${guSlug}/${gu.dongSlug[d]}/">${esc(d)}</a>`
        )
        .join("")}
      <a href="/region/seoul/${guSlug}/">${esc(gu.name)} 전체</a>
      <a href="/region/seoul/">서울 전체</a>
    </div>

    <h2>예약 전 자주 받는 질문</h2>
    <div class="faq">
      ${faqs
        .map(
          (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
        )
        .join("\n      ")}
    </div>

    ${authorBox()}
    ${ctaBtn(dongName + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  const html = layout({
    ...dongMeta(dongName, "서울", gu.name),
    path,
    body,
    structuredData: [
      faqLd(faqs),
      articleLd({
        headline: `${dongName} 출장마사지·홈타이 이용 안내`,
        description: `${dongName}(서울 ${gu.name}) 출장마사지·홈타이 이용 안내`,
        path,
        modified: MODIFIED,
      }),
      pricingLd(),
    ],
    breadcrumb: [
      { name: "홈", url: "/" },
      { name: "지역별 찾기", url: "/region/" },
      { name: "서울", url: "/region/seoul/" },
      { name: gu.name, url: `/region/seoul/${guSlug}/` },
      { name: dongName, url: path },
    ],
  });
  return { path, file: `region/seoul/${guSlug}/${dongSlug}/index.html`, html };
}

// ---------- 자치구 페이지 ----------
function guPage(gu) {
  const guSlug = gu.slug;
  const path = `/region/seoul/${guSlug}/`;
  const stationText = gu.stations.join("·");
  const landmarkText = gu.landmarks.join("·");

  const dongLinks = gu.dongs
    .map(
      (d) =>
        `<a href="/region/seoul/${guSlug}/${gu.dongSlug[d]}/">${esc(d)}</a>`
    )
    .join("");

  const nm = gu.name;
  const dong1 = gu.dongs[0] || "행정동";
  const vb = "SGU␟서울␟" + nm;

  const faqs = [
    {
      q: `서울 ${nm} 출장마사지, 예약은 무엇부터 시작하나요?`,
      a: vpick(vb, "fa1", [
        `${nm} 안의 동네(행정동)와 받고 싶은 프로그램·시간을 전화로 전하면 방문이 되는지와 걸리는 시간을 안내받을 수 있습니다.`,
        `서울 ${nm}에서는 원하는 행정동과 프로그램·시간을 전화로 알려 주면 방문 가능 여부와 도착 예정 시간을 안내받을 수 있습니다.`,
      ]),
    },
    {
      q: `${nm}에서는 어떤 프로그램을 골라 받을 수 있나요?`,
      a: vpick(vb, "fa2", [
        `스웨디시·아로마테라피·타이마사지 등 여러 프로그램과, 집·숙소로 받는 홈타이를 나란히 견주어 볼 수 있습니다.`,
        `오일 관리(스웨디시·아로마), 타이마사지, 찾아오는 홈타이, 부위만 다루는 발마사지 등을 ${nm}을(를) 기준으로 비교할 수 있습니다.`,
      ]),
    },
    {
      q: `${nm}은 어느 행정동까지 방문이 닿나요?`,
      a: vpick(vb, "fa3", [
        `${nm} 안에서도 행정동마다 방문이 닿는 권역이 다를 수 있습니다. 아래 동 목록에서 해당 동을 짚고 예약 시 위치를 알려 주면 됩니다.`,
        `${dong1} 등 ${nm} 안 행정동에 따라 권역이 갈립니다. 원하는 동을 고른 뒤 예약 시 위치를 알리면 방문이 되는지 확인할 수 있습니다.`,
      ]),
    },
  ];

  const secFeature = `
    <h2>${esc(nm)}은 어떤 곳일까</h2>
    <p>${esc(nm)}은(는) ${esc(gu.character)} ${esc(stationText)} 등을 따라 오가기가 이어지고, ${esc(landmarkText)} 같은 곳이 생활권을 가늠하는 기준점이 됩니다.</p>
    <p>${esc(vpick(vb, "feat", [
      `같은 ‘서울 ${nm} 출장마사지’라도 어느 행정동이냐에 따라 방문 권역과 도착 시간이 달라질 수 있어, 원하는 동네를 먼저 정해 두면 방문 여부와 프로그램을 한층 정확히 확인할 수 있습니다.`,
      `${nm}은(는) ${dong1} 등 여러 행정동으로 나뉘어, 어느 동부터 고르느냐에 따라 방문이 닿는 권역과 도착 시간이 달라집니다.`,
      `서울 ${nm}에서 출장마사지·홈타이를 알아본다면 행정동마다 다른 권역 차이를 먼저 짚어 보는 편이 방문 여부를 정확히 좁히는 길입니다.`,
    ]))}</p>`;
  const secLife = `
    <h2>${esc(nm)} 생활권과 동선 살피기</h2>
    <p>${esc(vpick(vb, "life", [
      `${nm}은(는) ${stationText} 등을 따라 오가기가 이어지고, ${landmarkText} 같은 곳을 중심으로 생활권이 짜입니다. 같은 구 안이라도 권역마다 분위기와 동선이 달라, 방문 위치를 또렷이 일러 주면 도착 시간과 방문 여부를 더 정확히 안내받을 수 있습니다.`,
      `${stationText} 등을 축으로 오가기가 이어지는 ${nm}은(는) ${landmarkText} 일대를 중심으로 생활권이 묶입니다. 동네마다 동선이 제각각이니 방문 위치를 분명히 전하면 안내가 빨라집니다.`,
      `${nm}의 생활권은 ${landmarkText} 같은 곳과 ${stationText} 등 교통을 따라 형성됩니다. 같은 구라도 동에 따라 도착 시간이 갈릴 수 있어 위치를 정확히 전하는 일이 중요합니다.`,
    ]))}</p>`;
  const secWho = `
    <h2>${esc(nm)}에서 방문 케어가 자주 쓰이는 상황</h2>
    <ul>${vsubset(vb, "who", [
      `매장에 가지 않고 집·숙소에서 느긋하게 받고 싶을 때`,
      `${nm} 안에서 퇴근 뒤나 늦은 시간에 받아 보고 싶을 때`,
      `오래 앉아 일하거나 이동이 잦아 어깨·허리가 뭉쳤을 때`,
      `처음이라 순한 스웨디시·발마사지부터 견주어 보고 싶을 때`,
      `${dong1} 등 ${nm} 안 여러 동을 두고 권역을 함께 살펴보고 싶을 때`,
      `다른 지역에서 ${nm}을(를) 찾아와 숙소에서 방문 관리를 받고 싶을 때`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCompare = `
    <h2>${esc(nm)} 방문(홈타이) vs 매장, 무엇이 다를까</h2>
    <p>${esc(vpick(vb, "cmp", [
      `매장 이용이 시설과 부대 서비스를 함께 쓰는 방식이라면, 홈타이는 ${nm} 안 집·숙소로 관리사가 찾아오는 방식입니다. 오갈 수고가 적고 끝난 뒤 바로 쉴 수 있는 대신, 관리할 자리와 수건 같은 준비물을 직접 갖춰야 하므로 예약하면서 준비 사항을 확인해 두는 편이 좋습니다.`,
      `${nm}에서 매장 이용은 부대 시설을 같이 쓸 수 있고, 홈타이는 집·숙소로 받아 따로 움직이지 않고 바로 쉴 수 있다는 점이 다릅니다. 목적과 시간대에 맞춰 알맞은 쪽을 고르면 됩니다.`,
      `홈타이는 ${nm} 주변 집·숙소로 관리사가 찾아오는 형태라 오갈 수고가 적습니다. 다만 관리할 자리·수건 같은 준비가 필요하므로, 매장 이용과 견주어 예약 전에 준비 사항을 확인해 두면 좋습니다.`,
    ]))} 어느 쪽이 맞을지는 이용 목적과 시간, 함께 받는지 여부에 따라 달라집니다.</p>`;
  const secDongs = `
    <h2>${esc(nm)} 행정동별로 좁혀 보기</h2>
    <p>아래에서 ${esc(nm)}의 행정동을 고르면 그 동네의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다. (숫자로 나뉜 행정동은 대표 동명으로 묶어 안내합니다.)</p>
    <div class="link-cloud">${dongLinks}</div>`;
  const secPrograms = `
    <h2>${esc(nm)} 관리 방식, 무엇을 고를까</h2>
    <p>${esc(vpick(vb, "prog", [
      `포근한 오일 관리가 끌리면 스웨디시·아로마테라피, 늘려 주는 느낌을 원하면 타이마사지, 집·숙소에서 편히 받고 싶으면 홈타이, 가벼운 부위 관리는 발마사지를 견주어 보세요.`,
      `${nm} 주변에서는 오일을 쓰는 스웨디시·아로마, 근육을 펴 주는 타이마사지, 찾아오는 홈타이, 부위만 다루는 발마사지를 목적에 맞춰 정하면 됩니다.`,
      `뭉친 부위와 선호하는 강도에 따라 스웨디시·아로마(이완), 타이마사지(스트레칭), 발마사지(부위), 홈타이(방문) 가운데 ${nm}을(를) 기준으로 견주어 보세요.`,
    ]))}</p>
    ${programChips(nm)}
    ${callout()}`;
  const secBooking = `
    <h2>${esc(nm)} 출장마사지 예약 길잡이</h2>
    <p>${esc(vpick(vb, "book", [
      `${nm}에서 출장마사지나 홈타이를 예약할 땐 원하는 동네(행정동), 프로그램, 시간을 함께 전하면 방문 여부와 도착 예정 시간을 안내받을 수 있습니다. 처음이라면 지역 확인 → 프로그램 고르기 → 시간·비용 확인 → 전화예약 순으로 가면 됩니다.`,
      `${nm} 예약은 원하는 행정동과 프로그램·시간을 전화로 전하는 데서 시작합니다. 방문 여부와 도착 예정 시간, 전체 비용을 함께 확인하면 진행이 매끄럽습니다.`,
      `${nm}에서 처음 예약한다면 ${dong1} 등 동네를 먼저 정하고, 프로그램과 시간을 고른 뒤 비용을 확인하는 순서가 편합니다.`,
    ]))} 적힌 가격에 방문비나 심야 추가 요금이 들어 있는지, 관리사 성별 지정이 되는지도 미리 짚어 두면 좋습니다. 안내된 내용은 참고용이며 실제 이용 조건은 예약 과정에서 확정됩니다.</p>`;
  const secCheck = `
    <h2>예약 전 점검표</h2>
    <ul>${vsubset(vb, "check", [
      `방문을 원하는 동네(행정동)와 걸리는 시간`,
      `받고 싶은 프로그램과 관리 시간`,
      `적힌 가격에 방문비·심야 요금이 들어 있는지`,
      `관리사 성별 지정 같은 추가 요청`,
      `관리할 자리·수건 등 준비물`,
      `행정동마다 다른 방문 권역 차이`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secFaq = `
    <h2>예약 전 자주 받는 질문</h2>
    <div class="faq">
      ${faqs
        .map(
          (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
        )
        .join("\n      ")}
    </div>`;

  const pre = vshuffle(vb, "preOrder", [secLife, secWho, secCompare]).join("");
  const post = vshuffle(vb, "postOrder", [secPrograms, secBooking, secCheck]).join("");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/region/">지역별 찾기</a><span>›</span><a href="/region/seoul/">서울</a><span>›</span>${esc(
    gu.name
  )}
  </nav>
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">서울특별시</p>
    <h1>서울 ${esc(gu.name)} 출장마사지·홈타이 이용 안내</h1>
    ${secFeature}${pre}
    ${secDongs}
    ${post}${secFaq}

    ${authorBox()}
    ${ctaBtn("서울 " + gu.name + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  const html = layout({
    ...branchMeta("서울 " + gu.name, "행정동"),
    path,
    body,
    structuredData: [
      faqLd(faqs),
      articleLd({
        headline: `서울 ${gu.name} 출장마사지·홈타이 이용 안내`,
        description: `서울 ${gu.name} 출장마사지·홈타이 이용 안내`,
        path,
        modified: MODIFIED,
      }),
      pricingLd(),
    ],
    breadcrumb: [
      { name: "홈", url: "/" },
      { name: "지역별 찾기", url: "/region/" },
      { name: "서울", url: "/region/seoul/" },
      { name: gu.name, url: path },
    ],
  });
  return { path, file: `region/seoul/${guSlug}/index.html`, html };
}

// ---------- 서울 광역 페이지 ----------
function seoulOverviewPage() {
  const cards = seoul.districts
    .map(
      (gu) => `<a class="card" href="/region/seoul/${gu.slug}/">
        <h3>${esc(gu.name)}</h3>
        <p>${esc(gu.character.slice(0, 52))}…</p>
      </a>`
    )
    .join("\n        ");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/region/">지역별 찾기</a><span>›</span>서울
  </nav>
  <section class="hero"><div class="container">
    <p class="eyebrow">서울특별시</p>
    <h1>서울 자치구·동별 출장마사지·홈타이 안내</h1>
    <p>${esc(seoul.intro)}</p>
    <div class="hero-actions">
      <a class="btn btn-gold" href="${site.phoneHref}">📞 전화예약 ${esc(phone)}</a>
      <a class="btn btn-outline" href="/program/">프로그램 보기</a>
    </div>
  </div></section>
  <section class="section"><div class="container">
    <div class="section-head"><span class="eyebrow">서울 25개 자치구</span>
      <h2>자치구부터 골라 보세요</h2>
      <p>자치구를 고른 뒤 행정동까지 좁혀 들어가면, 그 동네의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다.</p>
    </div>
    <div class="grid grid-4">${cards}</div>
  </div></section>
  <section class="section section-alt"><div class="container prose">
    <h2>서울에서 출장마사지·홈타이 찾아가는 길</h2>
    <p>서울은 강남·서초·송파로 대표되는 동남권부터 마포·서대문·은평 같은 서북권, 노원·도봉·강북 등 동북권까지 자치구마다 생활권과 이동 동선이 제각각입니다. 자치구를 먼저 고르고 행정동까지 좁혀 가면, 같은 ‘서울 출장마사지’라도 내 위치에 맞는 방문 권역과 도착 시간을 한층 정확히 확인할 수 있습니다.</p>
    <p>관리 방식은 포근한 오일 관리(스웨디시·아로마테라피), 늘려 주는 타이마사지, 집·숙소로 받는 홈타이, 가벼운 부위 관리(발마사지)로 나눠 견주면 고르기가 쉬워집니다. 숫자로 나뉜 행정동(○○1동·2동 등)은 대표 동명으로 묶어 안내하므로, 원하는 동네 이름으로 바로 찾아볼 수 있습니다.</p>
    ${callout()}
    <h2>예약 전 자주 받는 질문</h2>
    <div class="faq">
      <details><summary>서울이라면 어디까지 찾아가 주나요?</summary><p>자치구와 행정동마다 방문이 닿는 권역이 다를 수 있습니다. 원하는 동네를 고른 뒤 예약 시 위치를 알려 주면 방문 여부와 걸리는 시간을 안내받을 수 있습니다.</p></details>
      <details><summary>서울 쪽도 홈타이로 받아 볼 수 있을까요?</summary><p>홈타이는 집이나 숙소로 받는 방문형 출장마사지를 가리키며, 서울 어느 권역에서 방문이 되는지는 예약할 때 확인하면 됩니다.</p></details>
      <details><summary>예약은 어떤 식으로 진행되나요?</summary><p>전화로 원하는 자치구·행정동과 프로그램, 시간을 전하면 안내받을 수 있습니다. 전화예약 ${esc(
        phone
      )}.</p></details>
    </div>
    ${authorBox()}
  </div></section>
  ${reviewsSection()}
  ${pricingTable()}`;

  return {
    path: "/region/seoul/",
    file: "region/seoul/index.html",
    html: layout({
      title: `서울 자치구·동별 출장마사지 안내 | ${site.name}`,
      description: "서울 25개 자치구와 행정동을 좁혀 가며 출장마사지·홈타이 이용 안내를 살펴보세요.",
      path: "/region/seoul/",
      body,
      structuredData: [pricingLd()],
      breadcrumb: [
        { name: "홈", url: "/" },
        { name: "지역별 찾기", url: "/region/" },
        { name: "서울", url: "/region/seoul/" },
      ],
    }),
  };
}

// 서울 전체 페이지 빌드
export function buildSeoulPages() {
  // 슬러그 사전 계산(구/동, 구 내 중복 방지)
  seoul.slug = "seoul";
  for (const gu of seoul.districts) {
    gu.slug = slugify(gu.name);
    gu.dongSlug = {};
    const used = new Set();
    for (const d of gu.dongs) {
      let sg = slugify(d);
      if (!sg) sg = "dong";
      let base = sg,
        n = 2;
      while (used.has(sg)) sg = base + n++;
      used.add(sg);
      gu.dongSlug[d] = sg;
    }
  }

  const pages = [seoulOverviewPage()];
  for (const gu of seoul.districts) {
    pages.push(guPage(gu));
    for (const d of gu.dongs) pages.push(dongPage(gu, d, gu.dongs));
  }
  return pages;
}
