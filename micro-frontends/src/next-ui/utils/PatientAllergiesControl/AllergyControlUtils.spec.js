import { fetchAllergensOrReactions, getEncounterType, fetchAllergiesAndReactionsForPatient, bahmniEncounter, saveAllergiesAPICall } from "./AllergyControlUtils";
import axios from "axios";
import { BAHMNI_ENCOUNTER_URL, SAVE_ALLERGIES_URL, ENCOUNTER_TYPE_URL, GET_ALLERGIES_URL } from "../../constants";

jest.mock("axios");
const mockResponse = {
  data: [
    {
      uuid: 1,
      display: "Peanuts",
    },
    {
      uuid: 2,
      display: "Shellfish",
    },
    {
      uuid: 3,
      display: "Dairy",
    },
  ],
};

const mockEncounterType = {
  data: {
    uuid: "81852aee-3f10-11e4-adec-0800271c1b75",
    display: "Consultation",
    name: "Consultation",
    description: "Consultation encounter",
    retired: false,
  }
}

const mockBahmniEncounterResponse = {
  data: {
    locationUuid: "location#1",
    patientUuid: "patient#1",
    encounterUuid: null,
    visitUuid: null,
    providers: [
      {
        uuid: "provider#1"
      }
    ],
    encounterDateTime: null,
    context: {},
    bahmniDiagnoses: [],
    orders: [],
    drugOrders: [],
    disposition: null,
    observations: [],
    encounterTypeUuid: "consultationEncounterUuid",
    allergy:{
      allergen:{
        allergenKind: "FOOD",
        codedAllergen: "allergen_uuid"
      },
      reactions:[
        {
          reaction: "reaction_uuid"
        }
      ],
      severity: "severity_uuid",
      comment: "Comment new"
    }
  }
}

const mockBahmniEncounterPayload = {
  locationUuid: "location#1",
  patientUuid: "patient#1",
  providerUuid: "provider#1",
  encounterTypeUuid: "consultationEncounterUuid",
  allergy:{
    allergen:{
      allergenKind: "FOOD",
      codedAllergen: "allergen_uuid"
    },
    reactions:[
      {
        reaction: "reaction_uuid"
      }
    ],
    severity: "severity_uuid",
    comment: "Comment new"
  }
}

describe("AllergyControlUtils", () => {
  it("should make axios call with the correct url", () => {
    axios.get.mockImplementation(() => Promise.resolve(mockResponse));

    fetchAllergensOrReactions("allergen_uuid");
    expect(axios.get).toHaveBeenCalledWith(
      "/openmrs/ws/rest/v1/concept/allergen_uuid?v=full&locale=en"
    );
    fetchAllergensOrReactions("reaction_uuid");
    expect(axios.get).toHaveBeenCalledWith(
      "/openmrs/ws/rest/v1/concept/reaction_uuid?v=full&locale=en"
    );
  });
  it("should return the correct data", async () => {
    axios.get.mockImplementation(() => Promise.resolve(mockResponse));

    const response = await fetchAllergensOrReactions("test_uuid");
    expect(response).toEqual(mockResponse.data);
  });
  it("should reject with error", async () => {
    const error = new Error("Error while fetching medications");
    axios.get.mockRejectedValue(error);

    try {
      fetchAllergensOrReactions("test_uuid");
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toEqual(error);
    }
  });
});

describe('getEncounterType', () => {
  it('should make axios call with the correct url', () => {
    axios.get.mockImplementation(() => Promise.resolve(mockEncounterType));

    getEncounterType("Consultation");
    expect(axios.get).toHaveBeenCalledWith('/openmrs/ws/rest/v1/encountertype/Consultation');
  });
  it("should return the correct data", async () => {
    axios.get.mockImplementation(() => Promise.resolve(mockEncounterType));

    const response = await getEncounterType("Consultation");
    expect(response).toEqual(mockEncounterType.data);
  });

  it('should handle errors and log them', async () => {
    const mockError = new Error('API error');
    axios.get.mockRejectedValueOnce(mockError);

    const consoleLogSpy = jest.spyOn(console, 'log');
    const result = await getEncounterType(mockEncounterType);
    const expectedUrl = ENCOUNTER_TYPE_URL.replace("{encounterType}", mockEncounterType);

    expect(axios.get).toHaveBeenCalledWith(expectedUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    expect(result).toBeUndefined();
    consoleLogSpy.mockRestore();
  });
});

describe('bahmniEncounter', function() {
  it('should make axios call with the correct url', () => {
    axios.post.mockImplementation(() => Promise.resolve(mockBahmniEncounterResponse));

    bahmniEncounter(mockBahmniEncounterPayload);
    expect(axios.post).toHaveBeenCalledWith('/openmrs/ws/rest/v1/bahmnicore/bahmniencounter', mockBahmniEncounterPayload, {
      withCredentials: true,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
  });
  it("should return the correct data", async () => {
    axios.post.mockImplementation(() => Promise.resolve(mockBahmniEncounterResponse));
    const response = await bahmniEncounter(mockBahmniEncounterPayload);
    expect(response).toEqual(mockBahmniEncounterResponse);
  });

  it('should handle errors and log them', async () => {
    const mockError = new Error('Network error');
    axios.post.mockRejectedValueOnce(mockError);

    const consoleLogSpy = jest.spyOn(console, 'log');
    await bahmniEncounter(mockBahmniEncounterPayload);

    expect(axios.post).toHaveBeenCalledWith(BAHMNI_ENCOUNTER_URL, mockBahmniEncounterPayload, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    consoleLogSpy.mockRestore();
  });
});

describe('fetchAllergiesAndReactionsForPatient', () => {
  it('should fetch allergies and reactions for a patient and return data', async () => {
    const patientId = '12345';
    const mockData = {
      allergies: ['Peanuts', 'Dust'],
      reactions: ['Skin Rash', 'Itchy Eyes'],
    };
    axios.get.mockResolvedValueOnce({
      data: mockData,
    });

    const result = await fetchAllergiesAndReactionsForPatient(patientId);
    const expectedUrl = GET_ALLERGIES_URL.replace('{patientId}', patientId);

    expect(axios.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockData);
  });

  it('should handle errors and log them', async () => {
    const patientId = '12345';
    const mockError = new Error('Network error');
    axios.get.mockRejectedValueOnce(mockError);

    const consoleLogSpy = jest.spyOn(console, 'log');
    await fetchAllergiesAndReactionsForPatient(patientId);
    const expectedUrl = GET_ALLERGIES_URL.replace('{patientId}', patientId);

    expect(axios.get).toHaveBeenCalledWith(expectedUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    consoleLogSpy.mockRestore();
  });
});

describe('saveAllergiesAPICall', () => {
  it('should send the correct payload and patient ID to the API and return the response', async () => {
    const payload = {
      allergenType: 'Food',
      codedAllergen: {
        uuid: 'allergen-uuid',
      },
      reactions: [{ reaction: { uuid: 'reaction-uuid' } }],
      severity: { uuid: 'severity-uuid' },
      comment: 'Some notes',
    };
    const patientId = 'patient-uuid';
    const saveAllergiesUrl = SAVE_ALLERGIES_URL.replace('{patientId}', patientId);

    const mockResponse = {
      data: { success: true },
      status: 201,
    };
    axios.post.mockResolvedValueOnce(mockResponse);

    const result = await saveAllergiesAPICall(payload, patientId);

    expect(axios.post).toHaveBeenCalledWith(saveAllergiesUrl, payload, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    expect(result).toEqual(mockResponse);
  });

  it('should handle errors and return the error', async () => {
    const payload = {
      allergenType: 'Food',
      reactions: [{ reaction: { uuid: 'reaction-uuid' } }],
      severity: { uuid: 'severity-uuid' },
      comment: 'Some notes',
    };
    const patientId = 'patient-uuid';
    const saveAllergiesUrl = SAVE_ALLERGIES_URL.replace('{patientId}', patientId);

    const mockError = new Error('Network error');
    axios.post.mockRejectedValueOnce(mockError);

    const consoleLogSpy = jest.spyOn(console, 'log');
    const result = await saveAllergiesAPICall(payload, patientId);

    expect(axios.post).toHaveBeenCalledWith(saveAllergiesUrl, payload, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    expect(result).toEqual(mockError);
    consoleLogSpy.mockRestore();
  });
});