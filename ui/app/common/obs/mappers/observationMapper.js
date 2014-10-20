Bahmni.Common.Obs.ObservationMapper = function () {

    var self = this;

    this.map = function (bahmniObservations, allConceptsConfig) {
        var groupedObservations = _.groupBy(bahmniObservations, function (bahmniObservation) {
            return bahmniObservation.concept.name;
        });

        var mappedObservations = [];
        $.each(groupedObservations, function (i, obsGroup) {
            var conceptConfig = allConceptsConfig[obsGroup[0].concept.name];
            if (conceptConfig && conceptConfig.multiSelect) {
                var mappedGroupMembers = _.map(obsGroup, function (obs) {
                    return new Bahmni.Common.Obs.Observation(obs, conceptConfig);
                });
                mappedObservations.push(new Bahmni.Common.Obs.MultiSelectObservation(mappedGroupMembers, conceptConfig));
            } else {
                var observation = new Bahmni.Common.Obs.Observation(obsGroup[0], conceptConfig);
                if (observation.groupMembers && observation.groupMembers.length >= 0) {
                    observation.groupMembers = self.map(observation.groupMembers, allConceptsConfig);
                }
                mappedObservations.push(observation);
            }
        });

        return mappedObservations;
    };
};
