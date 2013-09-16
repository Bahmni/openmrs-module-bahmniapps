'use strict';

angular.module('opd.consultation.services')
    .factory('observationSelectionService', [function () {

    var observations = [];

    var getSelectedObservations = function () {
        return observations;
    };

    var _canAdd = function (node) {
        var canAdd = true;
        observations.forEach(function(observation){
            if(observation.concept.conceptName === node.concept.conceptName){
                canAdd = false;
            }
        });
        return canAdd;
    }

    var removeObservation = function (node) {
        var index = observations.indexOf(node);
        if (index >= 0) {
            observations.splice(index, 1)
        }
    }

    var addObservation = function (observation) {
        if (_canAdd(observation)) {
            observations.push(observation);
        }
    };

    return {
        getSelectedObservations:getSelectedObservations,
        addObservation:addObservation,
        remove:removeObservation
    };
}]);