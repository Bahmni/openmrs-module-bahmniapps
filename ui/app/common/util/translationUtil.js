/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

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
