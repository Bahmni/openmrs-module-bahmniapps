'use strict';

angular.module('bahmni.common.domain')
    .service('diagnosisService', ['$http', '$rootScope', function ($http, $rootScope) {
        var self = this;
        this.getAllFor = function (searchTerm, locale) {
            var url = Bahmni.Common.Constants.bahmniapiConceptUrl;
            var parameters = { term: searchTerm, limit: Bahmni.Common.Constants.emrapiDiagnosisLimit };
            if (locale) {
                parameters.locale = locale;
            }
            return $http.get(url, {
                params: parameters
            });
        };

        this.getDiagnoses = function (patientUuid, visitUuid) {
            var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
            return $http.get(url, {
                params: { patientUuid: patientUuid, visitUuid: visitUuid }
            });
        };

        this.getPatientDiagnosis = function (patientUuid) {
            var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
            return $http.get(url, {
                params: { patientUuid: patientUuid }
            });
        };

        this.deleteDiagnosis = function (obsUuid) {
            var url = Bahmni.Common.Constants.bahmniDeleteDiagnosisUrl;
            return $http.get(url, {
                params: { obsUuid: obsUuid }
            });
        };

        this.getDiagnosisConceptSet = function () {
            return $http.get(Bahmni.Common.Constants.conceptUrl, {
                method: "GET",
                params: {
                    v: 'custom:(uuid,name,setMembers)',
                    code: Bahmni.Common.Constants.diagnosisConceptSet,
                    source: Bahmni.Common.Constants.emrapiConceptMappingSource
                },
                withCredentials: true
            });
        };

        this.getPastAndCurrentDiagnoses = function (patientUuid, encounterUuid) {
            return self.getDiagnoses(patientUuid).then(function (response) {
                var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus);
                var allDiagnoses = diagnosisMapper.mapDiagnoses(response.data);
                var pastDiagnoses = diagnosisMapper.mapPastDiagnosis(allDiagnoses, encounterUuid);
                var savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter(allDiagnoses, encounterUuid);
                return {
                    "pastDiagnoses": pastDiagnoses,
                    "savedDiagnosesFromCurrentEncounter": savedDiagnosesFromCurrentEncounter
                };
            });
        };

        this.populateDiagnosisInformation = function (patientUuid, consultation) {
            return this.getPastAndCurrentDiagnoses(patientUuid, consultation.encounterUuid).then(function (diagnosis) {
                consultation.pastDiagnoses = diagnosis.pastDiagnoses;
                consultation.savedDiagnosesFromCurrentEncounter = diagnosis.savedDiagnosesFromCurrentEncounter;
                return consultation;
            });
        };

        this.getPatientDiagnosis = function (patientUuid) {
            var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
            return $http.get(url, {
                params: { patientUuid: patientUuid }
            });
        };
    }]);
