import { fetchAllergensOrReactions, getEncounterType, fetchAllergiesAndReactionsForPatient, bahmniEncounter } from "./AllergyControlUtils";
import axios from "axios";

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
});

describe('bahmniEncounter', function () {
    it('should make axios call with the correct url', () => {
        axios.post.mockImplementation(() => Promise.resolve(mockBahmniEncounterResponse));

        bahmniEncounter(mockBahmniEncounterPayload);
        expect(axios.post).toHaveBeenCalledWith('/openmrs/ws/rest/v1/bahmnicore/bahmniencounter', mockBahmniEncounterPayload, {
        withCredentials: true,
        headers: {"Accept": "application/json", "Content-Type": "application/json"}
        });
    });
    it("should return the correct data", async () => {
      axios.post.mockImplementation(() => Promise.resolve(mockBahmniEncounterResponse));
      const response = await bahmniEncounter(mockBahmniEncounterPayload);
      expect(response).toEqual(mockBahmniEncounterResponse);
    });
});
