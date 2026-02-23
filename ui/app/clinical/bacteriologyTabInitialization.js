/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.clinical').factory('bacteriologyTabInitialization',
    ['conceptSetService', function (conceptSetService) {
        return function () {
            var conceptSetName = "BACTERIOLOGY CONCEPT SET";
            return conceptSetService.getConcept({
                name: conceptSetName,
                v: "custom:(uuid,setMembers:(uuid,name,conceptClass,answers:(uuid,name,mappings,names),setMembers:(uuid,name,conceptClass,answers:(uuid,name,mappings),setMembers:(uuid,name,conceptClass))))"
            }, true)
                .then(function (response) {
                    return response.data.results[0];
                });
        };
    }]
);
