'use strict';
Bahmni.Common.Util.TranslationUtil = {
    translateAttribute: function (attribute, moduleName, $translate) {
        if (typeof attribute != 'undefined') {
            if ((moduleName == null) || (typeof moduleName == 'undefined')) {
                var keyPrefix = " ";
            } else {
                keyPrefix = moduleName;
            }

            var keyName = attribute.toUpperCase().replace(/\s\s+/g, ' ').replace(/[^a-zA-Z0-9 _]/g, "").trim().replace(/ /g, "_");
            var translationKey = keyPrefix + "_" + keyName;
            var translation = $translate.instant(translationKey);
            if (translation != translationKey) {
                attribute = translation;
            }
        }
        return attribute;
    }
};
