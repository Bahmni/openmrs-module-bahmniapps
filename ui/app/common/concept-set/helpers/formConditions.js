Bahmni.ConceptSet.EventHandler = function(e, observations, obsUtil) {
    var element = $(e.target);
    var elementConceptName = element.data("conceptName");
    var formCondition = Bahmni.ConceptSet.FormConditions && Bahmni.ConceptSet.FormConditions[elementConceptName];
    if(formCondition) {
        var parentConceptSet = element.closest('.concept-set-group');
        var parentConceptSetName = parentConceptSet.data("conceptName");
        var elementValue = element.val();
        var parentObservationSet = _.find(observations, function(obs) {
            return obs.concept.name === parentConceptSetName;
        });
        var flattenedObservations = obsUtil.flatten(parentObservationSet);
        var conditions = Bahmni.ConceptSet.FormConditions[elementConceptName](parentConceptSetName, elementValue, flattenedObservations);
        _.each(conditions.enable, function(field) {
            obsUtil.disable(parentConceptSet, field, false);
        });
        _.each(conditions.disable, function(field) {
            obsUtil.disable(parentConceptSet, field, true);
        });
    }
};