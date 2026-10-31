import JsBarcode from "jsbarcode";

const SVG_NS = "http://www.w3.org/2000/svg";

const escapeHtml = (text) =>
  String(text === null || text === undefined ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Renders a Code 128 barcode for the value into an SVG element */
export const renderBarcode = (svgElement, value, options = {}) => {
  JsBarcode(svgElement, value, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
    width: 2,
    height: 40,
    ...options,
  });
  return svgElement;
};

const barcodeSvgMarkup = (value) => {
  const svg = document.createElementNS(SVG_NS, "svg");
  renderBarcode(svg, value);
  svg.setAttribute("preserveAspectRatio", "none");
  return svg.outerHTML;
};

/**
 * Builds the HTML document for a single specimen label.
 * Kept separate from printing so another renderer (e.g. ZPL) can sit alongside it.
 */
export const buildLabelHtml = ({
  facilityName,
  patientName,
  patientIdentifier,
  labOrderNumber,
  testName,
  orderDate,
  width,
  height,
  showFacility,
}) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(labOrderNumber)}</title>
<style>
  @page { size: ${width} ${height}; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}; height: ${height}; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; }
  .label { width: ${width}; height: ${height}; padding: 1mm 2mm; display: flex; flex-direction: column; overflow: hidden; }
  .line { display: flex; justify-content: space-between; white-space: nowrap; line-height: 1.15; }
  .line span { overflow: hidden; text-overflow: ellipsis; }
  .line span + span { padding-left: 1mm; flex-shrink: 0; }
  .facility { font-size: 6pt; }
  .patient { font-size: 7pt; font-weight: bold; }
  .barcode { flex: 1; min-height: 0; padding: 0.5mm 0; }
  .barcode svg { display: block; width: 100%; height: 100%; }
  .number { font-size: 8pt; text-align: center; letter-spacing: 0.5pt; }
  .details { font-size: 6pt; }
</style>
</head>
<body>
<div class="label">
  ${showFacility && facilityName ? `<div class="line facility"><span>${escapeHtml(facilityName)}</span></div>` : ""}
  <div class="line patient"><span>${escapeHtml(patientName)}</span><span>${escapeHtml(patientIdentifier)}</span></div>
  <div class="barcode">${barcodeSvgMarkup(labOrderNumber)}</div>
  <div class="number">${escapeHtml(labOrderNumber)}</div>
  <div class="line details"><span>${escapeHtml(testName)}</span><span>${escapeHtml(orderDate)}</span></div>
</div>
</body>
</html>`;

/** Prints the label through the browser (and the Zebra driver) using a hidden iframe */
export const printLabel = (labelData) => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  const doc = printWindow.document;
  doc.open();
  doc.write(buildLabelHtml(labelData));
  doc.close();

  const cleanUp = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };
  printWindow.addEventListener("afterprint", cleanUp);
  setTimeout(cleanUp, 60000);

  printWindow.focus();
  printWindow.print();
  return iframe;
};
