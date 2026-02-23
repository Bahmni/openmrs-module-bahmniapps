/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Registration.RegistrationEncounterConfig = (function () {
    function RegistrationEncounterConfig (conceptData, encounterTypes, visitTypes) {
        this.conceptData = conceptData;
        this.encounterTypes = encounterTypes;
        this.visitTypes = visitTypes;
    }

    RegistrationEncounterConfig.prototype = {
        getVisitTypesAsArray: function () {
            var visitTypesArray = [];
            for (var name in this.visitTypes) {
                visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
            }
            return visitTypesArray;
        },
        getDefaultVisitType: function (locationUuid) {
            var visitType = null;
            _.each(this.loginLocationToVisitTypeMap.results, function (result) {
                if (result.entity.uuid === locationUuid) {
                    visitType = result.mappings[0].name;
                }
            });
            return visitType;
        }
    };
    return RegistrationEncounterConfig;
})();
