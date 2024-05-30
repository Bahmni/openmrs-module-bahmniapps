import axios from "axios";
import {
  getEmergencyDrugAcknowledgements,
  sortMedicationList,
  updateEmergencyMedication,
  getProvider,
} from "./ProviderNotificationUtils";

jest.mock("axios");

describe("getEmergencyDrugAcknowledgements", () => {

  beforeEach(()=>{
    jest.clearAllMocks();
  })

  it("should return data when API call is successful", async () => {
    const locationUuid = "testLocation";
    const property = "testProperty";
    const providerUuid = "testProvider";

    const mockResponseData = [{ drug: "Drug1" }, { drug: "Drug2" }];

    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const result = await getEmergencyDrugAcknowledgements(
      locationUuid,
      property,
      providerUuid
    );

    expect(result).toEqual(mockResponseData);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should return console error when API call fails", async () => {
    const locationUuid = "testLocation";
    const property = "testProperty";
    const providerUuid = "testProvider";
    const errorMessage = "API Error";

    const consoleErrorSpy = jest.spyOn(console, "error");
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    await getEmergencyDrugAcknowledgements(
      locationUuid,
      property,
      providerUuid
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});

describe("sortMedicationList", () => {
  beforeEach(()=>{
    jest.clearAllMocks();
  })
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

describe("updateEmergencyMedication", () => {
  beforeEach(()=>{
    jest.clearAllMocks();
  })
  it("should return data when API call is successful", async () => {
    const emergencyMedication = { medication: "Med1" };
    const medicationAdministrationUuid = "testUuid";

    const mockResponseData = { success: true };

    axios.put.mockResolvedValueOnce({ data: mockResponseData });

    const result = await updateEmergencyMedication(
      emergencyMedication,
      medicationAdministrationUuid
    );

    expect(result.data).toEqual(mockResponseData);
    expect(axios.put).toHaveBeenCalledTimes(1);
  });

  it("should return console error when API call fails", async () => {
    const emergencyMedication = { medication: "Med1" };
    const medicationAdministrationUuid = "testUuid";
    const errorMessage = "API Error";

    const consoleErrorSpy = jest.spyOn(console, "error");
    axios.put.mockRejectedValueOnce(new Error(errorMessage));
    await updateEmergencyMedication(
      emergencyMedication,
      medicationAdministrationUuid
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));
    expect(axios.put).toHaveBeenCalledTimes(1);
  });
});

describe("getProvider", () => {
  beforeEach(()=>{
    jest.clearAllMocks();
  })
  it("should return data when API call is successful", async () => {
    const mockResponseData = [{ provider: "Provider1" }];

    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const result = await getProvider();

    expect(result).toEqual(mockResponseData);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when API call fails", async () => {
    const errorMessage = "API Error";

    const consoleErrorSpy = jest.spyOn(console, "error");
    axios.get.mockRejectedValueOnce(new Error("API Error"));
    await getProvider();

    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
