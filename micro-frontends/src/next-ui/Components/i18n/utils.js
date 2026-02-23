/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

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
