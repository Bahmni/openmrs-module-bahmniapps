import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { IntlProvider } from "react-intl";
import { getLocale, getTranslations } from "./utils";

export function I18nProvider({ children }) {
  const [messages, setMessages] = useState(undefined);
  const [error, setError] = useState(null);
  const locale = useMemo(getLocale, []);

  useEffect(() => {
    setError(null);
    getTranslations(locale)
      .then(setMessages)
      .catch((err) => {
        console.error("Error fetching translations:", err);
        setError(err);
      });
  }, [locale]);

  if (error) {
    return <div>Error loading translations</div>;
  }

  if (!messages) {
    return <div>Loading translations...</div>;
  }

  return (
    <IntlProvider defaultLocale="en" locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}

I18nProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
