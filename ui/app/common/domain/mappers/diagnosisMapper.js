'use strict';

Bahmni.DiagnosisMapper = function (diagnosisStatus) {
    var mapDiagnosis = function (diagnosis) {
        if (!diagnosis.codedAnswer) {
            diagnosis.codedAnswer = {
                name: undefined,
                uuid: undefined
            }
        }
        var mappedDiagnosis = angular.extend(new Bahmni.Common.Domain.Diagnosis(), diagnosis);
        if (mappedDiagnosis.firstDiagnosis) {
            mappedDiagnosis.firstDiagnosis = mapDiagnosis(mappedDiagnosis.firstDiagnosis);
        }
        if (mappedDiagnosis.latestDiagnosis) {
            mappedDiagnosis.latestDiagnosis = mapDiagnosis(mappedDiagnosis.latestDiagnosis);
        }

        if (diagnosis.diagnosisStatusConcept) {
            mappedDiagnosis.diagnosisStatus = _.find(diagnosisStatus,function(status){
                return status.concept.name === diagnosis.diagnosisStatusConcept.name;
            });
        }
        return mappedDiagnosis;
    };

    var mapDiagnoses = _.partial(_.map,_,mapDiagnosis);

    return {
        mapDiagnosis:mapDiagnosis,
        mapDiagnoses:mapDiagnoses
    }
};

Bahmni.DiagnosisMapper.update = {
    pastDiagnoses: function(pastDiagnosis){
        pastDiagnosis.previousObs = pastDiagnosis.existingObs;
        pastDiagnosis.existingObs = null;
        pastDiagnosis.inCurrentEncounter = undefined;
        return pastDiagnosis;
    },
    savedDiagnosesFromCurrentEncounter : function(currentEncounterDiagnosis){
        currentEncounterDiagnosis.inCurrentEncounter = true;
        return currentEncounterDiagnosis;
    },
    activeDiagnoses:function(pastDiagnosis){
        pastDiagnosis.previousObs = pastDiagnosis.existingObs;
        pastDiagnosis.existingObs = null;
        pastDiagnosis.inCurrentEncounter = undefined;
        return pastDiagnosis;
    }
};
