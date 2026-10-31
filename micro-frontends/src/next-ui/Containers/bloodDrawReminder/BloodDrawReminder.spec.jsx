import React from "react";
import moment from "moment";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BloodDrawReminder } from "./BloodDrawReminder";

const mockFetchLastDrawDate = jest.fn();

jest.mock("../../utils/BloodDrawReminder/BloodDrawReminderUtils", () => ({
  ...jest.requireActual("../../utils/BloodDrawReminder/BloodDrawReminderUtils"),
  fetchLastDrawDate: (...args) => mockFetchLastDrawDate(...args),
}));

/* eslint-disable react/prop-types */
jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-intl", () => ({
  FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
}));
/* eslint-enable react/prop-types */

const hostData = { patientUuid: "patient-uuid", config: {} };

describe("BloodDrawReminder", () => {
  afterEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("shows a popup when the last draw was more than 6 months ago", async () => {
    mockFetchLastDrawDate.mockResolvedValue(moment().subtract(7, "months"));
    render(<BloodDrawReminder hostData={hostData} />);

    await waitFor(() => expect(screen.getByText("Blood Draw Due")).not.toBeNull());
    expect(screen.getByTestId("blood-draw-reminder-icon")).not.toBeNull();
    expect(screen.getByTestId("blood-draw-last-drawn").textContent).toBe(
      moment().subtract(7, "months").format("DD MMM YYYY")
    );
    expect(mockFetchLastDrawDate).toHaveBeenCalledWith({
      patientUuid: "patient-uuid",
      conceptName: "CD4 Date Drawn",
    });
  });

  it("does not show a popup when the patient is not yet due", async () => {
    mockFetchLastDrawDate.mockResolvedValue(moment().subtract(2, "months"));
    const { container } = render(<BloodDrawReminder hostData={hostData} />);

    await waitFor(() => expect(mockFetchLastDrawDate).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });

  it("does not show a popup when no draw date is recorded", async () => {
    mockFetchLastDrawDate.mockResolvedValue(null);
    const { container } = render(<BloodDrawReminder hostData={hostData} />);

    await waitFor(() => expect(mockFetchLastDrawDate).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });

  it("does nothing when disabled in config", () => {
    render(<BloodDrawReminder hostData={{ ...hostData, config: { enabled: false } }} />);
    expect(mockFetchLastDrawDate).not.toHaveBeenCalled();
  });

  it("stays dismissed for the session once closed", async () => {
    mockFetchLastDrawDate.mockResolvedValue(moment().subtract(7, "months"));
    const { unmount } = render(<BloodDrawReminder hostData={hostData} />);

    await waitFor(() => expect(screen.getByText("Blood Draw Due")).not.toBeNull());
    fireEvent.click(screen.getByText("OK"));
    expect(screen.queryByText("Blood Draw Due")).toBeNull();
    unmount();

    const { container } = render(<BloodDrawReminder hostData={hostData} />);
    await waitFor(() => expect(mockFetchLastDrawDate).toHaveBeenCalledTimes(2));
    expect(container.innerHTML).toBe("");
  });
});
