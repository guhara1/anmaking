// 전국 지하철 노선/역 페이지 생성기 (권역 시스템별)
// - 시스템(수도권/부산/대구/광주/대전 등)별 레지스트리 → 같은 도시 내에서만 환승 통합
// - 도시 간 동일 역명(서울 시청 ≠ 부산 시청)은 별개 페이지로 분리, 메타 고유화
// - /subway/(인덱스) → /subway/line/{노선}/ → /subway/{역}/ (역 정규 페이지)
import { layout, esc, faqLd, articleLd, pricingTable, pricingLd, reviewsSection } from "../src/templates/layout.mjs";
import { site } from "../data/site.mjs";
import { programBySlug } from "../data/programs.mjs";
import { slugify } from "./romanize.mjs";
import { vpick, vsubset, vshuffle, vflag } from "./variants.mjs";

const MODIFIED = "2026-06-21";
const PROGRAM_PICKS = ["swedish", "aroma-therapy", "thai-massage", "home-care", "foot-massage"];
const phone = site.phone;

function seed(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
const pick = (s, arr) => arr[s % arr.length];
let _lineBySlug = {};

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
  return `<div class="callout">안내된 내용과 요금은 상황에 따라 바뀔 수 있으니, <strong>실제 방문 진행 여부와 금액은 예약 전에 ${esc(phone)}로 직접 문의</strong>해 두는 편이 확실합니다.</div>`;
}
const ctaBtn = (label) => `<p><a class="btn btn-primary" href="${site.phoneHref}">📞 ${esc(label)} 전화예약 ${esc(phone)}</a></p>`;
function programChips(place) {
  const pre = place ? `${place} ` : "";
  return `<div class="link-cloud">${PROGRAM_PICKS.map((slug) => `<a href="/program/${slug}/">${esc(pre + programBySlug[slug].label)}</a>`).join("")}</div>`;
}
const crumb = (parts) => parts.map(([name, url]) => ({ name, url: url || "" }));

// 역 타이틀·디스크립션 변형 (역명 + 노선명으로 도시 간 동명역까지 고유화)
function stationMeta(station, l1) {
  const s = seed("st|" + l1 + "|" + station);
  // 타이틀은 무조건 '역명 + 출장마사지'로 시작
  const titles = [
    `${station} 출장마사지·홈타이 정보 정리 — ${l1} | ${site.name}`,
    `${station} 출장마사지 이용법 살펴보기 · ${l1} | ${site.name}`,
    `${station} 출장마사지·홈타이 방문 신청 (${l1}) | ${site.name}`,
    `${station} 출장마사지 예약 길잡이 — ${l1} | ${site.name}`,
  ];
  const descs = [
    `${l1} ${station} 일대 출장마사지·홈타이의 방문 범위와 예약 점검 포인트.`,
    `${station}(${l1})에서 출장마사지·홈타이를 알아볼 때 짚어 둘 방문·예약 기준.`,
    `${l1} ${station} 주변 홈타이·출장마사지의 진행 순서와 요금·예약 길잡이.`,
    `${station}(${l1}) 출장마사지 예약 전 점검 항목과 옆 역 연결 정보.`,
    `${l1} ${station}을(를) 기준으로 한 출장마사지·홈타이 방문·예약 정리입니다.`,
  ];
  return { title: titles[s % titles.length], description: descs[(s >>> 2) % descs.length].slice(0, 80) };
}

// ---------- 역 페이지(정규) ----------
function stationPage(reg, sys) {
  const station = reg.name;
  const lineNames = reg.lines.map((l) => l.lineName);
  const l1 = lineNames[0];
  const isTransfer = reg.lines.length > 1;
  const sysName = sys.name; // 부산/대구/대전 등 — 동명역 구분 핵심

  const neigh = [];
  for (const l of reg.lines) {
    const line = _lineBySlug[l.lineSlug];
    if (line.stations[l.idx - 1]) neigh.push(line.stations[l.idx - 1]);
    if (line.stations[l.idx + 1]) neigh.push(line.stations[l.idx + 1]);
  }
  const uniqNeigh = [...new Set(neigh)].slice(0, 6);
  const neighText = uniqNeigh.length ? uniqNeigh.join("·") : "인근 역";
  const n1 = uniqNeigh[0] || "인근 역";
  const lineText = lineNames.join("·");
  const pos = reg.lines[0].idx; // 노선 내 위치
  const lineLen = (_lineBySlug[reg.lines[0].lineSlug].stations || []).length;
  const where = pos <= 2 ? "노선 시작부" : pos >= lineLen - 3 ? "노선 종착 부근" : "노선 가운데 구간";

  // 변형 base: 시스템·노선·역명을 모두 포함 → 동명역(부산 교대 ≠ 대구 교대)도 분기
  const vb = "ST␟" + sys.id + "␟" + l1 + "␟" + station;

  // ── 개요 문단 (독립 슬롯 3개 조합) ──
  const openA = vpick(vb, "openA", [
    `${station}은(는) ${sysName} ${lineText}이(가) 통과하는 지하철역입니다.`,
    `${sysName} ${lineText}이(가) 지나는 ${station} 주변은 출퇴근과 약속으로 사람이 오가는 역세권입니다.`,
    `${station}은(는) ${sysName} 도심을 연결하는 ${lineText} 노선상의 역으로, 주변 출장마사지·홈타이 관련 문의가 이어지는 곳입니다.`,
    `${sysName} 지하철 ${lineText}을(를) 기준으로 보면 ${station}은(는) ${where}에 위치한 역입니다.`,
    `${station}은(는) ${sysName} 생활권을 연결하는 ${lineText} 역세권을 이루는 한 곳입니다.`,
  ]);
  const openB = vpick(vb, "openB", [
    `${isTransfer ? `${reg.lines.length}개 노선이 교차하는 환승역이라 여러 방면에서 닿기 좋고, ` : `노선 하나만 지나는 역이라 동선이 비교적 단순하고, `}바로 옆 역으로는 ${neighText} 등이 자리합니다.`,
    `${n1} 쪽과 바로 이어져 있어 ${station} 주변은 ${isTransfer ? "환승까지 겹쳐 " : ""}오가는 경로가 다채로운 편입니다.`,
    `옆으로 ${neighText} 구간이 연결되어 있어, 어디서 출발하느냐에 따라 ${station}까지의 방문 경로가 바뀝니다.`,
    `${where}에 놓여 있어 ${neighText} 같은 옆 역까지 함께 묶어 권역을 보면 방문 정보를 정리하기 수월합니다.`,
  ]);
  const openC = vpick(vb, "openC", [
    `${station} 주변에서 출장마사지나 홈타이를 알아볼 때는 방문 범위와 도착까지 걸리는 시간을 먼저 짚어 보는 편이 좋습니다.`,
    `${station} 일대에서 방문 관리를 받으려면 권역과 도착 시간을 예약하면서 맞춰 보는 것이 가장 확실합니다.`,
    `${station} 역세권은 출발 지점에 따라 도착 시간이 달라질 수 있으니, 희망 시간대를 미리 잡아 두면 안내가 한결 빨라집니다.`,
    `${station}에서 받고자 하는 분이라면 같은 ${sysName} 안이라도 권역마다 도착 시간이 다를 수 있다는 점을 기억해 두면 좋습니다.`,
  ]);

  // ── '이런 경우' 불릿 풀 (6개 중 4개 선택, 순서도 셔플) ──
  const whoBullets = vsubset(vb, "who", [
    `${station} 주변에서 따로 나가지 않고 집이나 숙소에서 편히 관리받고 싶은 경우`,
    `일과를 마친 뒤나 늦은 밤 시간에 ${station} 일대에서 받고 싶은 경우`,
    `${lineText}을(를) 자주 타며 이동이 많아 어깨와 허리 피로가 쌓인 경우`,
    `${sysName} 밖에서 와 머무는 숙소에서 ${station} 주변 관리를 받고 싶은 경우`,
    `처음이라 자극이 덜한 스웨디시나 발마사지처럼 가벼운 프로그램부터 견주어 보고 싶은 경우`,
    `${n1} 같은 옆 역까지 경로에 넣어 ${station} 권역을 함께 둘러보려는 경우`,
  ], 4);

  // ── 확인할 점 문단 + 불릿 ──
  const checkPara = vpick(vb, "checkP", [
    `안내된 운영 시간이나 요금은 바뀔 수 있으므로, 방문 진행 가능 여부와 전체 금액, 추가 비용은 예약하면서 직접 확인하는 편이 좋습니다. ${station} 가까이라 해도 실제 방문 범위와 도착 시간은 출발 지점에 따라 달라집니다.`,
    `${station}처럼 ${where}에 위치한 역은 같은 ${sysName} 안에서도 권역마다 도착 시간이 제각각입니다. 예약할 때 위치와 시간, 프로그램을 함께 전하면 안내가 한층 정확해집니다.`,
    `역과 가깝다고 모든 권역의 조건이 똑같지는 않습니다. ${station}을(를) 기준으로 한 방문 가능 범위와 금액, 추가 비용은 예약 과정에서 분명히 해 두는 것이 좋습니다.`,
  ]);
  const checkBullets = vsubset(vb, "check", [
    `${station} 주변 방문 가능 범위와 도착까지 걸리는 시간`,
    `희망하는 프로그램(스웨디시·아로마·타이마사지 등)과 관리 길이`,
    `표시된 금액에 방문비와 심야 요금이 들어 있는지`,
    `관리사 성별 지정 같은 추가 요청이 되는지`,
    `관리 공간과 타월 등 챙겨 둘 것`,
    `${lineText} 환승과 이동 경로를 고려한 방문 시간대`,
  ], 5);

  // ── 관리 방식 비교 문단 ──
  const comparePara = vpick(vb, "compare", [
    `오일로 부드럽게 풀어 주는 관리를 원하면 스웨디시나 아로마테라피를, 시원하게 늘려 주는 관리를 원하면 타이마사지를 견주어 보세요. 집이나 숙소에서 편히 받고 싶다면 홈타이를, 다리 정도만 가볍게 풀고 싶다면 발마사지 같은 부분 관리도 고를 수 있습니다.`,
    `${station} 일대에서는 오일을 쓰는 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 찾아오는 홈타이, 부위만 다루는 발마사지를 목적에 맞춰 고르면 됩니다. 피로한 부위와 원하는 강도를 먼저 정해 두면 고르기가 한결 수월합니다.`,
    `처음이라면 자극이 적은 스웨디시나 발마사지부터, 뭉침이 심하면 타이마사지나 경락 쪽으로 견주어 보는 방식이 무난합니다. 나가지 않고 받고 싶다면 ${station} 주변까지 찾아오는 홈타이를 확인해 보세요.`,
  ]);

  // ── 이용 흐름 문단 ──
  const flowPara = vpick(vb, "flow", [
    `예약할 때 ${station} 주변 위치와 원하는 프로그램·시간을 전하면, 방문 진행 여부와 도착 예상 시간을 안내받습니다. 찾아오는 형태(홈타이)는 관리 공간과 타월 정도만 갖춰 두면 익숙한 자리에서 받을 수 있고, 끝난 뒤 따로 움직일 필요 없이 그대로 쉴 수 있다는 점이 좋습니다.`,
    `${station}에서 받는 순서는 위치 전달 → 프로그램·시간 정하기 → 방문 진행 여부와 금액 확인 → 전화예약으로 이어가면 매끄럽습니다. 홈타이는 오가는 부담이 적은 대신 관리 공간과 타월 같은 준비물을 미리 챙겨 두면 좋습니다.`,
    `먼저 ${station} 주변 위치와 시간대를 정해 문의하면 도착 예상 시간을 안내받을 수 있습니다. 늦은 시간에 받고 싶다면 심야 방문 가능 여부와 추가 요금을 함께 확인해 두세요.`,
  ]);

  // ── FAQ 답변 풀 ──
  const faqs = [
    { q: `${station} 인근에서 출장마사지는 어떻게 예약하나요?`, a: vpick(vb, "fa1", [
      `전화로 ${station} 주변 위치와 원하는 프로그램·시간을 전하면 방문 진행 여부와 도착까지 걸리는 시간을 안내받을 수 있습니다. 금액과 포함 항목도 같이 확인해 두세요.`,
      `${sysName} ${l1} ${station} 근처라고 알린 뒤 원하는 프로그램·시간을 전하면 도착 예상 시간과 금액을 안내받습니다. 추가 요금이 들어가는지도 미리 챙겨 두세요.`,
    ]) },
    { q: `${station}에서 홈타이도 이용할 수 있나요?`, a: vpick(vb, "fa2", [
      `홈타이는 집이나 숙소로 찾아오는 형태의 출장마사지를 말하며, ${station} 주변이 방문 가능 권역인지 예약하면서 확인하면 됩니다. 스웨디시·아로마·타이마사지 등으로 프로그램을 고를 수 있습니다.`,
      `네, 홈타이는 ${station} 주변 집·숙소로 받는 방문 관리입니다. 해당 권역에 드는지 예약할 때 확인하고, 원하는 프로그램과 시간을 함께 정하면 됩니다.`,
    ]) },
    { q: `${station}까지 방문에 얼마나 걸리나요?`, a: vpick(vb, "fa3", [
      `출발 지점과 시간대, 역 주변 권역에 따라 달라집니다. 정확히 걸리는 시간은 예약할 때 확인하는 편이 좋습니다.`,
      `${where}에 자리한 ${station}은(는) 출발 지점과 교통 흐름에 따라 도착 시간이 바뀝니다. 예약하며 위치를 알리면 예상 시간을 안내받을 수 있습니다.`,
    ]) },
  ];

  const lineLinks = reg.lines.map((l) => `<a href="/subway/line/${l.lineSlug}/">${esc(l.lineName)}</a>`).join("");
  const neighLinks = uniqNeigh.map((n) => `<a href="/subway/${sys.reg.get(n).slug}/">${esc(n)}</a>`).join("");

  // ── 중간 섹션을 페이지마다 다른 순서로 배치 ──
  const secOverview = `
    <h2>${esc(station)} 역세권 살펴보기</h2>
    <p>${esc(openA)} ${esc(openB)}</p>
    <p>${esc(openC)} 안내된 운영 정보나 요금은 바뀔 수 있으니, 실제 방문 진행 여부와 금액은 예약하면서 확인하는 편이 확실합니다.</p>`;
  const secWho = `
    <h2>${esc(station)} 주변에서 출장마사지·홈타이를 알아보는 경우</h2>
    <ul>${whoBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCheck = `
    <h2>${esc(station)} 이용 전 짚어 둘 점</h2>
    <p>${esc(checkPara)}</p>
    <ul>${checkBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    ${callout()}`;
  const secCompare = `
    <h2>${esc(station)} 주변에서 견주어 볼 관리 방식</h2>
    <p>${esc(comparePara)}</p>
    ${programChips(station)}`;
  const secFlow = `
    <h2>${esc(station)} 출장마사지·홈타이 진행 순서</h2>
    <p>${esc(flowPara)}</p>`;
  const secTips = `
    <h2>${esc(station)} 코스·시간대 고르는 안내</h2>
    <p>${esc(vpick(vb, "tipA", [
      `${station} 주변에서 처음 받아 본다면 60분 코스로 몸 상태를 살핀 뒤 뭉침이 심하면 90·120분으로 늘리는 방식이 부담이 적습니다. 코스가 길수록 전신을 천천히 풀 수 있어 피로가 오래 쌓인 경우에 잘 맞습니다.`,
      `${station}에서는 가볍게 풀고 싶으면 60분, 전신을 고루 받고 싶으면 90분, 집중해서 받고 싶으면 120분 코스가 기준이 됩니다. 받고 싶은 부위와 남는 시간에 맞춰 고르면 정하기가 쉬워집니다.`,
      `${lineText}을(를) 자주 타며 피로가 쌓였다면 90분 이상 코스로 어깨와 허리를 넉넉히 풀어 주는 편이 좋습니다. 시간이 촉박하면 60분으로 핵심 부위만 집중해 받는 방법도 있습니다.`,
      `${station} 주변 이용이 처음이라면 센 강도보다 60·90분 코스로 시작해 몸 상태를 보며 조절하는 편이 좋습니다. 강도와 시간은 관리 시작 전에 미리 알려 두면 맞춰 받기 수월합니다.`,
    ]))}</p>
    <p>${esc(vpick(vb, "tipB", [
      `${station}에서 홈타이로 받을 때는 관리받을 자리를 미리 비워 두고 큰 수건을 준비해 두면 진행이 매끄럽습니다. 심야 시간대는 방문 가능 여부와 추가 요금이 달라질 수 있으니 예약하며 함께 확인하세요.`,
      `찾아오는(홈타이) 형태로 ${station} 주변에서 받는다면 매트를 깔 자리와 타월 정도만 마련하면 됩니다. 늦은 시간대는 도착이 더 걸릴 수 있어, 원하는 시간을 미리 일러두는 편이 좋습니다.`,
      `${station} 주변에서 늦은 시간에 받을 생각이라면 심야 방문 가능 여부와 추가 요금, 도착까지 걸리는 시간을 예약하면서 확인해 두면 당일 진행이 매끄럽습니다.`,
      `${station}에서 홈타이를 처음 받는다면 출입 방법과 주차, 준비물(수건·관리 공간)을 예약 시 미리 맞춰 두면 관리사가 도착해 바로 시작할 수 있어 시간을 아낄 수 있습니다.`,
    ]))}</p>`;

  const middle = vshuffle(vb, "order", [secWho, secCheck, secCompare, secFlow, secTips]).join("\n");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/subway/">지하철역별 찾기</a><span>›</span><a href="/subway/line/${reg.lines[0].lineSlug}/">${esc(l1)}</a><span>›</span>${esc(station)}
  </nav>
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">${esc(sys.name)} 지하철 · ${esc(lineText)}</p>
    <h1>${esc(station)} 출장마사지·홈타이 이용 안내</h1>
    ${secOverview}
    ${middle}

    <h2>${esc(station)} 노선과 옆 역</h2>
    <p>${esc(station)}이(가) 지나는 ${esc(lineText)}과(와) ${esc(neighText)} 같은 옆 역을 함께 살펴보면 오가는 경로에 맞는 안내를 받기 좋습니다.</p>
    <div class="link-cloud">${lineLinks}${neighLinks}</div>

    <h2>자주 묻는 질문</h2>
    <div class="faq">
      ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n      ")}
    </div>
    ${authorBox()}
    ${ctaBtn(station + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  const path = `/subway/${reg.slug}/`;
  return {
    path,
    file: `subway/${reg.slug}/index.html`,
    html: layout({
      ...stationMeta(station, l1),
      path,
      body,
      structuredData: [
        faqLd(faqs),
        articleLd({ headline: `${station} 출장마사지·홈타이 이용 안내`, description: `${l1} ${station} 인근 출장마사지·홈타이 이용 안내`, path, modified: MODIFIED }),
        pricingLd(),
      ],
      breadcrumb: crumb([["홈", "/"], ["지하철역별 찾기", "/subway/"], [l1, `/subway/line/${reg.lines[0].lineSlug}/`], [station, path]]),
    }),
  };
}

// ---------- 노선 페이지 ----------
function linePage(line, sys) {
  const stationLinks = line.stations.map((st) => `<a href="/subway/${sys.reg.get(st).slug}/">${esc(st)}</a>`).join("");
  const area = line.area || sys.name;
  const cnt = line.stations.length;
  const first = line.stations[0] || "";
  const last = line.stations[cnt - 1] || "";
  const mid = line.stations[Math.floor(cnt / 2)] || "";
  const vb = "LN␟" + sys.id + "␟" + line.name;

  const intro = vpick(vb, "intro", [
    `${line.name}은(는) ${area}을(를) 지나며 ${cnt}개 역을 운행하는 노선입니다. 같은 노선이어도 역마다 방문 범위와 도착까지 걸리는 시간이 달라, 원하는 역을 먼저 골라 두면 출장마사지·홈타이 안내를 더 또렷하게 확인할 수 있습니다.`,
    `${first}에서 ${last}까지 ${cnt}개 역을 잇는 ${line.name}은(는) ${area} 일대를 통과합니다. 역마다 주변 권역이 달라서, ${mid} 같은 가운데 구간을 포함해 원하는 역을 먼저 정해 두면 안내가 빨라집니다.`,
    `${sys.name} ${line.name}은(는) ${area}을(를) 따라 ${cnt}개 역이 이어지는 노선입니다. 노선이 지나는 지역과 환승역을 함께 따져 보면 오가는 경로에 맞는 역을 고르기 쉽습니다.`,
    `${line.name}은(는) ${area}을(를) 가로지르며 ${first}·${mid}·${last} 등 ${cnt}개 역을 지납니다. 역마다 출장마사지·홈타이 방문 범위가 다르니 가까운 역부터 둘러보세요.`,
  ]);
  const compare = vpick(vb, "compare", [
    `오일로 부드럽게 풀어 주는 관리를 원하면 스웨디시·아로마테라피, 늘려 주는 관리를 원하면 타이마사지, 집·숙소에서 편히 받고 싶으면 홈타이, 가벼운 부분 관리는 발마사지를 견주어 보세요.`,
    `${line.name} 일대에서는 오일을 쓰는 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 찾아오는 홈타이, 부위만 다루는 발마사지를 목적에 맞춰 고르면 됩니다.`,
    `피로한 부위와 강도에 따라 스웨디시·아로마(이완), 타이마사지(스트레칭), 발마사지(부분), 홈타이(방문) 가운데서 견주면 정하기가 수월해집니다.`,
  ]);
  const useGuide = vpick(vb, "use", [
    `역세권에서 출장마사지나 홈타이를 예약할 때는 원하는 역과 프로그램, 시간을 함께 전하면 방문 진행 여부와 도착 예상 시간을 안내받을 수 있습니다. 노선이 길수록 역마다 권역이 다르니, 가까운 역을 먼저 정해 두면 예약과 안내가 한결 빨라집니다.`,
    `${line.name} 이용은 역 고르기 → 프로그램·시간 전달 → 방문 진행 여부와 금액 확인 → 전화예약으로 이어가면 매끄럽습니다. ${first}·${last} 같은 끝 구간은 도심과 도착 시간이 다를 수 있어 미리 확인해 두면 좋습니다.`,
    `먼저 ${line.name}에서 가까운 역을 정하고 프로그램과 시간을 전하면 도착 예상 시간을 안내받을 수 있습니다. 표시된 금액에 방문비와 심야 요금이 들어 있는지도 함께 확인하세요.`,
  ]);
  const cmp2 = vpick(vb, "cmp2", [
    `매장 이용이 시설과 부대 서비스를 함께 쓰는 방식이라면, 홈타이는 역 주변 집·숙소로 관리사가 찾아오는 방문 방식입니다. 오가는 부담이 적고 끝나면 바로 쉴 수 있는 대신, 관리 공간과 타월 같은 준비물을 직접 챙겨야 합니다.`,
    `${line.name} 역세권에서는 시설을 함께 쓰는 매장 이용과, 집·숙소로 받는 홈타이 가운데 목적에 맞춰 고르면 됩니다. 홈타이는 이동이나 대기가 없는 대신 준비물을 직접 챙겨야 한다는 점이 다릅니다.`,
    `핵심 차이는 ‘내가 움직이느냐, 관리사가 찾아오느냐’입니다. ${line.name} 일대에서 홈타이는 내 공간으로 찾아오는 방식이라 끝난 뒤 그대로 쉴 수 있습니다.`,
  ]);

  const faqs = [
    { q: `${line.name} 어느 역에서 출장마사지를 이용할 수 있나요?`, a: vpick(vb, "fa1", [
      `${line.name} 각 역 주변에서 진행 가능 여부를 확인할 수 있습니다. 위 역 목록에서 원하는 역을 고른 뒤 예약하며 위치를 알리면 됩니다.`,
      `${first}부터 ${last}까지 ${line.name} 각 역세권에서 확인할 수 있습니다. 원하는 역을 고르고 예약할 때 위치를 알리면 방문 진행 여부를 안내받습니다.`,
    ]) },
    { q: `${line.name}에서 홈타이도 가능한가요?`, a: vpick(vb, "fa2", [
      `홈타이는 집·숙소로 찾아오는 형태의 출장마사지를 말하며, 역 주변이 방문 가능 권역인지 예약하면서 확인하면 됩니다.`,
      `네, 홈타이는 ${line.name} 역 주변 집·숙소로 받는 방문 관리입니다. 권역에 드는지 예약할 때 확인하고 프로그램·시간을 정하면 됩니다.`,
    ]) },
    { q: `예약은 어떻게 하나요?`, a: `전화로 원하는 역과 프로그램, 시간을 전하면 방문 진행 여부와 도착까지 걸리는 시간을 안내받을 수 있습니다. 전화예약 ${phone}.` },
  ];

  const secStations = `
    <h2>${esc(line.name)} 역으로 찾아보기</h2>
    <p>아래에서 역을 고르면 그 역 주변의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다.</p>
    <div class="link-cloud">${stationLinks}</div>`;
  const secCompare = `
    <h2>${esc(line.name)} 주변에서 견주어 볼 관리 방식</h2>
    <p>${esc(compare)}</p>
    ${programChips(line.name)}
    ${callout()}`;
  const secWho = `
    <h2>${esc(line.name)} 주변에서 출장마사지·홈타이를 알아보는 경우</h2>
    <ul>${vsubset(vb, "who", [
      `${line.name} 역세권에서 따로 나가지 않고 집·숙소에서 편히 관리받고 싶은 경우`,
      `일과를 마친 뒤나 늦은 시간에 노선 주변에서 받고 싶은 경우`,
      `출퇴근으로 오가는 일이 잦아 어깨와 허리 피로가 쌓인 경우`,
      `처음이라 자극이 덜한 스웨디시·발마사지부터 견주어 보고 싶은 경우`,
      `${first}·${last} 같은 노선 양 끝 구간에서 숙소 방문 관리를 받고 싶은 경우`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secUse = `
    <h2>${esc(line.name)} 이용 안내</h2>
    <p>${esc(useGuide)}</p>`;
  const secCheck = `
    <h2>예약 전 점검 목록</h2>
    <ul>${vsubset(vb, "check", [
      `방문 희망 역과 주변까지 걸리는 시간`,
      `원하는 프로그램과 관리 길이`,
      `표시된 금액에 방문비와 심야 요금이 들어 있는지`,
      `관리사 성별 지정 같은 추가 요청`,
      `관리 공간과 타월 등 챙겨 둘 것`,
      `${line.name} 환승과 이동 경로를 고려한 방문 시간대`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCmp2 = `
    <h2>${esc(line.name)} 방문(홈타이)과 매장 이용 비교</h2>
    <p>${esc(cmp2)} 어느 방식이 맞을지는 이용 목적과 시간에 따라 달라집니다.</p>`;

  const middle = vshuffle(vb, "order", [secCompare, secWho, secUse, secCheck, secCmp2]).join("\n");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/subway/">지하철역별 찾기</a><span>›</span>${esc(line.name)}
  </nav>
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">${esc(sys.name)} 지하철</p>
    <h1>${esc(line.name)} 역별 출장마사지·홈타이 안내</h1>
    <p>${esc(intro)}</p>
    ${secStations}
    ${middle}

    <h2>지역·프로그램과 같이 보기</h2>
    <p>노선이 지나는 지역과 관리 프로그램을 함께 살펴보면 고르는 기준을 잡기 쉽습니다.</p>
    <div class="link-cloud">
      <a href="/region/seoul/">서울</a><a href="/region/gyeonggi/">경기</a><a href="/region/incheon/">인천</a><a href="/region/busan/">부산</a>
      <a href="/program/swedish/">스웨디시</a><a href="/program/aroma-therapy/">아로마테라피</a><a href="/program/home-care/">홈타이</a><a href="/guide/">예약 가이드</a>
    </div>

    <h2>자주 묻는 질문</h2>
    <div class="faq">
      ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n      ")}
    </div>
    ${authorBox()}
    ${ctaBtn(line.name + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  const path = `/subway/line/${line.slug}/`;
  return {
    path,
    file: `subway/line/${line.slug}/index.html`,
    html: layout({
      title: `${line.name} 역별 출장마사지·홈타이 이용 정보 | ${site.name}`,
      description: `${line.name} 역별 출장마사지·홈타이의 방문 범위와 예약 점검 항목을 모았습니다.`.slice(0, 80),
      path,
      body,
      structuredData: [faqLd(faqs), articleLd({ headline: `${line.name} 역별 출장마사지·홈타이 안내`, description: `${line.name} 역별 출장마사지·홈타이 안내`, path, modified: MODIFIED }), pricingLd()],
      breadcrumb: crumb([["홈", "/"], ["지하철역별 찾기", "/subway/"], [line.name, path]]),
    }),
  };
}

// ---------- 지하철 인덱스 ----------
function subwayIndex(systems, stationCount, lineCount) {
  const sections = systems.map((sys) => {
    const cards = sys.lines.map((l) => `<a class="card" href="/subway/line/${l.slug}/">
        <h3>${esc(l.name)}</h3>
        <p>${esc(l.area || sys.name)} · ${l.stations.length}개 역</p>
      </a>`).join("\n      ");
    return `<div class="section-head" style="margin-top:var(--sp-6)"><span class="eyebrow">${esc(sys.name)} 지하철</span></div>
    <div class="grid grid-3">${cards}</div>`;
  }).join("\n");
  const body = `
  <section class="hero"><div class="container">
    <p class="eyebrow">지하철역별 찾기</p>
    <h1>지하철역별 출장마사지·홈타이 안내</h1>
    <p>수도권·부산·대구·광주·대전 등 전국 지하철 노선과 역을 기준으로 출장마사지·홈타이 이용 안내를 살펴볼 수 있습니다. 노선을 고른 다음 가까운 역을 누르면 그 역세권 안내가 나옵니다. (총 ${lineCount}개 노선·${stationCount}개 역)</p>
    <div class="hero-actions">
      <a class="btn btn-gold" href="${site.phoneHref}">📞 전화예약 ${esc(phone)}</a>
      <a class="btn btn-outline" href="/region/">지역별 찾기</a>
    </div>
  </div></section>
  <section class="section"><div class="container">
    ${sections}
  </div></section>
  <section class="section section-alt"><div class="container prose">
    <h2>지하철역을 기준으로 찾는 방법</h2>
    <p>전국 지하철은 노선마다 지나는 지역과 분위기가 제각각입니다. 노선을 먼저 고른 다음 가까운 역을 누르면, 그 역세권을 기준으로 출장마사지·홈타이 방문 범위와 예약 안내를 확인할 수 있습니다. 같은 역이라도 출발 지점에 따라 걸리는 시간이 달라지니, 원하는 역과 시간대를 정해 두면 안내가 빨라집니다.</p>
    <p>관리 방식은 오일로 풀어 주는 관리(스웨디시·아로마테라피), 늘려 주는 타이마사지, 집·숙소로 받는 홈타이, 가벼운 부분 관리(발마사지)로 나눠 견주면 고르기가 쉬워집니다. 환승역은 여러 노선이 만나 닿기 편하므로, 오가는 경로에 맞는 역을 고르는 것도 한 방법입니다.</p>
    ${callout()}
    <h2>자주 묻는 질문</h2>
    <div class="faq">
      <details><summary>지하철역을 기준으로 어떻게 예약하나요?</summary><p>원하는 노선과 역을 고른 뒤 전화로 역 주변 위치와 프로그램, 시간을 전하면 방문 진행 여부와 도착까지 걸리는 시간을 안내받을 수 있습니다.</p></details>
      <details><summary>역 주변에서 홈타이도 되나요?</summary><p>홈타이는 집·숙소로 찾아오는 형태의 출장마사지로, 역 주변이 방문 가능 권역인지 예약하면서 확인하면 됩니다.</p></details>
      <details><summary>어느 지역까지 되나요?</summary><p>노선과 역마다 방문 범위가 다를 수 있습니다. 역을 고른 뒤 예약할 때 위치를 알리면 됩니다.</p></details>
    </div>
    ${authorBox()}
  </div></section>`;
  return {
    path: "/subway/",
    file: "subway/index.html",
    html: layout({
      title: `지하철역별 출장마사지·홈타이 안내 모음 | ${site.name}`,
      description: "전국 지하철 노선과 역별 출장마사지·홈타이 이용 안내를 살펴보세요.",
      path: "/subway/",
      body,
      breadcrumb: crumb([["홈", "/"], ["지하철역별 찾기", "/subway/"]]),
    }),
  };
}

export function buildSubwayPages(systems) {
  // 노선 슬러그 + 전역 노선 맵
  _lineBySlug = {};
  for (const sys of systems) {
    for (const l of sys.lines) { l.slug = l.slug || slugify(l.name); _lineBySlug[l.slug] = l; }
  }
  // 시스템별 역 레지스트리 + 전역 슬러그 중복 방지
  const usedSlugs = new Set();
  let stationCount = 0, lineCount = 0;
  for (const sys of systems) {
    sys.reg = new Map();
    for (const line of sys.lines) {
      lineCount++;
      line.stations.forEach((st, idx) => {
        let r = sys.reg.get(st);
        if (!r) { r = { name: st, lines: [] }; sys.reg.set(st, r); }
        r.lines.push({ lineName: line.name, lineSlug: line.slug, idx });
      });
    }
    for (const r of sys.reg.values()) {
      let base = slugify(r.name.replace(/역$/, "")) || "station";
      if (sys.id !== "sudogwon") base = sys.id + "-" + base;
      let sg = base, n = 2;
      while (usedSlugs.has(sg)) sg = base + "-" + n++;
      usedSlugs.add(sg);
      r.slug = sg;
    }
    stationCount += sys.reg.size;
  }
  const pages = [subwayIndex(systems, stationCount, lineCount)];
  for (const sys of systems) {
    for (const line of sys.lines) pages.push(linePage(line, sys));
    for (const r of sys.reg.values()) pages.push(stationPage(r, sys));
  }
  return pages;
}
