'use strict';

angular.module('bahmni.common.domain')
    .service('diagnosisService', ['$q', 'offlineEncounterServiceStrategy',
        function ($q, offlineEncounterService) {

            this.getDiagnoses = function(patientUuid, visitUuid){
                var deferred = $q.defer();
                var diagnoses =[];
                offlineEncounterService.getEncountersByPatientUuid(patientUuid).then(function(results){
                    _.each(results, function(result){
                        diagnoses = diagnoses.concat(result.encounter.bahmniDiagnoses)
                    });
                    deferred.resolve({"data":diagnoses});
                });
                return deferred.promise;
            };

            this.getAllFor = function (searchTerm) {
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