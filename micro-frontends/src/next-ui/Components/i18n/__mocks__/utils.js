export function getTranslations() {
  return import("../../../../../public/i18n/locale_en.json").then(
    (module) => module.default
  );
}

export const getLocale = () => "en";
