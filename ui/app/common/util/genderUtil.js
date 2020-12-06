'use strict';

Bahmni.Common.Util.GenderUtil = {
    translateGender: function (genderMap, $translate) {
        _.forEach(genderMap, function (value, key) {
            var translationKey = "GENDER_" + key.toUpperCase();
            var translatedGender = $translate.instant(translationKey);
            if (translatedGender != translationKey) {
                genderMap[key] = translatedGender;
            }
        });
    }
};
