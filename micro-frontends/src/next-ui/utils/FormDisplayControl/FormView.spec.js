import axios from "axios";
import { findByEncounterUuid, buildFormMap, subLabels, isAbnormal, memberTypes, formatDate, getValue } from "./FormView.js";
import { ENCOUNTER_BASE_URL } from "../../constants";

jest.mock("axios");

const mockEncounterData = [
    { 
        encounterUuid: "123", 
        observations: [
            { 
                formFieldPath: "Form1.1", 
                concept: {
                    name: "Test Concept-1"
                }
            },
            { 
                formFieldPath: "Form2.1", 
                concept: {
                    name: "Test Concept-2"
                }
            }
        ]
    }];

describe("findByEncounterUuid", () => {
  it("should return response data when status is 200", async () => {
    const encounterUuid = '123';
    const responseData = { mockEncounterData };
    const apiURL = ENCOUNTER_BASE_URL.replace("{encounterUuid}", encounterUuid);
    axios.get.mockResolvedValueOnce({ status: 200, data: responseData });
    const result = await findByEncounterUuid(encounterUuid);
    expect(axios.get).toHaveBeenCalledWith(apiURL, { params: { includeAll: false } });
    expect(result).toEqual(responseData);
  });

  it("should return empty array when status is not 200", async () => {
    const encounterUuid = '123';
    const apiURL = ENCOUNTER_BASE_URL.replace("{encounterUuid}", encounterUuid);
    axios.get.mockResolvedValueOnce({ status: 404 });
    const result = await findByEncounterUuid(encounterUuid);
    expect(axios.get).toHaveBeenCalledWith(apiURL, { params: { includeAll: false } });
    expect(result).toEqual([]);
  });

  it("should throw error when axios request fails", async () => {
    const encounterUuid = '123';
    const errorMessage = 'Failed to fetch data';
    const apiURL = ENCOUNTER_BASE_URL.replace("{encounterUuid}", encounterUuid);
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    try {
        await findByEncounterUuid(encounterUuid);
    } catch (error) {
        expect(error.message).toBe(errorMessage);
    }
    expect(axios.get).toHaveBeenCalledWith(apiURL, { params: { includeAll: false } });
  });
});

describe("subLabels", () => {
  it("should return label with lowNormal and hiNormal", () => {
    const subItem = { lowNormal: 10, hiNormal: 20 };
    const result = subLabels(subItem);
    expect(result).toBe("(10 - 20)");
  });

  it("should return label with only lowNormal", () => {
    const subItem = { lowNormal: 10 };
    const result = subLabels(subItem);
    expect(result).toBe("(>10)");
  });

  it("should return label with only hiNormal", () => {
    const subItem = { hiNormal: 20 };
    const result = subLabels(subItem);
    expect(result).toBe("(<20)");
  });

  it("should return empty string when no lowNormal or hiNormal", () => {
    const subItem = {};
    const result = subLabels(subItem);
    expect(result).toBe("");
  });
});

describe("isAbnormal", () => {
  it("should return true if interpretation is 'ABNORMAL'", () => {
    const result = isAbnormal("ABNORMAL");
    expect(result).toBe(true);
  });

  it("should return false if interpretation is not 'ABNORMAL'", () => {
    const result = isAbnormal("NORMAL");
    expect(result).toBe(false);
  });
});

describe("formatDate", () => {
  it("should format date as 'DD-MMM-YYYY'", () => {
    const date = "2024-05-13";
    const result = formatDate(date);
    expect(result).toBe("13-May-2024");
  });
});

describe("getValue", () => {
  it("should return formatted value for DATE type", () => {
    const member = { type: memberTypes.DATE, value: "2024-05-13" };
    const result = getValue(member);
    expect(result).toBe("13 May 24");
  });

  it("should return formatted value for DATETIME type", () => {
    const member = { type: memberTypes.DATETIME, value: "2024-05-13T10:00:00" };
    const result = getValue(member);
    expect(result).toBe("13 May 24 10:00 am");
  });

  it("should return display value for COMPLEX type", () => {
    const member = { type: memberTypes.COMPLEX, complexData: { display: "Complex Data" } };
    const result = getValue(member);
    expect(result).toBe("Complex Data");
  });

  it("should return valueAsString for BOOLEAN type", () => {
    const member = { type: memberTypes.BOOLEAN, valueAsString: "true" };
    const result = getValue(member);
    expect(result).toBe("true");
  });
});
