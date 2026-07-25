const LABEL_SIZES = {
  small: {
    width: "75mm",
    height: "50mm",
    fontSize: "7pt",
    picSize: "14mm",
    name: "75×50mm (bottle)",
  },
  medium: {
    width: "100mm",
    height: "75mm",
    fontSize: "8pt",
    picSize: "18mm",
    name: "100×75mm (container)",
  },
  large: {
    width: "148mm",
    height: "105mm",
    fontSize: "10pt",
    picSize: "24mm",
    name: "148×105mm (drum)",
  },
  a4: {
    width: "210mm",
    height: "297mm",
    fontSize: "11pt",
    picSize: "32mm",
    name: "A4 (storage cabinet)",
  },
};

const GHS_NAME = {
  GHS01: "Exploding Bomb",
  GHS02: "Flame",
  GHS03: "Flame Over Circle",
  GHS04: "Gas Cylinder",
  GHS05: "Corrosion",
  GHS06: "Skull & Crossbones",
  GHS07: "Exclamation Mark",
  GHS08: "Health Hazard",
  GHS09: "Environmental Hazard",
};

const encodeSvgDataUri = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// Lightweight, print-safe SVG pictograms (red diamond + code + name).
// This avoids external assets and renders reliably in Puppeteer PDFs.
const GHS_SVG = Object.fromEntries(
  Object.entries(GHS_NAME).map(([code, name]) => [
    code,
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="white"/>
      <g transform="translate(64,64) rotate(45) translate(-64,-64)">
        <rect x="18" y="18" width="92" height="92" fill="white" stroke="#d11f2a" stroke-width="10"/>
      </g>
      <text x="64" y="64" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#111">${code}</text>
      <text x="64" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#111">${name}</text>
    </svg>`,
  ])
);

const normalizePictogramCode = (raw) => {
  const str = String(raw || "").trim();
  if (!str) return null;
  const match = str.match(/GHS0[1-9]/i);
  return match ? match[0].toUpperCase() : null;
};

const extractLabelData = (sdsDoc) => {
  const secs = sdsDoc.sections || {};
  const s1 = secs.section1?.content || secs.section1 || {};
  const s2 = secs.section2?.content || secs.section2 || {};
  const hStatements = s2.hazard_statements || [];
  const pAll = [
    ...(s2.precautionary_statements?.prevention || []),
    ...(s2.precautionary_statements?.response || []),
    ...(s2.precautionary_statements?.storage || []),
    ...(s2.precautionary_statements?.disposal || []),
  ];
  return {
    product_name: sdsDoc.chemical_name || "Unknown Chemical",
    product_identifier: s1.product_identifier || sdsDoc.chemical_name,
    cas_number: sdsDoc.cas_number || "",
    signal_word: s2.signal_word || "WARNING",
    pictograms: s2.pictograms || [],
    hazard_statements: Array.isArray(hStatements) ? hStatements : [hStatements],
    precautionary_statements: pAll.slice(0, 8),
    supplier_name: s1.supplier_name || "Supplier Name",
    supplier_address: s1.supplier_address || "",
    supplier_phone: s1.supplier_phone || "",
    emergency_phone: s1.emergency_phone || "CHEMTREC: +1-800-424-9300",
    other_hazards: s2.other_hazards || "",
    language: sdsDoc.language || "en",
  };
};

const generateLabelHtml = (sdsDoc, size = "medium", language = "en") => {
  const data = extractLabelData(sdsDoc);
  const dims = LABEL_SIZES[size] || LABEL_SIZES.medium;
  const isRTL = ["ar", "ur"].includes(language);
  const isDanger = (data.signal_word || "").toUpperCase() === "DANGER";

  const normalizedPics = (data.pictograms || [])
    .map(normalizePictogramCode)
    .filter(Boolean);

  const picHtml = normalizedPics
    .slice(0, 4)
    .map((code) => {
      const svg = GHS_SVG[code];
      const src = svg ? encodeSvgDataUri(svg) : null;
      return src
        ? `<img alt="${code}" src="${src}" style="width:${dims.picSize};height:${dims.picSize};margin:1mm;display:inline-block"/>`
        : `<div style="display:inline-block;width:${dims.picSize};height:${dims.picSize};margin:1mm;border:2px solid #000;border-radius:2px;text-align:center;line-height:${dims.picSize};font-size:10px">${code}</div>`;
    })
    .join("");

  const hHtml = (data.hazard_statements || [])
    .slice(0, 6)
    .map((h) => `<p style="margin:0.5mm 0;font-size:${dims.fontSize}">${h}</p>`)
    .join("");
  const pHtml = (data.precautionary_statements || [])
    .slice(0, 5)
    .map((p) => `<p style="margin:0.5mm 0;font-size:${dims.fontSize}">${p}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? "rtl" : "ltr"}">
<head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${isRTL ? "'Noto Sans Arabic'," : ""}Arial,sans-serif;background:#fff}
.label{width:${dims.width};min-height:${dims.height};border:2.5px solid #000;padding:3mm;background:#fff;page-break-inside:avoid}
.name{font-size:calc(${dims.fontSize} + 3pt);font-weight:700;text-align:center;margin-bottom:1mm}
.cas{font-size:${dims.fontSize};color:#555;text-align:center;margin-bottom:2mm}
.signal{font-size:calc(${dims.fontSize} + 5pt);font-weight:900;text-align:center;color:${isDanger ? "#c0392b" : "#e67e22"};letter-spacing:2px;margin:1.5mm 0;border:1.5px solid ${isDanger ? "#c0392b" : "#e67e22"};padding:1mm}
.pics{text-align:center;margin:2mm 0 3mm}
.divider{border:none;border-top:1px solid #000;margin:1.5mm 0}
.sec-label{font-size:calc(${dims.fontSize} - 1pt);font-weight:700;text-transform:uppercase;color:#333;margin-bottom:0.5mm}
.supplier{margin-top:2mm;padding-top:1.5mm;border-top:1.5px solid #000;font-size:calc(${dims.fontSize} - 1pt)}
@media print{@page{size:${dims.width} auto;margin:0}body{margin:0}}
</style></head>
<body>
<div class="label">
  <div class="name">${data.product_name}</div>
  ${data.cas_number ? `<div class="cas">CAS: ${data.cas_number}</div>` : ""}
  <div class="signal">${data.signal_word?.toUpperCase() || "WARNING"}</div>
  <div class="pics">${picHtml || '<span style="font-size:9pt;color:#999">No pictograms assigned</span>'}</div>
  ${hHtml ? `<div class="divider"></div><div class="sec-label">⚠ Hazard Statements</div>${hHtml}` : ""}
  ${pHtml ? `<div class="divider"></div><div class="sec-label">Precautionary Statements</div>${pHtml}` : ""}
  ${data.other_hazards ? `<div class="divider"></div><p style="font-size:${dims.fontSize};font-style:italic">${data.other_hazards}</p>` : ""}
  <div class="supplier">
    <strong>${data.supplier_name}</strong><br>
    ${data.supplier_address ? `${data.supplier_address}<br>` : ""}
    ${data.supplier_phone ? `Tel: ${data.supplier_phone}<br>` : ""}
    <strong>Emergency: ${data.emergency_phone}</strong>
  </div>
</div>
</body></html>`;
};

module.exports = { generateLabelHtml, extractLabelData, LABEL_SIZES };
