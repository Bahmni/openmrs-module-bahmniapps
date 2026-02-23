/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.DiseaseTemplateMapper = function (diseaseTemplateResponse, allConceptsConfig) {
    var allObsTemplates = [];

    var isGrid = function (obsTemplate) {
        return allConceptsConfig[obsTemplate.concept.name] && allConceptsConfig[obsTemplate.concept.name].grid;
    };

    if (diseaseTemplateResponse.observationTemplates && diseaseTemplateResponse.observationTemplates.length > 0) {
        diseaseTemplateResponse.observationTemplates.forEach(function (obsTemplate) {
            var observations = [];
            var observationTemplate;
            if (isGrid(obsTemplate)) {
                obsTemplate.value = new Bahmni.Common.Obs.ObservationMapper().getGridObservationDisplayValue(obsTemplate);
                observationTemplate = new Bahmni.Clinical.ObservationTemplate(obsTemplate.concept, obsTemplate.visitStartDate, observations);
                observationTemplate.value = obsTemplate.value;
            } else {
                if (obsTemplate.bahmniObservations.length > 0) {
                    observations = new Bahmni.Common.Obs.ObservationMapper().map(obsTemplate.bahmniObservations, allConceptsConfig);
                }
                observationTemplate = new Bahmni.Clinical.ObservationTemplate(obsTemplate.concept, obsTemplate.visitStartDate, observations);
            }
            allObsTemplates.push(observationTemplate);
        });
    }
    return Bahmni.Clinical.DiseaseTemplate(diseaseTemplateResponse.concept, allObsTemplates);
};
