'use strict';

angular.module('opd.consultation.services')
    .factory('observationSelectionService', [function () {

    var diagnosisList = [];

    var getSelectedObservations = function () {
        return diagnosisList;
    };

    var _canAdd = function (diagnosis) {
        var canAdd = true;
        diagnosisList.forEach(function(observation){
            if(observation.concept.conceptName === diagnosis.concept.conceptName){
                canAdd = false;
            }
        });
        return canAdd;
    }

    var removeObservation = function (node) {
        var index = diagnosisList.indexOf(node);
        if (index >= 0) {
            diagnosisList.splice(index, 1)
        }
    }

    var addDiagnosis = function (concept) {
        var diagnosis = new Bahmni.Opd.Consultation.Diagnosis(concept);
        if (_canAdd(diagnosis)) {
            diagnosisList.push(diagnosis);
        }
    };

    return {
        getSelectedObservations:getSelectedObservations,
        addDiagnosis:addDiagnosis,
        remove:removeObservation
    };
}]);