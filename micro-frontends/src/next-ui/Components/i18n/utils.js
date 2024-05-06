import { LS_LANG_KEY, BASE_URL } from "../../constants";

const translationsBaseUrl = "i18n";

export function getLocale() {
  return localStorage.getItem(LS_LANG_KEY) || "en";;
}

export const getTranslations = async (locale) => {
  const fileName = `locale_${locale}.json`;
  return fetchTranslations(fileName);
};

async function fetchTranslations(fileName) {
  const url = `${BASE_URL}${translationsBaseUrl}/${fileName}`;
  const response = await fetch(url);
  return response.json();
}
