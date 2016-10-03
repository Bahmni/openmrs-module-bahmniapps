'use strict';

angular.module('bahmni.common.domain')
    .service('diagnosisService', ['$http', 'appService', function ($http, appService) {
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

        var diagnosisMapper = new Bahmni.DiagnosisMapper(defaultStatusOptions);
        var self = this;

        self.getDiagnosisStatuses = function () {
            return defaultStatusOptions;
        };

        self.getAllFor = function (searchTerm) {
            var url = Bahmni.Common.Constants.emrapiConceptUrl;
            return $http.get(url, {
                params: {term: searchTerm, limit: 20}
            });
        };

        self.getDiagnoses = function (patientUuid, visitUuid) {
            var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
            return $http.get(url, {
                params: {patientUuid: patientUuid, visitUuid: visitUuid}
            }).then(function (response) {
                return diagnosisMapper.mapDiagnoses(response.data);
            });
        };

        self.deleteDiagnosis = function (obsUuid) {
            var url = Bahmni.Common.Constants.bahmniDeleteDiagnosisUrl;
            return $http.get(url, {
                params: {obsUuid: obsUuid}
            });
        };

        self.getDiagnosisConceptSet = function () {
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

        self.getPastAndCurrentDiagnoses = function (patientUuid, encounterUuid) {
            return self.getDiagnoses(patientUuid).then(function (allDiagnoses) {
                var groups = groupDiagnoses(allDiagnoses, encounterUuid);
                _.each(groups, function (diagnosis, groupName) {
                    return Bahmni.DiagnosisMapper.update[groupName](diagnosis);
                });
                return groups;
            });
        };

        self.populateDiagnosisInformation = function (patientUuid, consultation) {
            return self.getPastAndCurrentDiagnoses(patientUuid, consultation.encounterUuid).then(function (groups) {
                return _.assign(consultation, groups);
            })
        };

        var isPastDiagnosis = function (diagnosis) {
            return diagnosis.diagnosisStatus != null;
        };

        var isActiveDiagnosis = function (diagnosis, currentEncounterUuid) {
            return diagnosis.encounterUuid !== currentEncounterUuid && diagnosis.diagnosisStatus == null;
        };

        var isCurrentEncounterDiagnosis = function (diagnosis, currentEncounterUuid) {
            return diagnosis.encounterUuid === currentEncounterUuid && diagnosis.diagnosisStatus == null;
        };

        var groupDiagnoses = function (allDiagnoses, encounterUuid) {
            var groups = _.groupBy(allDiagnoses, function (diagnosis) {
                if (isCurrentEncounterDiagnosis(diagnosis, encounterUuid)) return 'savedDiagnosesFromCurrentEncounter';
                if (isPastDiagnosis(diagnosis)) return 'pastDiagnoses';
                if (isActiveDiagnosis(diagnosis, encounterUuid)) return 'activeDiagnoses';
            });
            return {
                savedDiagnosesFromCurrentEncounter: groups.savedDiagnosesFromCurrentEncounter || [],
                activeDiagnoses: groups.activeDiagnoses || [],
                pastDiagnoses: groups.pastDiagnoses || []

            };
        };
    }]);