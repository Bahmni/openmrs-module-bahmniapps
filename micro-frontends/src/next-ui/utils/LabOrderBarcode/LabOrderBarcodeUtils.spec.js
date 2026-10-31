import axios from "axios";
import {
  buildConfig,
  fetchLabOrderRows,
  findLabOrderNumber,
  formatLabelDate,
  formatLabelName,
  toLabOrderRows,
} from "./LabOrderBarcodeUtils";

jest.mock("axios");

const CONCEPT = "eRegister Lab Order Number";

const obs = (value, observationDateTime, extra = {}) => ({
  concept: { name: CONCEPT },
  value,
  observationDateTime,
  ...extra,
});

const order = (orderUuid, orderDate, observations, concept = { name: "HIV Viral Load" }) => ({
  orderUuid,
  orderDate,
  concept,
  bahmniObservations: observations,
});

describe("LabOrderBarcodeUtils", () => {
  describe("buildConfig", () => {
    it("falls back to defaults for missing keys", () => {
      expect(buildConfig({ numberOfVisits: 3, label: { width: "60mm" } })).toEqual({
        orderType: "Lab Order",
        conceptName: CONCEPT,
        numberOfVisits: 3,
        label: { width: "60mm", height: "25mm", showFacility: true },
      });
    });
  });

  describe("findLabOrderNumber", () => {
    it("returns the latest non-voided value", () => {
      const labOrder = order("o1", "2023-11-27T10:00:00", [
        obs("EDAX000458", "2023-11-27T11:00:00"),
        obs("EDAX000459", "2023-11-27T12:00:00", { voided: true }),
        obs("EDAX000460", "2023-11-27T11:30:00"),
      ]);
      expect(findLabOrderNumber(labOrder, CONCEPT)).toBe("EDAX000460");
    });

    it("finds the value inside group members", () => {
      const labOrder = order("o1", "2023-11-27T10:00:00", [
        { concept: { name: "Lab Set" }, groupMembers: [obs("EDAX000461", "2023-11-27T11:00:00")] },
      ]);
      expect(findLabOrderNumber(labOrder, CONCEPT)).toBe("EDAX000461");
    });

    it("returns null when there is no value", () => {
      const labOrder = order("o1", "2023-11-27T10:00:00", [
        { concept: { name: "Other" }, value: "x" },
        obs("  ", "2023-11-27T11:00:00"),
      ]);
      expect(findLabOrderNumber(labOrder, CONCEPT)).toBeNull();
    });
  });

  describe("toLabOrderRows", () => {
    it("keeps orders with a number, newest first, preferring short names", () => {
      const rows = toLabOrderRows(
        [
          order("old", "2023-11-27T10:00:00", [obs("EDAX000458", "2023-11-27T10:00:00")]),
          order("none", "2023-11-29T10:00:00", []),
          order("new", "2023-11-28T10:00:00", [obs("EDAX000462", "2023-11-28T10:00:00")], {
            name: "HIV Viral Load Test",
            shortName: "VL",
          }),
        ],
        CONCEPT
      );
      expect(rows.map((row) => row.orderUuid)).toEqual(["new", "old"]);
      expect(rows[0].testName).toBe("VL");
      expect(rows[1].testName).toBe("HIV Viral Load");
    });
  });

  describe("fetchLabOrderRows", () => {
    afterEach(() => jest.resetAllMocks());

    it("looks up the order type and fetches orders for the concept", async () => {
      axios.get
        .mockResolvedValueOnce({ data: { results: [{ uuid: "lab-uuid", display: "Lab Order" }] } })
        .mockResolvedValueOnce({
          data: [order("o1", "2023-11-27T10:00:00", [obs("EDAX000458", "2023-11-27T10:00:00")])],
        });

      const rows = await fetchLabOrderRows({ patientUuid: "patient-uuid", config: buildConfig() });

      expect(rows).toHaveLength(1);
      expect(axios.get.mock.calls[1][1].params).toEqual({
        patientUuid: "patient-uuid",
        orderTypeUuid: "lab-uuid",
        concept: CONCEPT,
        includeObs: true,
        numberOfVisits: 1,
      });
    });

    it("returns no rows when the order type does not exist", async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      expect(await fetchLabOrderRows({ patientUuid: "p", config: buildConfig() })).toEqual([]);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("formatLabelName", () => {
    it("formats as FAMILY, Given M.", () => {
      expect(formatLabelName({ givenName: "Palesa", middleName: "mpho", familyName: "Motsamai" })).toBe(
        "MOTSAMAI, Palesa M."
      );
    });

    it("handles missing parts", () => {
      expect(formatLabelName({ givenName: "Palesa" })).toBe("Palesa");
      expect(formatLabelName({ familyName: "Motsamai" })).toBe("MOTSAMAI");
      expect(formatLabelName({ name: "Palesa Motsamai" })).toBe("Palesa Motsamai");
    });
  });

  describe("formatLabelDate", () => {
    it("formats dates without time", () => {
      expect(formatLabelDate("2023-11-28T13:37:31")).toBe("28 Nov 2023");
      expect(formatLabelDate(undefined)).toBe("");
    });
  });
});
