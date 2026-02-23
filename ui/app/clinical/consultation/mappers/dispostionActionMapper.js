/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';
Bahmni.Clinical.DispostionActionMapper = function () {
    var getMappingCode = function (concept) {
        var mappingCode = "";
        if (concept.mappings) {
            concept.mappings.forEach(function (mapping) {
                var mappingSource = mapping.display.split(":")[0];
                if (mappingSource === Bahmni.Common.Constants.emrapiConceptMappingSource) {
                    mappingCode = $.trim(mapping.display.split(":")[1]);
                }
            });
        }
        return mappingCode;
    };

    this.map = function (dispositionActions) {
        return dispositionActions.map(function (dispositionAction) {
            if ((dispositionAction.prefferedName) == undefined) {
                return { name: dispositionAction.name.name, code: getMappingCode(dispositionAction) };
            } else {
                return { name: dispositionAction.prefferedName, code: getMappingCode(dispositionAction) };
            }
        });
    };
};
