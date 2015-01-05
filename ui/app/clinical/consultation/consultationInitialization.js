'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['$rootScope', '$q', 'encounterService', 'bedService',
        'spinner', 'initialization', 'diagnosisService', 'sessionService', 'configurations',
        function ($rootScope, $q, encounterService, bedService, spinner, initialization, diagnosisService, sessionService, configurations) {

            return function (patientUuid) {

                var getPatientBedDetails = function () {
                    return bedService.getBedDetailsForPatient(patientUuid);
                };

                var getActiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                        configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());
                    return encounterService.activeEncounter({
                        patientUuid: patientUuid,
                        providerUuid: currentProviderUuid,
                        includeAll: Bahmni.Common.Constants.includeAllObservations,
                        locationUuid: sessionService.getLoginLocationUuid()
                    }).then(function (encounterTransactionResponse) {
                            $rootScope.consultation = consultationMapper.map(encounterTransactionResponse.data);
                        });
                };

                var getPastDiagnoses = function () {
                    return diagnosisService.getPastDiagnoses(patientUuid).success(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper();
                        var allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                        $rootScope.consultation.pastDiagnoses = diagnosisMapper.mapPastDiagnosis(allDiagnoses, $rootScope.consultation.encounterUuid);
                        $rootScope.consultation.savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter(allDiagnoses, $rootScope.consultation.encounterUuid);
                    });
                };

                var addSaveHandlers = function () {
                    // TODO : rename this to preSaveHandler
                    $rootScope.consultation.saveHandler = new Bahmni.Clinical.SaveHandler();
                    $rootScope.consultation.postSaveHandler = new Bahmni.Clinical.SaveHandler();
                };

                $rootScope.showControlPanel = false;
                $rootScope.toggleControlPanel = function () {
                    $rootScope.showControlPanel = !$rootScope.showControlPanel;
                };

                $rootScope.collapseControlPanel = function () {
                    $rootScope.showControlPanel = false;
                };

                return spinner.forPromise(
                    initialization.then(function () {
                        return $q.all([getActiveEncounter().then(getPastDiagnoses).then(addSaveHandlers), getPatientBedDetails]);
                    })
                );
            }
        }]
);
