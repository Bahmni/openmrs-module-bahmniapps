import { LS_LANG_KEY, BASE_URL, NEXT_UI_CONFIG_PATH } from "../../constants";

const translationsBaseUrl = "i18n";

export function getLocale() {
  return localStorage.getItem(LS_LANG_KEY) || "en";
}

export const getTranslations = async (locale) => {
  const fileName = `locale_${locale}.json`;
  
  try {
    return await fetchTranslations(`${NEXT_UI_CONFIG_PATH}${translationsBaseUrl}/micro-frontends-dist/${fileName}`);
  } catch (error) {
    console.warn(`Primary translation file not found, falling back to secondary: ${error.message}`);
    return await fetchTranslations(`${BASE_URL}${translationsBaseUrl}/${fileName}`);
  }
};

async function fetchTranslations(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch translations from ${url}: ${response.statusText}`);
  }

  return response.json();
}

