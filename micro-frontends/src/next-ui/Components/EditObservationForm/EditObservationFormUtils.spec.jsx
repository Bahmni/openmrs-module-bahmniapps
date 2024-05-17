import axios from "axios";
import { getFormDetail, getFormTranslations, getAllForms, getFormByFormName, getFormNameAndVersion } from "./EditObservationFormUtils";
import { GET_FORMS_BASE_URL, FORM_TRANSLATIONS_URL, GET_ALL_FORMS_BASE_URL } from "../../constants";

jest.mock("axios");

describe("getFormDetail", () => {
  const formUuid = "formUuid";
  const mockResponse = { data: "form detail data" };

  it("should return form detail when status is 200", async () => {
    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponse });

    const result = await getFormDetail(formUuid);

    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith(GET_FORMS_BASE_URL.replace("{formUuid}", formUuid), { params: { v: "custom:(resources:(value))" } });
  });

  it("should return empty array when status is not 200", async () => {
    axios.get.mockResolvedValueOnce({ status: 404 });

    const result = await getFormDetail(formUuid);

    expect(result).toEqual([]);
    expect(axios.get).toHaveBeenCalledWith(GET_FORMS_BASE_URL.replace("{formUuid}", formUuid), { params: { v: "custom:(resources:(value))" } });
  });

  it("should handle error when fetching form detail", async () => {
    const errorMessage = "Failed to fetch form detail";
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    try {
        await getFormDetail(formUuid);
    } catch (error) {
        expect(error.message).toBe(errorMessage);
    }
    expect(axios.get).toHaveBeenCalledWith(GET_FORMS_BASE_URL.replace("{formUuid}", formUuid), { params: { v: "custom:(resources:(value))" } });
  });
});

describe("getFormTranslations", () => {
  const form = { formName: "formName", formVersion: "formVersion" };
  const url = "formTranslationsUrl";
  const mockResponse = { data: "form translations data" };

  it("should fetch form translations successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: mockResponse });

    const result = await getFormTranslations(url, form);

    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith(url);
  });

  it("should fetch form translations from default URL when URL is not provided", async () => {
    const defaultUrl = FORM_TRANSLATIONS_URL;
    axios.get.mockResolvedValueOnce({ data: [mockResponse] });

    const result = await getFormTranslations(undefined, form);

    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith(defaultUrl, { params: form });
  });

  it("should handle error when fetching form translations", async () => {
    const errorMessage = "Failed to fetch form translations";
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    try {
        await getFormTranslations(url, form);
    } catch (error) {
        expect(error.message).toBe(errorMessage);
    }
    expect(axios.get).toHaveBeenCalledWith(url);
  });
});

describe("getAllForms", () => {
  const mockResponse = { data: "all forms data" };

  it("should return all forms when status is 200", async () => {
    axios.get.mockResolvedValueOnce({ status: 200, data: mockResponse });

    const result = await getAllForms();

    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith(GET_ALL_FORMS_BASE_URL, { params: { v: "custom:(version,name,uuid)" } });
  });

  it("should return empty array when status is not 200", async () => {
    axios.get.mockResolvedValueOnce({ status: 404 });

    const result = await getAllForms();

    expect(result).toEqual([]);
    expect(axios.get).toHaveBeenCalledWith(GET_ALL_FORMS_BASE_URL, { params: { v: "custom:(version,name,uuid)" } });
  });

  it("should handle error when fetching all forms", async () => {
    const errorMessage = "Failed to fetch all forms";
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    try {
        await getAllForms();
    } catch (error) {
        expect(error.message).toBe(errorMessage);
    }
    expect(axios.get).toHaveBeenCalledWith(GET_ALL_FORMS_BASE_URL, { params: { v: "custom:(version,name,uuid)" } });
  });
});

describe("getFormByFormName", () => {
  const formList = [{ name: "formName", version: "formVersion" }];
  const formName = "formName";
  const formVersion = "formVersion";

  it("should return the correct form when found", () => {
    const result = getFormByFormName(formList, formName, formVersion);
    expect(result).toEqual({ name: formName, version: formVersion });
  });

  it("should return undefined when the form is not found", () => {
    const result = getFormByFormName(formList, "nonexistentForm", formVersion);
    expect(result).toBeUndefined();
  });
});

describe("getFormNameAndVersion", () => {
  const path = "formName.formVersion/other/paths";

  it("should extract the form name and version from the path", () => {
    const result = getFormNameAndVersion(path);
    expect(result).toEqual({ formName: "formName", formVersion: "formVersion" });
  });
});
