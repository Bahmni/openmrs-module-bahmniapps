'use strict';

Bahmni.Clinical.ObsGroupingHelper = function (conceptSetUiConfigService, conceptGroupFormatService) {
    var conceptSetUiConfigSvc = conceptSetUiConfigService;

    this.groupObservations = function (observations) {
        var groupedObservationsArray = [];
        var obsWithoutFieldPath = _.filter(observations, function (obs) { return !obs.formFieldPath; });
        var obsWithFieldPath = _.filter(observations, function (obs) { return obs.formFieldPath; });
        var groupedObsByFieldPath = _.groupBy(obsWithFieldPath, function (obs) { return obs.formFieldPath.split('.')[0]; });

        obsWithoutFieldPath.forEach(function (observation) {
            var temp = [observation];
            var conceptSetName = observation.concept.shortName || observation.concept.name;
            var observationsByGroup = groupObservations(conceptSetName, temp);

            if (observationsByGroup.groupMembers.length) {
                groupedObservationsArray.push(observationsByGroup);
            }
        });

        _.each(groupedObsByFieldPath, function (observations, formName) {
            var observationsByGroup = groupObservations(formName, observations);

            if (observationsByGroup.groupMembers.length) {
                groupedObservationsArray.push(observationsByGroup);
            }
        });
        return groupedObservationsArray;
    };

    var groupObservations = function (conceptSetName, obs) {
        var observationsByGroup = {
            "conceptSetName": conceptSetName,
            "groupMembers": new Bahmni.ConceptSet.ObservationMapper()
                .getObservationsForView(obs, conceptSetUiConfigSvc.getConfig(), conceptGroupFormatService)
        };
        return observationsByGroup;
    };
};
