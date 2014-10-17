Bahmni.Clinical.ObservationTemplate = function (observationTemplate) {
    var obsTemplate = {
        name: observationTemplate.concept.name,
        visitStartDate: observationTemplate.visitStartDate,
        encounters: []
    };

    var observations = _.map(observationTemplate.bahmniObservations, function (bahmniObservation) {
        return new Bahmni.Clinical.DashboardObservation(bahmniObservation);
    });

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