import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LabResultNotifications, POLL_INTERVAL_MS } from "./LabResultNotifications";

const mockFetchLabResults = jest.fn();
const mockFetchReadState = jest.fn();
const mockSaveReadState = jest.fn();

jest.mock("../../utils/labResultNotifications/LabResultNotificationUtils", () => ({
  ...jest.requireActual("../../utils/labResultNotifications/LabResultNotificationUtils"),
  fetchLabResults: (...args) => mockFetchLabResults(...args),
  fetchReadState: (...args) => mockFetchReadState(...args),
  saveReadState: (...args) => mockSaveReadState(...args),
}));

/* eslint-disable react/prop-types */
jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-intl", () => ({
  FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
  useIntl: () => ({
    formatMessage: ({ defaultMessage }, values) =>
      values && values.count !== undefined ? `${values.count} new results` : defaultMessage,
  }),
}));
/* eslint-enable react/prop-types */

const hostData = { userUuid: "user-uuid" };

const results = [
  {
    order_uuid: "order-2",
    patient_uuid: "patient-2",
    identifier: "B2148000133/23",
    patient_name: "MAMOTSAMAI SENGOATSI",
    test_name: "Viral Load",
    lab_order_number: "BDEP000650",
    received_at: "2026-10-30 09:15:00",
  },
  {
    order_uuid: "order-1",
    patient_uuid: "patient-1",
    identifier: "B2148000138/23",
    patient_name: "REITUMETSE LEBEA",
    test_name: "Viral Load",
    lab_order_number: "BDEP000649",
    received_at: "2026-10-20 14:00:00",
  },
];

const openBell = () => fireEvent.click(screen.getByRole("button", { name: "Lab results" }));

describe("LabResultNotifications", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    mockSaveReadState.mockResolvedValue();
    delete window.location;
    window.location = { assign: jest.fn() };
  });

  afterEach(() => {
    // Flush updates React queued on the fake clock, or they stall effects in later tests
    if (setTimeout.clock) {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    }
    jest.resetAllMocks();
    jest.useRealTimers();
    window.location = originalLocation;
  });

  it("renders nothing without a user", () => {
    const { container } = render(<LabResultNotifications hostData={{}} />);

    expect(container.firstChild).toBeNull();
  });

  it("shows the dot and count when there are unread results", async () => {
    mockFetchLabResults.mockResolvedValue(results);
    mockFetchReadState.mockResolvedValue({ cutoff: "2026-10-25 00:00:00", read: {} });
    render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() => expect(screen.getByTestId("lab-result-notifications-dot")).toBeTruthy());
    openBell();

    expect(screen.getByText("1 new results")).toBeTruthy();
    expect(screen.getByText("MAMOTSAMAI SENGOATSI (B2148000133/23)").closest("li").classList.contains("unread")).toBe(true);
    expect(screen.getByText("REITUMETSE LEBEA (B2148000138/23)").closest("li").classList.contains("unread")).toBe(false);
    expect(screen.getByText("Viral Load · BDEP000650")).toBeTruthy();
  });

  it("starts with everything read on the user's first load and saves that state", async () => {
    mockFetchLabResults.mockResolvedValue(results);
    mockFetchReadState.mockResolvedValue(null);
    render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() =>
      expect(mockSaveReadState).toHaveBeenCalledWith("user-uuid", {
        cutoff: "2026-10-30 09:15:00",
        read: {},
      })
    );
    expect(screen.queryByTestId("lab-result-notifications-dot")).toBeNull();
  });

  it("marks a result read and opens the patient's clinical dashboard", async () => {
    mockFetchLabResults.mockResolvedValue(results);
    mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
    render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() => expect(screen.getByTestId("lab-result-notifications-dot")).toBeTruthy());
    openBell();
    fireEvent.click(screen.getByText("MAMOTSAMAI SENGOATSI (B2148000133/23)"));

    await waitFor(() =>
      expect(window.location.assign).toHaveBeenCalledWith(
        "/bahmni/clinical/index.html#/default/patient/patient-2/dashboard"
      )
    );
    expect(mockSaveReadState).toHaveBeenCalledWith("user-uuid", {
      cutoff: "",
      read: { "order-2": "2026-10-30 09:15:00" },
    });
  });

  it("marks all results read", async () => {
    mockFetchLabResults.mockResolvedValue(results);
    mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
    render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() => expect(screen.getByTestId("lab-result-notifications-dot")).toBeTruthy());
    openBell();
    fireEvent.click(screen.getByText("Mark all as read"));

    await waitFor(() =>
      expect(screen.queryByTestId("lab-result-notifications-dot")).toBeNull()
    );
    expect(mockSaveReadState).toHaveBeenCalledWith("user-uuid", {
      cutoff: "",
      read: { "order-2": "2026-10-30 09:15:00", "order-1": "2026-10-20 14:00:00" },
    });
  });

  it("shows an empty message when there are no results", async () => {
    mockFetchLabResults.mockResolvedValue([]);
    mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
    render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() => expect(mockFetchLabResults).toHaveBeenCalled());
    openBell();

    expect(screen.getByText("No results in the last 30 days")).toBeTruthy();
  });

  it("holds the bell's space and makes no requests until the page is idle", async () => {
    jest.useFakeTimers();
    mockFetchLabResults.mockResolvedValue([]);
    mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
    const { container } = render(<LabResultNotifications hostData={hostData} />);

    expect(container.querySelector(".lab-result-notifications-placeholder")).toBeTruthy();
    expect(mockFetchLabResults).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(container.querySelector(".lab-result-notifications-placeholder")).toBeNull();
    expect(mockFetchLabResults).toHaveBeenCalledTimes(1);
  });

  describe("polling", () => {
    const setHidden = (hidden) => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    };

    const renderAndWaitForFirstCheck = async () => {
      jest.useFakeTimers();
      mockFetchLabResults.mockResolvedValue([]);
      mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
      render(<LabResultNotifications hostData={hostData} />);
      await act(async () => {
        jest.advanceTimersByTime(0);
      });
      expect(mockFetchLabResults).toHaveBeenCalledTimes(1);
    };

    afterEach(() => setHidden(false));

    it("checks for new results every 5 minutes", async () => {
      await renderAndWaitForFirstCheck();

      await act(async () => {
        jest.advanceTimersByTime(POLL_INTERVAL_MS);
      });

      expect(mockFetchLabResults).toHaveBeenCalledTimes(2);
    });

    it("skips checks while the tab is hidden and catches up when it is shown", async () => {
      await renderAndWaitForFirstCheck();
      setHidden(true);

      await act(async () => {
        jest.advanceTimersByTime(POLL_INTERVAL_MS);
      });
      expect(mockFetchLabResults).toHaveBeenCalledTimes(1);

      setHidden(false);
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(mockFetchLabResults).toHaveBeenCalledTimes(2);
    });

    it("does not check again on return when the last check is recent", async () => {
      await renderAndWaitForFirstCheck();

      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });

      expect(mockFetchLabResults).toHaveBeenCalledTimes(1);
    });
  });

  it("closes the panel on Escape", async () => {
    mockFetchLabResults.mockResolvedValue([]);
    mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
    render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() => expect(mockFetchLabResults).toHaveBeenCalled());
    openBell();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("No results in the last 30 days")).toBeNull();
  });

  it("fixes the panel just below the bell so the header cannot clip it", async () => {
    mockFetchLabResults.mockResolvedValue([]);
    mockFetchReadState.mockResolvedValue({ cutoff: "", read: {} });
    const { container } = render(<LabResultNotifications hostData={hostData} />);

    await waitFor(() => expect(mockFetchLabResults).toHaveBeenCalled());
    container.querySelector(".lab-result-notifications").getBoundingClientRect = () => ({
      bottom: 52,
      right: document.documentElement.clientWidth - 120,
    });
    openBell();

    const panel = container.querySelector(".lab-result-notifications-panel");
    expect(panel.style.top).toBe("52px");
    expect(panel.style.right).toBe("120px");
  });
});
