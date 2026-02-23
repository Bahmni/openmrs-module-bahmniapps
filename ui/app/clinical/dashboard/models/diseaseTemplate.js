/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.DiseaseTemplate = function (concept, obsTemplates) {
    var diseaseTemplate = {
        name: concept.name,
        label: concept.shortName || concept.name,
        obsTemplates: obsTemplates || []
    };

    diseaseTemplate.notEmpty = function () {
        return diseaseTemplate.obsTemplates && diseaseTemplate.obsTemplates.length > 0;
    };

    return diseaseTemplate;
};
