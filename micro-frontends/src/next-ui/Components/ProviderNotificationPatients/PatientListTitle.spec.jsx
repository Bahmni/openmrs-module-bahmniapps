import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import PatientListTitle from "./PatientListTitle";

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
    age: "30",
    gender: "M",
    patientUuid: "patient123",
    visitUuid: "visit123",
    openedWindow: null,
    setOpenedWindow: jest.fn(),
  };

  it("should render correctly", () => {
    const { queryByText } = render(<PatientListTitle {...props} />);
    expect(queryByText(`(${props.identifier})`)).toBeTruthy();
  });

  it("should render the warning icon and number of drugs", () => {
    const { queryByText } = render(<PatientListTitle {...props} />);
    expect(queryByText(props.noOfDrugs.toString())).toBeTruthy();
  });
});
