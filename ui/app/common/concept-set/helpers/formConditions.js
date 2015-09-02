Bahmni.ConceptSet.FormConditions = (function() {

    var eventHandler = function(element, observations, obsUtil) {
        var elementConceptName = element.data("conceptName");
        var formCondition = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[elementConceptName];
        if(formCondition) {
            var parentConceptSet = element.closest('.concept-set-group');
            var parentConceptSetName = parentConceptSet.data("conceptName");
            var flattenedObservations = flattenFormObservationSet(observations, parentConceptSetName, obsUtil);
            var conditions = formCondition(parentConceptSetName, flattenedObservations);
            updateElementsState(conditions, parentConceptSet, obsUtil);
        }
    };

    var flattenFormObservationSet = function(observations, obsGroupName, obsUtil) {
        var parentObservationSet = _.find(observations, function (obs) {
            return obs.concept.name === obsGroupName;
        });
        return obsUtil.flatten(parentObservationSet);
    };

    var updateElementsState = function(conditions, form, obsUtil) {
        _.each(conditions.enable, function(field) {
            obsUtil.disable(form, field, false);
        });
        _.each(conditions.disable, function(field) {
            obsUtil.disable(form, field, true);
        });
    };

    return {
        eventHandler: eventHandler,
        rules: Bahmni.ConceptSet.FormConditions.rules || {} //When the rules object is loaded from config files first, don't loose it
    }

})();

