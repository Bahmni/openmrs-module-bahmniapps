Bahmni.Common.Obs.ObservationMapper = function () {

    var self = this;

    this.map = function (bahmniObservations, allConceptsConfig) {
        var mappedObservations = mapObservations(bahmniObservations, allConceptsConfig);
        return mapUIObservations(mappedObservations, allConceptsConfig);
    };

    var mapObservations = function (bahmniObservations, allConceptsConfig) {
        var mappedObservations = [];
        $.each(bahmniObservations, function (i, bahmniObservation) {
            var conceptConfig = allConceptsConfig[bahmniObservation.concept.name] || [];
            var observation = new Bahmni.Common.Obs.Observation(bahmniObservation, conceptConfig);
            if (observation.groupMembers && observation.groupMembers.length >= 0) {
                observation.groupMembers = mapObservations(observation.groupMembers, allConceptsConfig);
            }
            mappedObservations.push(observation);
        });
        return mappedObservations;
    };

    var mapUIObservations = function (observations, allConceptsConfig) {
        var groupedObservations = _.groupBy(observations, function (observation) {
            return observation.concept.name;
        });
        var mappedObservations = [];
        $.each(groupedObservations, function (i, obsGroup) {
            var conceptConfig = allConceptsConfig[obsGroup[0].concept.name] || [];
            if (conceptConfig.multiSelect) {
                mappedObservations.push(new Bahmni.Common.Obs.MultiSelectObservation(obsGroup, conceptConfig));
            } else if (conceptConfig.grid) {
                mappedObservations.push(new Bahmni.Common.Obs.GridObservation(obsGroup[0], conceptConfig));
            } else {
                var observation = obsGroup[0];
                observation.groupMembers = mapUIObservations(observation.groupMembers, allConceptsConfig);
                mappedObservations.push(observation);
            }
        });
        return mappedObservations;
    };
};
