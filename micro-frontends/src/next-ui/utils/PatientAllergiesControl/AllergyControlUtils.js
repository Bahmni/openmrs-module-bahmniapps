import axios from "axios";
import { FETCH_CONCEPT_URL } from "../../constants";
import { getLocale } from "../../Components/i18n/utils";

export const fetchAllergensOrReactions = async (conceptId) => {
  const locale = getLocale();
  const apiURL = FETCH_CONCEPT_URL.replace("{locale}", locale);

  const replaceConceptIdInapiURL = (conceptId) => {
    return apiURL.replace("{conceptUuid}", conceptId);
  };

  const allergenOrReactionURL = replaceConceptIdInapiURL(conceptId);

  try {
    const response = await axios.get(allergenOrReactionURL);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
