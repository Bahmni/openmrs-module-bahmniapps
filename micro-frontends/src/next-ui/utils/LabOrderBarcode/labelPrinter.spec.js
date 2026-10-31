import { buildLabelHtml, printLabel } from "./labelPrinter";

const labelData = {
  facilityName: "Leseli Mediclinic",
  patientName: "MOTSAMAI, Palesa M.",
  patientIdentifier: "LS1234567",
  labOrderNumber: "EDAX000465",
  testName: "HIV Viral Load",
  orderDate: "28 Nov 2023",
  width: "50mm",
  height: "25mm",
  showFacility: true,
};

describe("labelPrinter", () => {
  describe("buildLabelHtml", () => {
    it("contains the label fields, page size and a barcode", () => {
      const html = buildLabelHtml(labelData);
      expect(html).toContain("@page { size: 50mm 25mm; margin: 0; }");
      expect(html).toContain("Leseli Mediclinic");
      expect(html).toContain("MOTSAMAI, Palesa M.");
      expect(html).toContain("LS1234567");
      expect(html).toContain("EDAX000465");
      expect(html).toContain("HIV Viral Load");
      expect(html).toContain("28 Nov 2023");
      expect(html).toMatch(/<svg[^>]*>.*<rect/s);
    });

    it("omits the facility when disabled", () => {
      expect(buildLabelHtml({ ...labelData, showFacility: false })).not.toContain("Leseli Mediclinic");
    });

    it("escapes text", () => {
      expect(buildLabelHtml({ ...labelData, patientName: "<b>X</b>" })).toContain("&lt;b&gt;X&lt;/b&gt;");
    });
  });

  describe("printLabel", () => {
    it("prints the label from a hidden iframe and removes it afterwards", () => {
      const print = jest.fn();
      const appendChild = document.body.appendChild.bind(document.body);
      jest.spyOn(document.body, "appendChild").mockImplementation((node) => {
        const appended = appendChild(node);
        if (node.contentWindow) {
          node.contentWindow.print = print;
          node.contentWindow.focus = jest.fn();
        }
        return appended;
      });

      const iframe = printLabel(labelData);
      const printWindow = iframe.contentWindow;

      expect(print).toHaveBeenCalledTimes(1);
      expect(document.body.contains(iframe)).toBe(true);
      expect(printWindow.document.body.innerHTML).toContain("EDAX000465");

      printWindow.dispatchEvent(new Event("afterprint"));
      expect(document.body.contains(iframe)).toBe(false);
    });
  });
});
