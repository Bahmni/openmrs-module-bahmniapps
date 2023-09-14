import { fetchAllergensOrReactions } from "./AllergyControlUtils";
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
