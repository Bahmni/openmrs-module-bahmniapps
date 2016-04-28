'use strict';

angular.module('bahmni.common.domain')
    .service('diagnosisService', ['$q', function ($q) {
        var self = this;
        this.getAllFor = function (searchTerm) {
            return $q.when({"data": {}});
        };


        this.getDiagnoses = function (patientUuid, visitUuid) {
                return $q.when({"data": {}});
        };

        this.deleteDiagnosis = function(obsUuid){
            return $q.when({"data": {}});
        };

        this.getDiagnosisConceptSet = function(){
            return $q.when({"data": {}});
        };

        this.getPastAndCurrentDiagnoses = function (patientUuid, encounterUuid) {
            return $q.when({"data": {}});
        };

        this.populateDiagnosisInformation = function(patientUuid, consultation) {
            consultation.savedDiagnosesFromCurrentEncounter = [];
            consultation.pastDiagnoses = [];
            return $q.when(consultation);
        }

    }]);