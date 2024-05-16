import axios from "axios";
import { fetchFormData, getLatestPublishedForms } from "./FormUtils";
import { FORM_BASE_URL, LATEST_PUBLISHED_FORMS_URL } from "../../constants";

jest.mock("axios");

describe("fetchFormData", () => {
  it("should fetch form data for a patient with specified number of visits", async () => {
    const patientUuid = "patient-uuid";
    const numberOfVisits = 3;
    const mockResponseData = [{"formType": "v2", "formName": "Test Form-1"}, {"formType": "v2", "formName": "Test Form-2"}];
    const expectedUrl = FORM_BASE_URL.replace("{patientUuid}", patientUuid);
    const expectedParams = { formType: "v2", numberOfVisits: 3 };

    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const formData = await fetchFormData(patientUuid, numberOfVisits);

    expect(axios.get).toHaveBeenCalledWith(expectedUrl, { params: expectedParams });
    expect(formData).toEqual(mockResponseData);
  });

  it("should fetch form data for a patient without specifying number of visits", async () => {
    const patientUuid = "patient-uuid";
    const mockResponseData = [{"formType": "v2", "formName": "Test Form-1"}, {"formType": "v2", "formName": "Test Form-2"}];
    const expectedUrl = FORM_BASE_URL.replace("{patientUuid}", patientUuid);
    const expectedParams = { formType: "v2" };

    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const formData = await fetchFormData(patientUuid);

    expect(axios.get).toHaveBeenCalledWith(expectedUrl, { params: expectedParams });
    expect(formData).toEqual(mockResponseData);
  });

  it("should handle error when fetching form data", async () => {
    const patientUuid = "patient-uuid";
    const expectedUrl = FORM_BASE_URL.replace("{patientUuid}", patientUuid);
    const errorMessage = "Failed to fetch forms";

    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    try {
        const formData = await fetchFormData(patientUuid);
        expect(formData).toEqual(undefined);
    } catch (error) {
        expect(error.message).toBe(errorMessage);
    }

    expect(axios.get).toHaveBeenCalledWith(expectedUrl, { params: { formType: "v2" } });
  });
});

describe("getLatestPublishedForms", () => {
  it("should fetch latest published forms for an encounter when status is 200", async () => {
    const encounterUuid = "encounter-uuid";
    const mockResponseData = [{"id": 1, "name": "Test Form-1"}, {"id": 2, "name": "Test Form-2"}];
    const expectedParams = { encounterUuid };

    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const latestForms = await getLatestPublishedForms(encounterUuid);

    expect(axios.get).toHaveBeenCalledWith(LATEST_PUBLISHED_FORMS_URL, { params: expectedParams });
    expect(latestForms).toEqual(mockResponseData);
  });

  it("should return empty array for an encounter when status is not 200", async () => {
    const encounterUuid = "encounter-uuid";
    const mockResponseData = [{"id": 1, "name": "Test Form-1"}, {"id": 2, "name": "Test Form-2"}];
    const expectedParams = { encounterUuid };

    axios.get.mockResolvedValueOnce({ status: 404 });

    const latestForms = await getLatestPublishedForms(encounterUuid);

    expect(axios.get).toHaveBeenCalledWith(LATEST_PUBLISHED_FORMS_URL, { params: expectedParams });
    expect(latestForms).toEqual([]);
  });

  it("should handle error when fetching latest published forms", async () => {
    const encounterUuid = "encounter-uuid";
    const errorMessage = "Failed to fetch forms";

    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    const latestForms = await getLatestPublishedForms(encounterUuid);

    expect(axios.get).toHaveBeenCalledWith(LATEST_PUBLISHED_FORMS_URL, { params: { encounterUuid } });
    expect(latestForms.message).toEqual(errorMessage);
  });
});
