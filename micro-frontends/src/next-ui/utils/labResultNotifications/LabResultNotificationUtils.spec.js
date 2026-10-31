import axios from "axios";
import {
  READ_STATE_PROPERTY,
  fetchLabResults,
  fetchReadState,
  formatReceivedAt,
  getClinicalDashboardUrl,
  initialReadState,
  isUnread,
  markAllRead,
  markRead,
  parseReadState,
  saveReadState,
  whenPageIdle,
} from "./LabResultNotificationUtils";

jest.mock("axios");

const result = (orderUuid, receivedAt) => ({
  order_uuid: orderUuid,
  patient_uuid: `patient-${orderUuid}`,
  received_at: receivedAt,
});

const results = [
  result("order-2", "2026-10-30 09:15:00"),
  result("order-1", "2026-10-20 14:00:00"),
];

describe("LabResultNotificationUtils", () => {
  afterEach(() => jest.resetAllMocks());

  describe("fetchLabResults", () => {
    it("runs the lab result notifications sql search", async () => {
      axios.get.mockResolvedValue({ data: results });

      expect(await fetchLabResults()).toEqual(results);
      expect(axios.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/bahmnicore/sql", {
        params: { q: "emrapi.sqlSearch.labResultNotifications" },
        withCredentials: true,
      });
    });

    it("returns an empty list when the response is not a list", async () => {
      axios.get.mockResolvedValue({ data: { error: "nope" } });

      expect(await fetchLabResults()).toEqual([]);
    });
  });

  describe("parseReadState", () => {
    it("returns null when the property is missing or invalid", () => {
      expect(parseReadState(undefined)).toBeNull();
      expect(parseReadState("not json")).toBeNull();
      expect(parseReadState(JSON.stringify({ read: {} }))).toBeNull();
    });

    it("parses a saved state, defaulting read to empty", () => {
      expect(parseReadState(JSON.stringify({ cutoff: "" }))).toEqual({ cutoff: "", read: {} });
      expect(
        parseReadState(JSON.stringify({ cutoff: "2026-10-01 00:00:00", read: { a: "x" } }))
      ).toEqual({ cutoff: "2026-10-01 00:00:00", read: { a: "x" } });
    });
  });

  describe("initialReadState", () => {
    it("sets the cutoff to the newest result so existing results start as read", () => {
      const state = initialReadState(results);

      expect(state).toEqual({ cutoff: "2026-10-30 09:15:00", read: {} });
      results.forEach((r) => expect(isUnread(r, state)).toBe(false));
    });

    it("uses an empty cutoff when there are no results, so the next one is unread", () => {
      const state = initialReadState([]);

      expect(state.cutoff).toBe("");
      expect(isUnread(result("new", "2026-11-01 08:00:00"), state)).toBe(true);
    });
  });

  describe("isUnread", () => {
    const state = { cutoff: "2026-10-25 00:00:00", read: {} };

    it("is false without a read state", () => {
      expect(isUnread(results[0], null)).toBe(false);
    });

    it("treats results after the cutoff as unread until read", () => {
      expect(isUnread(results[0], state)).toBe(true);
      expect(isUnread(results[1], state)).toBe(false);
    });

    it("becomes unread again when new values arrive after it was read", () => {
      const read = { cutoff: "", read: { "order-2": "2026-10-30 09:15:00" } };

      expect(isUnread(results[0], read)).toBe(false);
      expect(isUnread(result("order-2", "2026-10-31 10:00:00"), read)).toBe(true);
    });
  });

  describe("markRead", () => {
    it("records the result's received time and drops orders no longer listed", () => {
      const state = { cutoff: "", read: { "old-order": "2026-09-01 00:00:00" } };

      expect(markRead(state, results[0], results)).toEqual({
        cutoff: "",
        read: { "order-2": "2026-10-30 09:15:00" },
      });
    });
  });

  describe("markAllRead", () => {
    it("marks every listed result as read", () => {
      const state = markAllRead({ cutoff: "", read: {} }, results);

      results.forEach((r) => expect(isUnread(r, state)).toBe(false));
    });
  });

  describe("read state persistence", () => {
    it("reads the state from the user's properties", async () => {
      axios.get.mockResolvedValue({
        data: { userProperties: { [READ_STATE_PROPERTY]: JSON.stringify({ cutoff: "" }) } },
      });

      expect(await fetchReadState("user-uuid")).toEqual({ cutoff: "", read: {} });
      expect(axios.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/user/user-uuid", {
        params: { v: "custom:(uuid,userProperties)" },
        withCredentials: true,
      });
    });

    it("keeps the user's other properties when saving", async () => {
      axios.get.mockResolvedValue({
        data: { userProperties: { defaultLocale: "en", recentlyViewedPatients: "[]" } },
      });
      axios.post.mockResolvedValue({});
      const state = { cutoff: "", read: {} };

      await saveReadState("user-uuid", state);

      expect(axios.post).toHaveBeenCalledWith(
        "/openmrs/ws/rest/v1/user/user-uuid",
        {
          userProperties: {
            defaultLocale: "en",
            recentlyViewedPatients: "[]",
            [READ_STATE_PROPERTY]: JSON.stringify(state),
          },
        },
        { withCredentials: true }
      );
    });
  });

  it("builds the clinical dashboard url", () => {
    expect(getClinicalDashboardUrl("p-1")).toBe(
      "/bahmni/clinical/index.html#/default/patient/p-1/dashboard"
    );
  });

  it("formats the received time", () => {
    expect(formatReceivedAt("2026-10-30 09:15:00")).toBe("30 Oct 2026 09:15 am");
    expect(formatReceivedAt(undefined)).toBe("");
  });

  describe("whenPageIdle", () => {
    const setReadyState = (state) => {
      Object.defineProperty(document, "readyState", { configurable: true, get: () => state });
    };

    afterEach(() => {
      setReadyState("complete");
      delete window.requestIdleCallback;
      delete window.cancelIdleCallback;
      jest.useRealTimers();
    });

    it("waits for the page load event before running", () => {
      jest.useFakeTimers();
      setReadyState("loading");
      const callback = jest.fn();

      whenPageIdle(callback);
      jest.runAllTimers();
      expect(callback).not.toHaveBeenCalled();

      window.dispatchEvent(new Event("load"));
      jest.runAllTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("runs when the browser is idle, with a timeout so it cannot wait forever", () => {
      window.requestIdleCallback = jest.fn(() => 7);
      const callback = jest.fn();

      whenPageIdle(callback, 1500);

      expect(window.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 1500 });
      expect(callback).not.toHaveBeenCalled();
      window.requestIdleCallback.mock.calls[0][0]();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("does not run once cancelled", () => {
      window.requestIdleCallback = jest.fn(() => 7);
      window.cancelIdleCallback = jest.fn();
      const callback = jest.fn();

      const cancel = whenPageIdle(callback);
      cancel();
      window.requestIdleCallback.mock.calls[0][0]();

      expect(window.cancelIdleCallback).toHaveBeenCalledWith(7);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
