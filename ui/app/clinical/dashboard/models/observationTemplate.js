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
