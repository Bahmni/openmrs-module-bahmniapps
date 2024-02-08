import React from "react";
import { render, fireEvent } from "@testing-library/react";
import PatientListTitle from "./PatientListTitle";
import { getPatientIPDDashboardUrl } from "../../utils/providerNotifications/ProviderNotificationUtils";

const mockWindowOpen = jest.fn();
global.window.open = mockWindowOpen;

jest.mock("../../utils/providerNotifications/ProviderNotificationUtils", () => ({
  getPatientIPDDashboardUrl: jest.fn(),
}));

describe("PatientListTitle Component", () => {

  beforeEach(()=>{
    jest.clearAllMocks();
  })

  const props = {
    noOfDrugs: 3,
    identifier: "PID123",
    name: "John Doe",
    age: 30,
    gender: "M",
    patientUuid: "patient123",
    visitUuid: "visit123",
    openedWindow: null,
    setOpenedWindow: jest.fn(),
  };

  it("should render correctly", () => {
    const { queryByText } = render(<PatientListTitle {...props} />);
    expect(queryByText(`(${props.identifier})`)).toBeTruthy();
    expect(queryByText(`${props.name} - Male, ${props.age}`)).toBeTruthy();
  });

  it("should render the warning icon and number of drugs", () => {
    const { queryByText } = render(<PatientListTitle {...props} />);
    expect(queryByText(props.noOfDrugs.toString())).toBeTruthy();
  });

  it("should call handleOpenWindow on patient ID click", () => {
    const { queryByText } = render(<PatientListTitle {...props} />);
    const patientIdLink = queryByText(`(${props.identifier})`);
    fireEvent.click(patientIdLink);
    expect(props.setOpenedWindow).toHaveBeenCalled();
  });

  it("should call window.open with correct URL when handleOpenWindow is called", () => {
    getPatientIPDDashboardUrl.mockReturnValueOnce("http://example.com");
    const { queryByText } = render(<PatientListTitle {...props} />);
    const patientIdLink = queryByText(`(${props.identifier})`);
    fireEvent.click(patientIdLink);
    expect(mockWindowOpen).toHaveBeenCalledWith("http://example.com", "_blank");
  });

  it("should call openedWindow.location.href when handleOpenWindow is called with opened window", () => {
    const mockWindow = { location: { href: "" }, closed: false };
    const { queryByText } = render(<PatientListTitle {...props} openedWindow={mockWindow} />);
    const mockUrl = "http://example.com";
    getPatientIPDDashboardUrl.mockReturnValueOnce(mockUrl);
    const patientIdLink = queryByText(`(${props.identifier})`);
    fireEvent.click(patientIdLink);
    expect(mockWindow.location.href).toBe(mockUrl);
  });
});
