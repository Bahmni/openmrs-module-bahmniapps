import axios from "axios";
import { findByEncounterUuid, buildFormMap, subLabels, isAbnormal, memberTypes, formatDate, getValue } from "./FormView.js";
import { ENCOUNTER_BASE_URL } from "../../constants";
import { build } from "./BuildFormView.js";

jest.mock("axios");
jest.mock("./BuildFormView.js")

const mockEncounterData = {
  encounterUuid: "123",
  observations: [
            {
                "formFieldPath": "Dummy form.1/4-0",
                "groupMembers": [
                    {
                        "encounterDateTime": 1715245423000,
                        "providers": [
                            {
                                "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                                "name": "Super Man"
                            }
                        ],
                        "type": "Numeric",
                        "concept": {
                            "shortName": "Systolic",
                            "units": "mm Hg"
                        },
                        "observationDateTime": 1715245524000,
                        "valueAsString": "150.0",
                        "value": 150
                    },
                    {
                        "formFieldPath": "Dummy form.1/4-0",
                        "encounterDateTime": 1715245423000,
                        "providers": [
                            {
                                "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                                "name": "Super Man"
                            }
                        ],
                        "type": "Boolean",
                        "concept": {
                            "shortName": "Systolic Abnormal"
                        },
                        "observationDateTime": 1715245524000,
                        "valueAsString": "Yes",
                        "value": true
                    }
                ],
                "concept": {
                    "shortName": "Dummy form"
                },
                "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa"
            },
            {
              "formFieldPath": "Dummy form2.1/4-0",
              "groupMembers": [
                  {
                      "encounterDateTime": 1715245423000,
                      "providers": [
                          {
                              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                              "name": "Super Man"
                          }
                      ],
                      "type": "Numeric",
                      "concept": {
                          "shortName": "Systolic",
                          "units": "mm Hg"
                      },
                      "observationDateTime": 1715245524000,
                      "valueAsString": "150.0",
                      "value": 150
                  },
                  {
                      "formFieldPath": "Dummy form.1/4-0",
                      "encounterDateTime": 1715245423000,
                      "providers": [
                          {
                              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                              "name": "Super Man"
                          }
                      ],
                      "type": "Boolean",
                      "concept": {
                          "shortName": "Systolic Abnormal"
                      },
                      "observationDateTime": 1715245524000,
                      "valueAsString": "Yes",
                      "value": true
                  }
              ],
              "concept": {
                  "shortName": "Dummy form"
              },
              "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa"
          },
            {
              "groupMembers": [
                  {
                      "encounterDateTime": 1715245423000,
                      "providers": [
                          {
                              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                              "name": "Super Man"
                          }
                      ],
                      "type": "Numeric",
                      "concept": {
                          "shortName": "Systolic",
                          "units": "mm Hg"
                      },
                      "observationDateTime": 1715245524000,
                      "valueAsString": "150.0",
                      "value": 150
                  },
                  {
                      "formFieldPath": "Dummy form.1/4-0",
                      "encounterDateTime": 1715245423000,
                      "providers": [
                          {
                              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                              "name": "Super Man"
                          }
                      ],
                      "type": "Boolean",
                      "concept": {
                          "shortName": "Systolic Abnormal"
                      },
                      "observationDateTime": 1715245524000,
                      "valueAsString": "Yes",
                      "value": true
                  }
              ],
              "concept": {
                  "shortName": "Dummy form"
              },
              "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa"
          }
  ],
};

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

describe("buildFormMap", () => {
  it("should build Form based on formMap", async () => {
    const formMap = { encounterUuid: "123", formName: "Dummy form", hasNoHierarchy: true };
    axios.get.mockResolvedValueOnce({ status: 200, data: mockEncounterData });
    build.mockResolvedValueOnce([]);
    await buildFormMap(formMap);
    expect(build).toHaveBeenCalled();
    expect(build).toHaveBeenCalledWith([{"value": [{"concept": {"shortName": "Dummy form"}, "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa", "formFieldPath": "Dummy form.1/4-0", "groupMembers": [{"concept": {"shortName": "Systolic", "units": "mm Hg"}, "encounterDateTime": 1715245423000, "observationDateTime": 1715245524000, "providers": [{"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"}], "type": "Numeric", "value": 150, "valueAsString": "150.0"}, {"concept": {"shortName": "Systolic Abnormal"}, "encounterDateTime": 1715245423000, "formFieldPath": "Dummy form.1/4-0", "observationDateTime": 1715245524000, "providers": [{"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"}], "type": "Boolean", "value": true, "valueAsString": "Yes"}]}]}], true);
  });
});
