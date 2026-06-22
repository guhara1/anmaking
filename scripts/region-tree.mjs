// 범용 지역 계층 생성기 (광역 → 시 → 구 → 행정동, 임의 깊이)
// - 경기(시→구→동 / 시→동), 인천(구·군→동) 등에 사용
// - 각 페이지 2000~2500자 목표, 구/동별 실제 정보 + 인접 동 + 문장 변형으로 도어웨이 방지
import { layout, esc, faqLd, articleLd, pricingTable, pricingLd, reviewsSection } from "../src/templates/layout.mjs";
import { site } from "../data/site.mjs";
import { programBySlug } from "../data/programs.mjs";
import { slugify } from "./romanize.mjs";
import { vpick, vsubset, vshuffle } from "./variants.mjs";

const MODIFIED = "2026-06-21";
const PROGRAM_PICKS = ["swedish", "aroma-therapy", "thai-massage", "home-care", "foot-massage"];
const phone = site.phone;

function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const pick = (s, arr) => arr[s % arr.length];

// 타이틀·디스크립션 변형 (중복 방지: 지역명 조합 + 시드 기반 문형 변형)
export function dongMeta(dongName, metro, areaName) {
  const s = seed(metro + "|" + areaName + "|" + dongName);
  // 타이틀은 무조건 '지역명 + 출장마사지'로 시작
  const titles = [
    `${dongName} 출장마사지·홈타이 정보 모음 — ${metro} ${areaName} | ${site.name}`,
    `${dongName} 출장마사지 이용 길잡이 · ${metro} ${areaName} | ${site.name}`,
    `${dongName} 출장마사지·홈타이 방문 신청 — ${metro} ${areaName} | ${site.name}`,
    `${dongName} 출장마사지 예약 한눈에 (${metro} ${areaName}) | ${site.name}`,
  ];
  const descs = [
    `${metro} ${areaName} ${dongName} 출장마사지·홈타이 방문 범위와 신청 전 점검 포인트 정리.`,
    `${areaName} ${dongName} 출장마사지·홈타이를 알아볼 때 살필 방문 범위와 예약 기준.`,
    `${dongName}(${areaName}) 홈타이·출장마사지 진행 순서와 요금·신청 방법 소개.`,
    `${areaName} ${dongName} 방문 마사지(홈타이) 코스·시간·예약 점검 포인트 정리.`,
    `${dongName} 출장마사지 예약 점검표와 주변 동 정보를 ${metro} 중심으로 모음.`,
  ];
  return {
    title: titles[s % titles.length],
    description: descs[(s >>> 2) % descs.length].slice(0, 80),
  };
}
export function branchMeta(fullName, childLabel) {
  const s = seed("b|" + fullName);
  // 타이틀은 무조건 '지역명 + 출장마사지'로 시작
  const titles = [
    `${fullName} 출장마사지·홈타이 이용 길잡이 | ${site.name}`,
    `${fullName} 출장마사지 — ${childLabel}별 방문 정보 | ${site.name}`,
    `${fullName} 출장마사지·홈타이 예약·코스 소개 | ${site.name}`,
    `${fullName} 출장마사지 방문 이용 한눈에 | ${site.name}`,
  ];
  const descs = [
    `${fullName} 출장마사지·홈타이 소개와 ${childLabel}별 방문 범위, 예약 점검 포인트 정리.`,
    `${fullName}에서 출장마사지·홈타이를 ${childLabel}별로 견주고 예약 기준을 살펴보세요.`,
    `${fullName} 홈타이·출장마사지 코스와 이용 시간·요금, 신청 방법을 소개합니다.`,
    `${fullName} 방문 마사지 진행 순서와 ${childLabel}별 소개, 예약 전 점검표 정리.`,
  ];
  return {
    title: titles[s % titles.length],
    description: descs[(s >>> 2) % descs.length].slice(0, 80),
  };
}

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
function callout() {
  return `<div class="callout">화면에 적힌 내용과 요금은 바뀔 수 있으니, <strong>실제 방문 가능 여부와 금액은 예약 전 ${esc(
    phone
  )}로 직접 문의</strong>해 확인하시기 바랍니다.</div>`;
}
const ctaBtn = (label) =>
  `<p><a class="btn btn-primary" href="${site.phoneHref}">📞 ${esc(label)} 전화예약 ${esc(phone)}</a></p>`;
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
const stationsText = (n) => (n.stations && n.stations.length ? n.stations.slice(0, 4).join("·") : "");
const landmarksText = (n) => (n.landmarks && n.landmarks.length ? n.landmarks.slice(0, 4).join("·") : "");
function bcNav(node) {
  const parts = [
    `<a href="/">홈</a>`,
    `<a href="/region/">지역별 찾기</a>`,
    ...node.ancestors.map((a) => `<a href="${a.url}">${esc(a.name)}</a>`),
    esc(node.name),
  ];
  return `<nav class="breadcrumb container" aria-label="위치">${parts.join("<span>›</span>")}</nav>`;
}
const crumb = (node) => [
  { name: "홈", url: "/" },
  { name: "지역별 찾기", url: "/region/" },
  ...node.ancestors.map((a) => ({ name: a.name, url: a.url })),
  { name: node.name, url: node.url },
];

// ---------- 트리 정규화 ----------
function normalize(node, ancestors, parent) {
  node.ancestors = ancestors;
  node.parent = parent || null;
  if (node.kind !== "metro") node.slug = node._slug || slugify(node.name);
  node.url = "/region/" + [...ancestors.map((a) => a.slug), node.slug].join("/") + "/";

  let kids = node.children;
  if (node.dongs) {
    kids = node.dongs.map((d) => (typeof d === "string" ? { kind: "dong", name: d } : d));
    node.children = kids;
  }
  if (kids && kids.length) {
    const used = new Set();
    const childAnc = [...ancestors, { name: node.name, url: node.url, slug: node.slug }];
    for (const k of kids) {
      let sg = slugify(k.name) || "area";
      let base = sg,
        n = 2;
      while (used.has(sg)) sg = base + n++;
      used.add(sg);
      k._slug = sg;
      normalize(k, childAnc, node);
    }
  }
}

// ---------- 행정동(말단) 페이지 ----------
function dongPage(node) {
  const parent = node.parent; // 구 또는 시
  const dongName = node.name;
  const areaName = parent.name; // 예: 영통구 / 부천시
  const metro = node.ancestors[0].name; // 경기 / 인천
  const st = stationsText(parent);
  const lm = landmarksText(parent);
  const sib = (parent.children || []).filter((c) => c.kind === "dong" && c.name !== dongName);
  const near = sib.slice(0, 5);
  const nearText = near.length ? near.map((d) => d.name).join("·") : areaName + " 일대";
  const n1 = near[0] ? near[0].name : areaName + " 일대";

  // 변형 base: 광역+상위지역+동명 → 동명 동(여러 도시의 중앙동 등)도 분기
  const vb = "DG␟" + metro + "␟" + areaName + "␟" + dongName;

  // ── 개요 2문단 (독립 슬롯 조합) ──
  const openA = vpick(vb, "openA", [
    `${dongName}은(는) ${metro} ${areaName} 아래에 자리한 행정동입니다.`,
    `${metro} ${areaName} ${dongName} 일대는 주거지와 생활 시설이 어우러진 구역입니다.`,
    `${areaName} ${dongName}은(는) ${metro} 안에서도 방문 케어 문의가 꾸준한 동네로 꼽힙니다.`,
    `${dongName}은(는) ${areaName} 생활권을 떠받치는 ${metro} 소속 행정동 가운데 하나입니다.`,
    `${metro} ${areaName}에 속한 ${dongName}은(는) 이웃 동들과 구역이 빽빽이 맞물린 곳입니다.`,
  ]);
  const openCtx = (parent.character ? esc(parent.character) + " " : "") +
    (st ? `가까이에 ${esc(st)} 등이 있어 오가기가 수월하고, ` : "") +
    (lm ? `${esc(lm)} 같은 곳이 생활 구역의 길잡이 역할을 합니다.` : "둘레의 생활 구역을 중심으로 오가는 길이 잡힙니다.");
  const demand = vpick(vb, "demand", [
    `${dongName}에서 출장마사지나 홈타이를 알아볼 때는 어디까지 방문되는지와 도착까지 걸리는 시간을 먼저 살펴보는 편이 좋습니다.`,
    `${dongName} 부근에서 방문 케어를 받아 보려는 분이라면 같은 ${areaName} 안이라도 구역마다 도착 시간이 제각각일 수 있다는 점을 미리 알아 두면 좋습니다.`,
    `${dongName}에서 받아 보려면 방문이 되는지와 걸리는 시간을 예약할 때 짚어 두는 것이 정확합니다.`,
    `${n1} 쪽과 이어진 ${dongName}은(는) 출발 위치에 따라 도착 시간이 달라질 수 있으니, 위치를 또렷이 알려 주면 안내가 한결 매끄럽습니다.`,
  ]);

  // ── '이런 경우' 불릿 (6개 중 4개, 순서 셔플) ──
  const whoBullets = vsubset(vb, "who", [
    `${areaName} 안에서 밖에 나가지 않고 집이나 숙소에서 느긋하게 케어받고 싶을 때`,
    `일을 마친 뒤나 밤늦은 시간에 ${dongName} 부근에서 받아 보고 싶을 때`,
    `장시간 앉아 일하거나 돌아다니는 일이 많아 어깨·허리에 피로가 쌓였을 때`,
    `처음이라 순한 스웨디시나 발마사지처럼 부담 적은 코스부터 견줘 보고 싶을 때`,
    `${n1} 같은 이웃 동까지 범위에 넣어 ${dongName}을(를) 같이 둘러보려 할 때`,
    `${metro} 바깥에서 ${areaName}을(를) 찾아와 숙소에서 케어를 받고 싶을 때`,
  ], 4);

  // ── 확인할 점 문단 + 불릿 ──
  const checkPara = vpick(vb, "checkP", [
    `적어 둔 운영 시간이나 요금은 바뀔 수 있으니, 방문 가능 여부와 전체 금액, 추가 요금은 예약하면서 직접 짚어 두는 편이 좋습니다. ${dongName} 부근은 출발 위치에 따라 걸리는 시간이 달라질 수 있어, 원하는 시간대를 정해 두고 문의하면 안내가 빠릅니다.`,
    `같은 ${areaName} 안이라도 ${dongName}을(를) 기준으로 한 범위와 도착 시간은 출발 위치에 따라 갈립니다. 예약할 때 위치와 시간, 코스를 같이 알려 주면 안내가 또렷해집니다.`,
    `${dongName}에서 받을 때는 방문되는 범위와 금액, 추가 요금을 예약 과정에서 못 박아 두는 편이 좋습니다. 적힌 내용은 참고용이며 실제 조건은 상담에서 확정됩니다.`,
  ]);
  const checkBullets = vsubset(vb, "check", [
    `${dongName} 방문되는 범위와 도착까지 걸리는 시간`,
    `받고 싶은 코스(스웨디시·아로마·타이마사지 등)와 케어 시간`,
    `적힌 금액에 방문비·심야 요금이 들어 있는지 여부`,
    `관리사 성별 지정 같은 추가 요청을 받아 주는지 여부`,
    `케어할 공간·타월 등 챙길 것`,
    `${areaName} 안 오가는 길에 맞춘 방문 시간대`,
  ], 5);

  // ── 관리 방식 비교 문단 ──
  const comparePara = vpick(vb, "compare", [
    `오일로 부드럽게 풀고 싶다면 스웨디시나 아로마테라피를, 쭉쭉 늘려 시원하게 풀고 싶다면 타이마사지를 견줘 보세요. 집이나 숙소에서 편하게 받고 싶다면 홈타이, 다리만 가볍게 풀고 싶다면 발마사지 같은 부분 케어도 고를 수 있습니다.`,
    `${dongName} 부근에서는 오일을 쓰는 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 방문해서 받는 홈타이, 부분만 보는 발마사지를 목적에 맞춰 고르면 됩니다. 어디가 뭉쳤는지와 세기를 먼저 정하면 고르기가 한결 쉬워집니다.`,
    `처음이라면 자극이 덜한 스웨디시나 발마사지부터, 뭉침이 심하면 타이마사지나 경락 쪽으로 견줘 보세요. 나가지 않고 받고 싶다면 ${dongName} 부근으로 방문되는 홈타이를 확인하면 됩니다.`,
  ]);

  // ── 이용 흐름 문단 ──
  const flowPara = vpick(vb, "flow", [
    `예약할 때 ${dongName} 위치와 받고 싶은 코스·시간을 알려 주면, 방문이 되는지와 도착 예정 시간을 안내받게 됩니다. 방문형(홈타이)은 케어할 자리와 타월 정도만 갖춰 두면 익숙한 공간에서 받을 수 있고, 끝난 뒤 따로 움직일 필요 없이 그대로 쉴 수 있다는 점이 좋습니다.`,
    `${dongName}에서의 이용은 위치 알리기 → 코스·시간 고르기 → 방문 여부와 금액 확인 → 전화예약 순으로 밟으면 매끄럽습니다. 홈타이는 오갈 부담이 적은 대신 케어할 자리·타월 같은 준비물을 미리 챙겨 두면 좋습니다.`,
    `먼저 ${dongName} 위치와 시간대를 잡아 문의하면 도착 예정 시간을 안내받을 수 있습니다. 밤늦게 받고 싶다면 심야 방문이 되는지와 추가 요금을 같이 확인해 두세요.`,
  ]);

  const faqs = [
    {
      q: `${dongName}에서 출장마사지는 어떻게 예약하나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${dongName}(${metro} ${areaName}) 위치와 받고 싶은 코스·시간을 말씀하시면 방문이 되는지와 도착까지 걸리는 시간을 안내받을 수 있습니다. 금액과 어디까지 포함되는지도 같이 짚어 두세요.`,
        `${metro} ${areaName} ${dongName}이라고 말씀하시고 코스·시간을 전하면 도착 예정 시간과 금액을 안내받습니다. 추가 요금이 들어 있는지도 미리 확인해 두세요.`,
      ]),
    },
    {
      q: `${dongName}에서 홈타이도 이용할 수 있나요?`,
      a: vpick(vb, "fa2", [
        `홈타이는 집이나 숙소로 찾아가 받는 방문형 출장마사지를 가리키며, ${dongName}도 방문되는 범위인지는 예약할 때 확인하면 됩니다. 스웨디시·아로마·타이마사지 같은 코스를 골라 받을 수 있습니다.`,
        `네, 홈타이는 ${dongName} 부근 집이나 숙소로 찾아가 받는 방문 케어입니다. 범위에 드는지 예약할 때 확인하고 받고 싶은 코스·시간을 같이 잡으면 됩니다.`,
      ]),
    },
    {
      q: `${dongName}까지 방문에 얼마나 걸리나요?`,
      a: vpick(vb, "fa3", [
        `출발 위치와 시간대, ${areaName} 안 어느 구역인지에 따라 갈립니다. 정확히 얼마나 걸리는지는 예약할 때 확인해 두는 편이 좋습니다.`,
        `${dongName}은(는) 출발 위치와 길 사정에 따라 도착 시간이 달라집니다. 예약하며 위치를 알려 주면 대략 걸리는 시간을 안내받을 수 있습니다.`,
      ]),
    },
  ];

  const secOverview = `
    <h2>${esc(dongName)} 지역 한눈에 보기</h2>
    <p>${esc(openA)} ${openCtx}</p>
    <p>${esc(demand)} 같은 ${esc(areaName)} 안에서 ${esc(nearText)} 같은 이웃 동과 구역이 맞물려 있어, 방문 위치를 또렷이 알려 주면 안내가 한결 수월합니다.</p>`;
  const secWho = `
    <h2>${esc(dongName)}에서 출장마사지·홈타이를 찾는 경우</h2>
    <ul>${whoBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCheck = `
    <h2>${esc(dongName)}에서 받기 전에 짚어 둘 점</h2>
    <p>${esc(checkPara)}</p>
    <ul>${checkBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    ${callout()}`;
  const secCompare = `
    <h2>${esc(dongName)}에서 견줘 볼 케어 방식</h2>
    <p>${esc(comparePara)}</p>
    ${programChips(dongName)}`;
  const secFlow = `
    <h2>${esc(dongName)} 출장마사지·홈타이 진행 순서</h2>
    <p>${esc(flowPara)}</p>`;
  const secTips = `
    <h2>${esc(dongName)} 코스·시간대 고르기</h2>
    <p>${esc(vpick(vb, "tipA", [
      `${dongName} 부근이 처음이라면 60분 코스로 몸 상태를 본 다음 뭉침이 심하면 90·120분으로 늘리는 방식이 부담이 적습니다. 시간이 길수록 온몸을 천천히 풀 수 있어 피로가 오래 쌓인 경우에 잘 맞습니다.`,
      `${dongName}에서는 가볍게 풀고 싶으면 60분, 온몸을 고루 받고 싶으면 90분, 집중해 풀고 싶으면 120분 코스를 기준 삼으면 됩니다. 풀고 싶은 부위와 시간 여유에 맞추면 고르기가 쉬워집니다.`,
      `${areaName} 일대에서 코스를 정할 때는 ‘오늘 얼마나 풀고 싶은지’부터 떠올리면 됩니다. 짧게 60분, 보통 90분, 집중 120분으로 나눠 두고 ${dongName} 방문 시간대와 함께 잡으면 편합니다.`,
      `${dongName} 부근이 처음이라면 센 강도보다 60·90분 코스로 시작해 몸 상태를 보며 맞춰 가는 편이 좋습니다. 세기와 시간은 시작 전에 미리 전하면 그에 맞춰 받기가 수월합니다.`,
    ]))}</p>
    <p>${esc(vpick(vb, "tipB", [
      `${dongName}에서 홈타이로 받는다면 케어할 자리를 미리 치워 두고 큰 수건을 챙겨 두면 진행이 매끄럽습니다. 심야 시간대는 방문 여부와 추가 요금이 달라질 수 있으니 예약할 때 같이 짚어 두세요.`,
      `방문형(홈타이)으로 ${dongName}에서 받는다면 매트를 깔 자리와 타월 정도만 챙기면 됩니다. 늦은 시간 이용은 도착이 더 걸릴 수 있어, 원하는 시간을 미리 알려 두는 것이 좋습니다.`,
      `${dongName} 부근에서 늦은 시간 이용을 떠올린다면 심야 방문 여부와 추가 요금, 도착까지 걸리는 시간을 예약 단계에서 확인해 두면 당일 진행이 매끄럽습니다.`,
      `${dongName}에서 홈타이를 처음 받는다면 들어오는 길과 주차, 챙길 것(수건·케어 자리)을 예약할 때 미리 맞춰 두면 관리사가 도착하자마자 시작할 수 있어 시간이 절약됩니다.`,
    ]))}</p>`;

  const middle = vshuffle(vb, "order", [secWho, secCheck, secCompare, secFlow, secTips]).join("\n");

  const body = `
  ${bcNav(node)}
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">${esc(metro)} ${esc(
    areaName
  )}</p>
    <h1>${esc(dongName)} 출장마사지·홈타이 이용 길잡이</h1>
    ${secOverview}
    ${middle}

    <h2>${esc(dongName)} 주변 동네</h2>
    <p>같은 ${esc(areaName)} 안 ${esc(nearText)} 같은 이웃 동과 함께 견줘 보면 방문 범위를 잡기 쉽습니다.</p>
    <div class="link-cloud">
      ${near.map((d) => `<a href="${d.url}">${esc(d.name)}</a>`).join("")}
      <a href="${parent.url}">${esc(areaName)} 전체</a>
      <a href="${node.ancestors[0].url}">${esc(metro)} 전체</a>
    </div>

    <h2>예약 전 자주 받는 질문</h2>
    <div class="faq">
      ${faqs
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join("\n      ")}
    </div>

    ${authorBox()}
    ${ctaBtn(dongName + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  return {
    path: node.url,
    file: node.url.replace(/^\//, "").replace(/\/$/, "") + "/index.html",
    html: layout({
      ...dongMeta(dongName, metro, areaName),
      path: node.url,
      body,
      structuredData: [
        faqLd(faqs),
        articleLd({
          headline: `${dongName} 출장마사지·홈타이 이용 길잡이`,
          description: `${dongName}(${metro} ${areaName}) 출장마사지·홈타이 이용 길잡이`,
          path: node.url,
          modified: MODIFIED,
        }),
        pricingLd(),
      ],
      breadcrumb: crumb(node),
    }),
  };
}

// ---------- 시/구(중간) 페이지 ----------
function branchPage(node) {
  const metro = node.kind === "metro" ? node.name : node.ancestors[0].name;
  const childKind = node.children && node.children[0] ? node.children[0].kind : "dong";
  const childLabel = childKind === "si" ? "시·군" : childKind === "gu" ? "자치구·구" : "행정동";
  const st = stationsText(node);
  const lm = landmarksText(node);
  const fullName = node.kind === "metro" ? node.name : `${metro} ${node.name}`;

  const childLinks = (node.children || [])
    .map((c) => `<a href="${c.url}">${esc(c.name)}</a>`)
    .join("");
  const childCards = (node.children || [])
    .map(
      (c) => `<a class="card" href="${c.url}">
        <h3>${esc(c.name)}</h3>
        <p>${esc((c.character || `${c.name} 출장마사지·홈타이 이용 길잡이`).slice(0, 50))}…</p>
      </a>`
    )
    .join("\n        ");

  const nm = node.name;
  const child1 = node.children && node.children[0] ? node.children[0].name : childLabel;
  // 변형 base: 광역 + 지역명 → 동명 구(여러 광역시의 동구·남구 등)도 분기
  const vb = "BR␟" + metro + "␟" + nm;

  const faqs = [
    {
      q: `${fullName} 출장마사지는 어떻게 예약하나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${fullName} 안의 ${childLabel}와 받고 싶은 코스·시간을 말씀하시면 방문이 되는지와 걸리는 시간을 안내받을 수 있습니다.`,
        `${fullName}에서는 원하는 ${childLabel}, 코스, 시간을 전화로 말씀하시면 방문이 되는지와 도착 예정 시간을 안내받을 수 있습니다.`,
      ]),
    },
    {
      q: `${fullName}에서 받을 수 있는 프로그램은 무엇인가요?`,
      a: vpick(vb, "fa2", [
        `스웨디시·아로마테라피·타이마사지 같은 여러 코스와 집·숙소로 찾아가는 홈타이를 견줘 볼 수 있습니다.`,
        `오일 케어(스웨디시·아로마), 쭉쭉 늘려 푸는 타이마사지, 방문형 홈타이, 부분만 보는 발마사지 등을 ${nm} 기준으로 견줘 볼 수 있습니다.`,
      ]),
    },
    {
      q: `${fullName} 어디까지 방문이 되나요?`,
      a: vpick(vb, "fa3", [
        `${childLabel}마다 방문되는 범위가 다를 수 있습니다. 아래 목록에서 해당 지역을 확인하고 예약할 때 위치를 알려 주면 됩니다.`,
        `${nm} 안 ${childLabel}에 따라 범위가 갈립니다. ${child1} 같은 원하는 지역을 고른 뒤 예약하며 위치를 알리면 방문 여부를 확인할 수 있습니다.`,
      ]),
    },
  ];

  // 중간 페이지 본문 (2000자 목표)
  const charPara = node.character
    ? `<p>${esc(nm)}은(는) ${esc(node.character)}${
        st ? ` ${esc(st)} 등으로 오가기가 이어지고,` : ""
      }${lm ? ` ${esc(lm)} 같은 곳이 생활 구역의 길잡이 역할을 합니다.` : ""}</p>`
    : `<p>${esc(node.intro || vpick(vb, "noChar", [
        `${fullName}은(는) 구역이 넓어 같은 지역이라도 ${childLabel}에 따라 방문되는 범위와 도착까지 걸리는 시간이 달라질 수 있습니다.`,
        `${fullName}은(는) ${child1} 같은 여러 ${childLabel}로 나뉘어, 어느 지역을 먼저 고르느냐에 따라 방문 범위와 안내가 달라집니다.`,
        `${fullName}은(는) 생활권이 폭넓게 이어져 있어, ${childLabel}마다 방문되는 범위와 도착 시간을 따로 짚어 보는 것이 좋습니다.`,
      ]))}</p>`;

  const isMetro = node.kind === "metro";

  const childSection = isMetro
    ? `<section class="section"><div class="container">
        <div class="section-head"><span class="eyebrow">${esc(node.name)} ${esc(
        childLabel
      )}</span>
          <h2>${esc(childLabel)}를 골라 보세요</h2>
          <p>${esc(
            childLabel
          )}를 고른 다음 하위 지역까지 좁혀 가면, 그 지역의 출장마사지·홈타이 이용 길잡이를 확인할 수 있습니다.</p>
        </div>
        <div class="grid grid-4">${childCards}</div>
      </div></section>`
    : `<h2>${esc(node.name)} ${esc(childLabel)}에서 찾기</h2>
       <p>아래에서 ${esc(node.name)}의 ${esc(
        childLabel
      )}를 고르면 그 지역의 출장마사지·홈타이 이용 길잡이를 확인할 수 있습니다. (숫자 행정동은 대표 동명으로 묶어 소개합니다.)</p>
       <div class="link-cloud">${childLinks}</div>`;

  const secFeature = `
    <h2>${esc(nm)} 지역 살펴보기</h2>
    ${charPara}
    <p>${esc(vpick(vb, "feat", [
      `같은 ‘${fullName} 출장마사지’라도 ${childLabel}에 따라 방문 범위와 도착까지 걸리는 시간이 달라질 수 있어, 원하는 지역을 먼저 고르면 방문 여부와 코스를 더 또렷이 확인할 수 있습니다.`,
      `${nm}은(는) ${child1} 등으로 구역이 나뉘어, 어느 ${childLabel}을(를) 먼저 고르느냐에 따라 방문되는 범위와 도착 시간이 달라집니다.`,
      `${fullName}에서 출장마사지·홈타이를 알아볼 때는 ${childLabel}마다 다른 범위를 먼저 살펴보면 방문 여부를 정확히 좁힐 수 있습니다.`,
    ]))}</p>`;

  const secWho = `
    <h2>${esc(nm)}에서 출장마사지·홈타이 문의가 잦은 경우</h2>
    <ul>${vsubset(vb, "who", [
      `매장에 들르지 않고 집이나 숙소에서 편하게 케어받고 싶을 때`,
      `${nm} 안에서 퇴근 뒤나 늦은 시간에 받아 보고 싶을 때`,
      `장시간 앉아 일하거나 돌아다니는 일이 많아 어깨·허리가 뭉쳤을 때`,
      `처음이라 순한 스웨디시·발마사지부터 견줘 보고 싶을 때`,
      `${child1} 같은 ${nm} 안 여러 지역을 두고 범위를 같이 살펴보려 할 때`,
      `다른 지역에서 ${nm}을(를) 찾아와 숙소에서 방문 케어를 받고 싶을 때`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

  const secCompare = `
    <h2>${esc(nm)}에서 방문(홈타이)과 매장 이용 견주기</h2>
    <p>${esc(vpick(vb, "compare", [
      `매장 이용이 시설과 부대 서비스를 함께 쓰는 방식이라면, 홈타이는 ${nm} 안 집이나 숙소로 관리사가 찾아오는 방문 방식입니다. 오갈 부담이 적고 끝난 뒤 바로 쉴 수 있는 대신, 케어할 자리와 타월 같은 준비물을 직접 챙겨야 하므로 예약할 때 챙길 것을 확인해 두는 것이 좋습니다.`,
      `${nm}에서 매장 이용은 부대 시설을 같이 쓸 수 있고, 홈타이는 집이나 숙소로 받아 따로 움직이지 않고 바로 쉴 수 있다는 점이 다릅니다. 목적과 시간대에 따라 맞는 방식을 고르면 됩니다.`,
      `홈타이는 ${nm} 부근 집이나 숙소로 관리사가 찾아오는 형태라 오갈 부담이 적습니다. 대신 케어할 자리·타월 같은 준비가 필요하므로, 매장 이용과 견줘 예약 전에 챙길 것을 확인해 두는 것이 좋습니다.`,
    ]))}</p>`;

  const secGuide = `
    <h2>${esc(nm)} 출장마사지 한눈에 보기</h2>
    <p>${esc(vpick(vb, "guide", [
      `${nm}에서 출장마사지·홈타이를 받을 때는 방문 범위(어느 지역까지 가는지), 코스(스웨디시·아로마·타이마사지·홈타이), 이용 시간(60·90·120분), 전체 금액과 추가 요금을 차례로 확인하면 고르기가 쉬워집니다. 특히 ${childLabel}에 따라 도착까지 걸리는 시간이 달라질 수 있으니, 원하는 지역을 먼저 정해 두는 것이 좋습니다.`,
      `${nm} 이용은 ① 방문 범위 ② 코스 ③ 이용 시간(60·90·120분) ④ 금액·추가 요금 순으로 짚으면 정리가 쉽습니다. ${childLabel}마다 범위가 달라 원하는 지역을 먼저 정하는 것이 핵심입니다.`,
      `${nm}에서는 어느 ${childLabel}까지 방문되는지, 어떤 코스를 받을지, 시간과 금액은 어떻게 되는지를 차례로 짚으면 고를 기준이 또렷해집니다. 지역에 따라 도착 시간이 달라지는 점만 미리 감안하세요.`,
    ]))}</p>`;

  const secPrograms = `
    <h2>${esc(nm)}에서 견줘 볼 케어 방식</h2>
    <p>${esc(vpick(vb, "prog", [
      `오일로 부드럽게 풀고 싶다면 스웨디시·아로마테라피, 쭉쭉 늘리는 쪽이라면 타이마사지, 집이나 숙소에서 편하게 받고 싶다면 홈타이, 가벼운 부분 케어는 발마사지를 견줘 보세요.`,
      `${nm} 부근에서는 오일을 쓰는 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 방문형 홈타이, 부분만 보는 발마사지를 목적에 맞춰 고르면 됩니다.`,
      `뭉친 부위와 선호하는 세기에 따라 스웨디시·아로마(이완), 타이마사지(스트레칭), 발마사지(부분), 홈타이(방문) 가운데 ${nm} 기준으로 견줘 보세요.`,
    ]))}</p>
    ${programChips(nm)}
    ${callout()}`;

  const secBooking = `
    <h2>${esc(nm)} 출장마사지 예약 길잡이</h2>
    <p>${esc(vpick(vb, "booking", [
      `${nm}에서 출장마사지나 홈타이를 예약할 때는 원하는 하위 지역, 코스, 시간을 같이 말씀하시면 방문 여부와 도착 예정 시간을 안내받을 수 있습니다. 처음이라면 지역 확인 → 코스 고르기 → 시간·금액 확인 → 전화예약 순으로 밟으면 됩니다. 적힌 금액에 방문비나 심야 추가 요금이 들어 있는지, 관리사 성별 지정이 되는지도 미리 짚어 두면 좋습니다.`,
      `${nm} 예약은 원하는 ${childLabel}와 코스·시간을 전화로 알리는 데서 시작합니다. 방문 여부와 도착 예정 시간, 전체 금액을 함께 확인하고, 심야 추가 요금이나 관리사 성별 지정이 되는지도 미리 물어 두면 좋습니다.`,
      `${nm}에서 처음 예약한다면 ${child1} 같은 지역을 먼저 정하고, 코스와 시간을 고른 뒤 금액을 확인하는 순서가 편합니다. 방문비·심야 요금이 들어 있는지 같이 확인하면 실제 금액을 가늠하기 쉽습니다.`,
    ]))} 적어 둔 내용은 참고용이며 실제 이용 조건은 예약 과정에서 확정됩니다.</p>`;

  const secChecklist = `
    <h2>예약 전 점검표</h2>
    <ul>${vsubset(vb, "check", [
      `방문받고 싶은 지역과 방문까지 걸리는 시간`,
      `받고 싶은 코스와 케어 시간`,
      `적힌 금액에 방문비·심야 요금이 들어 있는지 여부`,
      `관리사 성별 지정 같은 추가 요청`,
      `케어할 공간·타월 등 챙길 것`,
      `${childLabel}마다 다른 방문 범위`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

  const secFaq = `
    <h2>예약 전 자주 받는 질문</h2>
    <div class="faq">
      ${faqs
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join("\n      ")}
    </div>
    ${authorBox()}
    ${ctaBtn(fullName + " 출장마사지")}`;

  let body;
  if (isMetro) {
    body = `
    ${bcNav(node)}
    <section class="hero"><div class="container">
      <p class="eyebrow">${esc(node.name)}</p>
      <h1>${esc(node.name)} 출장마사지·홈타이 — ${esc(childLabel)}·행정동별 찾기</h1>
      <p>${esc(
        node.intro ||
          `${node.name}은(는) ${childLabel}와 행정동에 따라 방문되는 범위와 도착까지 걸리는 시간이 달라집니다. 원하는 지역을 먼저 고르면 방문 여부와 코스를 더 또렷이 확인할 수 있습니다.`
      )}</p>
      <div class="hero-actions">
        <a class="btn btn-gold" href="${site.phoneHref}">📞 전화예약 ${esc(phone)}</a>
        <a class="btn btn-outline" href="/program/">프로그램 보기</a>
      </div>
    </div></section>
    ${childSection}
    <section class="section section-alt"><div class="container prose">
      ${secFeature}${secWho}${secCompare}${secGuide}${secPrograms}${secBooking}${secChecklist}${secFaq}
    </div></section>
    ${reviewsSection()}
  ${pricingTable()}`;
  } else {
    // 본문 섹션 순서를 페이지마다 다르게(도어웨이 방지) — 도입/목록/FAQ 위치는 유지
    const pre = vshuffle(vb, "preOrder", [secWho, secCompare, secGuide]).join("");
    const post = vshuffle(vb, "postOrder", [secPrograms, secBooking, secChecklist]).join("");
    body = `
    ${bcNav(node)}
    <article class="section-tight"><div class="container prose">
      <p class="card-tag" style="color:var(--color-accent);font-weight:700">${esc(metro)}</p>
      <h1>${esc(fullName)} 출장마사지·홈타이 이용 길잡이</h1>
      ${secFeature}${pre}
      ${childSection}
      ${post}${secFaq}
    </div></article>
    ${reviewsSection()}
  ${pricingTable()}`;
  }

  return {
    path: node.url,
    file: node.url.replace(/^\//, "").replace(/\/$/, "") + "/index.html",
    html: layout({
      ...branchMeta(fullName, childLabel),
      path: node.url,
      body,
      structuredData: [
        faqLd(faqs),
        articleLd({
          headline: `${fullName} 출장마사지·홈타이 이용 길잡이`,
          description: `${fullName} 출장마사지·홈타이 이용 길잡이`,
          path: node.url,
          modified: MODIFIED,
        }),
        pricingLd(),
      ],
      breadcrumb: crumb(node),
    }),
  };
}

function collect(node, out) {
  if (node.kind === "dong") out.push(dongPage(node));
  else {
    out.push(branchPage(node));
    for (const k of node.children || []) collect(k, out);
  }
}

// 지역 트리 전체 빌드
export function buildRegionTree(root) {
  normalize(root, [], null);
  const pages = [];
  collect(root, pages);
  return pages;
}
