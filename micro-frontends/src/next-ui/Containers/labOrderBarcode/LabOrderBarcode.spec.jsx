import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LabOrderBarcode } from "./LabOrderBarcode";

const mockFetchLabOrderRows = jest.fn();
const mockPrintLabel = jest.fn();

jest.mock("../../utils/LabOrderBarcode/LabOrderBarcodeUtils", () => ({
  ...jest.requireActual("../../utils/LabOrderBarcode/LabOrderBarcodeUtils"),
  fetchLabOrderRows: (...args) => mockFetchLabOrderRows(...args),
}));

jest.mock("../../utils/LabOrderBarcode/labelPrinter", () => ({
  ...jest.requireActual("../../utils/LabOrderBarcode/labelPrinter"),
  printLabel: (...args) => mockPrintLabel(...args),
}));

/* eslint-disable react/prop-types */
jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-intl", () => ({
  FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
}));
/* eslint-enable react/prop-types */

const hostData = {
  patient: {
    uuid: "patient-uuid",
    givenName: "Palesa",
    middleName: "Mpho",
    familyName: "Motsamai",
    identifier: "LS1234567",
  },
  facilityName: "Leseli Mediclinic",
  title: "Lab Order Barcodes",
  config: { numberOfVisits: 2 },
};

const rows = [
  { orderUuid: "o2", labOrderNumber: "EDAX000465", testName: "HIV Viral Load", orderDate: "2023-11-28T13:37:31" },
  { orderUuid: "o1", labOrderNumber: "EDAX000458", testName: "GeneXpert", orderDate: "2023-11-27T11:22:45" },
];

describe("LabOrderBarcode", () => {
  afterEach(() => jest.clearAllMocks());

  it("renders a row with a barcode for each lab order number", async () => {
    mockFetchLabOrderRows.mockResolvedValue(rows);
    render(<LabOrderBarcode hostData={hostData} />);

    await waitFor(() => expect(screen.getByText("EDAX000465")).not.toBeNull());
    expect(screen.getByText("Lab Order Barcodes")).not.toBeNull();
    expect(screen.getByText("EDAX000458")).not.toBeNull();
    expect(screen.getByText("28 Nov 2023")).not.toBeNull();
    expect(screen.getAllByTestId("lab-order-barcode-svg")[0].querySelector("rect")).not.toBeNull();
    expect(mockFetchLabOrderRows.mock.calls[0][0]).toEqual({
      patientUuid: "patient-uuid",
      config: expect.objectContaining({ numberOfVisits: 2, conceptName: "eRegister Lab Order Number" }),
    });
  });

  it("renders nothing when there are no lab order numbers", async () => {
    mockFetchLabOrderRows.mockResolvedValue([]);
    const { container } = render(<LabOrderBarcode hostData={hostData} />);

    await waitFor(() => expect(mockFetchLabOrderRows).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when fetching fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockFetchLabOrderRows.mockRejectedValue(new Error("network"));
    const { container } = render(<LabOrderBarcode hostData={hostData} />);

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
    console.error.mockRestore();
  });

  it("prints a label with the patient, facility and order details", async () => {
    mockFetchLabOrderRows.mockResolvedValue(rows);
    render(<LabOrderBarcode hostData={hostData} />);

    await waitFor(() => expect(screen.getAllByText("Print label")).toHaveLength(2));
    fireEvent.click(screen.getAllByText("Print label")[0]);

    expect(mockPrintLabel).toHaveBeenCalledWith({
      facilityName: "Leseli Mediclinic",
      patientName: "MOTSAMAI, Palesa M.",
      patientIdentifier: "LS1234567",
      labOrderNumber: "EDAX000465",
      testName: "HIV Viral Load",
      orderDate: "28 Nov 2023",
      width: "50mm",
      height: "25mm",
      showFacility: true,
    });
  });
});
