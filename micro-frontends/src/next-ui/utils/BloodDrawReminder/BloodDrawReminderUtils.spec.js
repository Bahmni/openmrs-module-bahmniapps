import axios from "axios";
import moment from "moment";
import {
  buildConfig,
  fetchLastDrawDate,
  getBloodDrawStatus,
  isDismissed,
  markDismissed,
} from "./BloodDrawReminderUtils";

jest.mock("axios");

describe("BloodDrawReminderUtils", () => {
  afterEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  describe("buildConfig", () => {
    it("uses CD4 Date Drawn and a 6 month interval by default", () => {
      expect(buildConfig()).toEqual({ enabled: true, conceptName: "CD4 Date Drawn", intervalMonths: 6 });
    });

    it("lets config override defaults", () => {
      expect(buildConfig({ intervalMonths: 3 }).intervalMonths).toBe(3);
    });
  });

  describe("fetchLastDrawDate", () => {
    it("queries the latest observation for the concept", async () => {
      axios.get.mockResolvedValue({ data: [{ value: "2026-01-15" }] });
      const date = await fetchLastDrawDate({ patientUuid: "p1", conceptName: "CD4 Date Drawn" });

      expect(date.format("YYYY-MM-DD")).toBe("2026-01-15");
      expect(axios.get.mock.calls[0][1].params).toEqual({
        patientUuid: "p1",
        concept: "CD4 Date Drawn",
        scope: "latest",
      });
    });

    it("returns the most recent valid date and ignores voided/empty values", async () => {
      axios.get.mockResolvedValue({
        data: [
          { value: "2025-12-01" },
          { value: "2026-03-01", voided: true },
          { value: null },
          { value: "2026-02-10" },
        ],
      });
      const date = await fetchLastDrawDate({ patientUuid: "p1", conceptName: "CD4 Date Drawn" });
      expect(date.format("YYYY-MM-DD")).toBe("2026-02-10");
    });

    it("returns null when no draw date was recorded", async () => {
      axios.get.mockResolvedValue({ data: [] });
      expect(await fetchLastDrawDate({ patientUuid: "p1", conceptName: "x" })).toBeNull();
    });
  });

  describe("getBloodDrawStatus", () => {
    const today = moment("2026-10-31");

    it("returns null when there is no draw date", () => {
      expect(getBloodDrawStatus(null, 6, today)).toBeNull();
    });

    it("returns null when the next draw is not yet due", () => {
      expect(getBloodDrawStatus(moment("2026-05-01"), 6, today)).toBeNull();
    });

    it("flags the patient on the due date", () => {
      const status = getBloodDrawStatus(moment("2026-04-30"), 6, today);
      expect(status.dueDate.format("YYYY-MM-DD")).toBe("2026-10-30");
      expect(status.overdueDays).toBe(1);

      const dueToday = getBloodDrawStatus(moment("2026-04-30"), 6, moment("2026-10-30"));
      expect(dueToday.overdueDays).toBe(0);
    });

    it("reports how many days overdue", () => {
      const status = getBloodDrawStatus(moment("2026-01-31"), 6, today);
      expect(status.dueDate.format("YYYY-MM-DD")).toBe("2026-07-31");
      expect(status.overdueDays).toBe(92);
    });
  });

  describe("dismissal", () => {
    it("is remembered per patient and draw date", () => {
      const drawn = moment("2026-01-31");
      expect(isDismissed("p1", drawn)).toBe(false);
      markDismissed("p1", drawn);
      expect(isDismissed("p1", drawn)).toBe(true);
      expect(isDismissed("p2", drawn)).toBe(false);
      expect(isDismissed("p1", moment("2026-02-01"))).toBe(false);
    });
  });
});
