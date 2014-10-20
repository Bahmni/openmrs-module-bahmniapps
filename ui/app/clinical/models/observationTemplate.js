Bahmni.Clinical.ObservationTemplate = function (name, visitStartDate, observations) {
    var obsTemplate = {
        name: name,
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