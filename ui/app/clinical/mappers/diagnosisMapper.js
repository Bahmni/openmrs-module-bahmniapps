Bahmni.DiagnosisMapper = function () {

    var self = this;

    var mapDiagnosis = function (diagnosis) {
        if (!diagnosis.codedAnswer) {
            diagnosis.codedAnswer = {
                name: undefined,
                uuid: undefined
            }
        }
        var mappedDiagnosis = angular.extend(new Bahmni.Clinical.Diagnosis(), diagnosis);
        if (mappedDiagnosis.firstDiagnosis) {
            mappedDiagnosis.firstDiagnosis = mapDiagnosis(mappedDiagnosis.firstDiagnosis);
        }
        mappedDiagnosis.setDiagnosisStatus(diagnosis.diagnosisStatusConcept);
        return mappedDiagnosis;
    };

    self.mapDiagnosis = mapDiagnosis;
    
    self.mapPastDiagnosis = function (pastDiagnoses, currentEncounterUuid) {
        var pastDiagnosesResponse = [];
        pastDiagnoses.forEach(function (pastDiagnosis) {
            if (pastDiagnosis.encounterUuid !== currentEncounterUuid) {
                pastDiagnosesResponse.push(mapDiagnosis(pastDiagnosis));
            }
        });
        return pastDiagnosesResponse;
    };

    self.mapSavedDiagnosesFromCurrentEncounter = function (pastDiagnoses, currentEncounterUuid) {
        var savedDiagnosesFromCurrentEncounter = [];
        pastDiagnoses.forEach(function (pastDiagnosis) {
            if (pastDiagnosis.encounterUuid === currentEncounterUuid) {
                savedDiagnosesFromCurrentEncounter.push(mapDiagnosis(pastDiagnosis));
            }
        });
        return savedDiagnosesFromCurrentEncounter;
    };

};
