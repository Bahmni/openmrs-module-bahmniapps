import React from "react";
import { render } from "@testing-library/react";
import PatientListTitle from "./PatientListTitle";
import { formatGender } from "../../utils/utils";
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
    age: "30",
    gender: "M",
    patientUuid: "patient123",
    visitUuid: "visit123",
    openedWindow: null,
    setOpenedWindow: jest.fn(),
  };

  it('should render without crashing', () => {
    const {container} = render(<PatientListTitle {...props} />);
    expect(container).toMatchSnapshot();
  })

  it('renders the correct number of drugs', () => {
    const { getByText } = render(<PatientListTitle {...props} />);
    expect(getByText(`${props.noOfDrugs}`)).toBeTruthy();
  });

  it('renders the patient identifier within a Link', () => {
    const expectedUrl = 'http://example.com/dashboard';
    getPatientIPDDashboardUrl.mockReturnValue(expectedUrl);
    const { getByText } = render(<PatientListTitle {...props} />);
    const link = getByText(`(${props.identifier})`);
    expect(link.href).toBe(expectedUrl);
    expect(link.textContent).toBe(`(${props.identifier})`);
  });

  it('renders the patient name, gender, and age', () => {
    const { getByText } = render(<PatientListTitle {...props} />);
    const expectedText = `${props.name} - ${formatGender(props.gender)}, ${props.age}`;
    expect(getByText(expectedText)).toBeTruthy();
  });

  it('passes prop types correctly', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const invalidProps = {
      noOfDrugs: '3',
    };
    render(<PatientListTitle {...invalidProps} />);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
