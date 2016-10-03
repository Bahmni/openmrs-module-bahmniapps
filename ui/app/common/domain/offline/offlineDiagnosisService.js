'use strict';

angular.module('bahmni.common.domain')
    .service('diagnosisService', ['$q', 'offlineEncounterServiceStrategy','appService',
        function ($q, offlineEncounterService, appService) {
            var diagnosisStatusConfig = _.get(appService.getAppDescriptor().getConfig("diagnosisStatus"),'value');
            var defaultStatusOptions = {
                ruledOut: {
                    ruledOut: true,
                    label: "RULED OUT",
                    concept: {
                        name: "Ruled Out Diagnosis"
                    }
                },
                cured: {
                    cured: true,
                    label: "CURED",
                    concept: {
                        name: "Cured Diagnosis"
                    }
                }
            };
            defaultStatusOptions.ruledOut.label = _.get(diagnosisStatusConfig, 'ruledOutLabel') || defaultStatusOptions.ruledOut.label;
            defaultStatusOptions.cured.label = _.get(diagnosisStatusConfig, 'curedLabel') || defaultStatusOptions.cured.label;


            var filterAndSortDiagnosis = function(diagnoses){
                diagnoses = _.filter(diagnoses, function(singleDiagnosis){
                    return singleDiagnosis.revised == false;
                });
                diagnoses = _.sortBy(diagnoses, 'diagnosisDateTime').reverse();
                return diagnoses;
            };

            var diagnosisMapper = new Bahmni.DiagnosisMapper(defaultStatusOptions);

            this.getDiagnosisStatuses = function () {
                return defaultStatusOptions;
            };

            this.getDiagnoses = function(patientUuid, visitUuid){
                var deferred = $q.defer();
                var diagnoses =[];
                offlineEncounterService.getEncountersByPatientUuid(patientUuid).then(function(results){
                    _.each(results, function(result){
                        diagnoses = diagnoses.concat(result.encounter.bahmniDiagnoses)
                    });
                    diagnoses = filterAndSortDiagnosis(diagnoses);
                    deferred.resolve(diagnosisMapper.mapDiagnoses(diagnoses));
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
                return $q.when({"data": {"pastDiagnoses": [], "savedDiagnosesFromCurrentEncounter": []
                }});
            };

            this.populateDiagnosisInformation = function(patientUuid, consultation) {
                consultation.savedDiagnosesFromCurrentEncounter = [];
                consultation.pastDiagnoses = [];
                return $q.when(consultation);
            }

        }]);