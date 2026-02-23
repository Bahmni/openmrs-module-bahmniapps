/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.ObservationTemplate = function (concept, visitStartDate, observations) {
    var obsTemplate = {
        name: concept.name,
        conceptClass: concept.conceptClass,
        label: concept.shortName || concept.name,
        visitStartDate: visitStartDate,
        encounters: []
    };

    var groupedObservations = _.groupBy(observations, function (observation) {
        return observation.encounterDateTime;
    });

    var encounterDates = _.sortBy(Object.keys(groupedObservations), function (a) {
        return -a;
    });

    angular.forEach(encounterDates, function (encounterDate) {
        var newEncounter = {
            encounterDateTime: encounterDate,
            observations: groupedObservations[encounterDate]
        };
        obsTemplate.encounters.push(newEncounter);
    });
    return obsTemplate;
};
