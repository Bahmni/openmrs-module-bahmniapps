'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['$rootScope', '$q', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'authenticator', 'appService', 'encounterService', 'bedService', 'spinner', 'initialization', 'diagnosisService', 'patientVisitHistoryService',
    function ($rootScope, $q, configurationService, visitService, patientService, patientMapper, authenticator, appService, encounterService, bedService, spinner, initialization, diagnosisService, patientVisitHistoryService) {
        return function(patientUuid) {
            var getPatient = function() {
                return patientService.getPatient(patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                })
            };

            var getPatientBedDetails = function() {
                return bedService.getBedDetailsForPatient($rootScope.patient.uuid);
            };

            var getActiveEncounter = function() {
                var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                return encounterService.activeEncounter({
                    patientUuid : patientUuid,
                    encounterTypeUuid : $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid(),
                    providerUuid: currentProviderUuid,
                    includeAll :  Bahmni.Common.Constants.includeAllObservations
                }).success(function (encounterTransaction) {
                    $rootScope.consultation = new Bahmni.ConsultationMapper(
                        $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept).map(encounterTransaction);
                    $rootScope.disposition = encounterTransaction.disposition || {};
                });
            };

            var getPastDiagnoses = function() {
                return diagnosisService.getPastDiagnoses(patientUuid).success(function (response) {
                    var diagnosisMapper = new Bahmni.DiagnosisMapper();
                    $rootScope.allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                    $rootScope.consultation.pastDiagnoses = diagnosisMapper.mapPastDiagnosis($rootScope.allDiagnoses, $rootScope.consultation.encounterUuid);
                    $rootScope.consultation.savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter($rootScope.allDiagnoses, $rootScope.consultation.encounterUuid);
                });
            };

            var getPatientVisitHistory = function () {
                patientVisitHistoryService.getVisits(patientUuid).then(function (visits) {
                    $rootScope.visits = visits.map(function (visitData) {
                        return new Bahmni.Clinical.VisitHistoryEntry(visitData)
                    });
                    $rootScope.activeVisit = $rootScope.visits.filter(function (visit) {
                        return visit.isActive();
                    })[0];

                    encounterService.search($rootScope.activeVisit.uuid).success(function (encounterTransactions) {
                        var obsIgnoreList = appService.getAppDescriptor().getConfig("obsIgnoreList").value || {};
                        $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, obsIgnoreList, $rootScope.activeVisit.uuid);
                    });
                });
            };

            $rootScope.showControlPanel = false;
            $rootScope.toggleControlPanel = function () {
                $rootScope.showControlPanel = !$rootScope.showControlPanel;
            };

            return spinner.forPromise(
                initialization.then(function(){
                    return $q.all([getActiveEncounter().then(getPastDiagnoses),getPatient().then(getPatientBedDetails),getPatientVisitHistory()]);
                })
            );
        }
    }]
);
