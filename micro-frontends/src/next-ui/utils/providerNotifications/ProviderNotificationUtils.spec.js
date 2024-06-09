import axios from "axios";
import {
  getEmergencyDrugAcknowledgements,
  sortMedicationList,
  acknowledgeEmergencyMedication,
  getProvider,
  groupByIdentifier,
  getPatientIPDDashboardUrl,
} from "./ProviderNotificationUtils";

jest.mock("axios");

describe("getEmergencyDrugAcknowledgements", () => {
  const locationUuid = "testLocation";
  const property = "testProperty";
  const providerUuid = "testProvider";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return data when API call is successful", async () => {
    const mockResponseData = [{ drug: "Drug1" }, { drug: "Drug2" }];
    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const result = await getEmergencyDrugAcknowledgements(locationUuid, property, providerUuid);

    expect(result).toEqual(mockResponseData);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should return an empty array when API call is not successful", async () => {
    axios.get.mockResolvedValueOnce({ status: 400, data: "" });

    const result = await getEmergencyDrugAcknowledgements(locationUuid, property, providerUuid);
    
    expect(result).toEqual([]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should log an error when API call fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const errorMessage = "API Error";

    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    await getEmergencyDrugAcknowledgements(locationUuid, property, providerUuid);

    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));
    expect(axios.get).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });
});

describe("sortMedicationList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly sort medication list", () => {
    const medicationList = [
      [{ administered_date_time: [2024, 2, 7, 12, 30, 0] }, { administered_date_time: [2024, 2, 7, 11, 0, 0] }],
      [{ administered_date_time: [2024, 2, 6, 10, 0, 0] }],
    ];

    const expectedSortedMedicationList = [
      [{ administered_date_time: [2024, 2, 6, 10, 0, 0] }],
      [{ administered_date_time: [2024, 2, 7, 11, 0, 0] }, { administered_date_time: [2024, 2, 7, 12, 30, 0] }],
    ];

    const sortedMedicationList = sortMedicationList(medicationList);

    expect(sortedMedicationList).toEqual(expectedSortedMedicationList);
  });
});

describe("acknowledgeEmergencyMedication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return success message when API call is successful", async () => {
    const emergencyMedication = { medication: "Med1" };
    const medicationAdministrationUuid = "testUuid";
    const mockResponse = { status: 200, data: { success: true } };

    axios.put.mockResolvedValueOnce(mockResponse);

    const result = await acknowledgeEmergencyMedication(emergencyMedication, medicationAdministrationUuid);

    expect(result).toEqual({ success: true, message: 'Emergency Medication Acknowledged Successfully' });
    expect(axios.put).toHaveBeenCalledTimes(1);
  });

  it("should return error message when API call is not successful", async () => {
    const emergencyMedication = { medication: "Med1" };
    const medicationAdministrationUuid = "testUuid";
    const mockResponse = { status: 400, data: { error: { message: 'Error Message' } } };

    axios.put.mockResolvedValueOnce(mockResponse);

    const result = await acknowledgeEmergencyMedication(emergencyMedication, medicationAdministrationUuid);

    expect(result).toEqual({ success: false, message: 'Error: Error Message' });
    expect(axios.put).toHaveBeenCalledTimes(1);
  });

  it("should return error message when API call fails", async () => {
    const emergencyMedication = { medication: "Med1" };
    const medicationAdministrationUuid = "testUuid";
    const errorMessage = "API Error";

    axios.put.mockRejectedValueOnce(new Error(errorMessage));

    const result = await acknowledgeEmergencyMedication(emergencyMedication, medicationAdministrationUuid);

    expect(result).toEqual({ success: false, message: `Error: Error: ${errorMessage}` });
    expect(axios.put).toHaveBeenCalledTimes(1);
  });
});

describe("getProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return data when API call is successful", async () => {
    const mockResponseData = { provider: "Provider1" };

    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const result = await getProvider();

    expect(result).toEqual(mockResponseData);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when API call is not successful", async () => {
    axios.get.mockResolvedValueOnce({ status: 400, data: "" });

    const result = await getProvider();

    expect(result).toEqual([]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should log an error when API call fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const errorMessage = "API Error";

    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    await getProvider();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));
    expect(axios.get).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });
});

describe("groupByIdentifier", () => {
  it("should group data by the given identifier", () => {
    const data = [
      { identifier: 'ID1', value: 'Value1' },
      { identifier: 'ID2', value: 'Value2' },
      { identifier: 'ID1', value: 'Value3' },
    ];

    const expectedGroupedData = {
      ID1: [
        { identifier: 'ID1', value: 'Value1' },
        { identifier: 'ID1', value: 'Value3' },
      ],
      ID2: [{ identifier: 'ID2', value: 'Value2' }],
    };

    const result = groupByIdentifier(data, 'identifier');

    expect(result).toEqual(expectedGroupedData);
  });
});

describe("getPatientIPDDashboardUrl", () => {
  it("should return the correct IPD dashboard URL", () => {
    const patientUuid = 'patient123';
    const visitUuid = 'visit123';

    const expectedUrl = `/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard/visit/ipd/${visitUuid}?source=clinical`;

    const result = getPatientIPDDashboardUrl(patientUuid, visitUuid);

    expect(result).toBe(expectedUrl);
  });
});
