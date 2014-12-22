'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['$rootScope', '$q', 'configurationService', 'patientService', 'authenticator', 'clinicalConfigService', 'encounterService', 
        'bedService', 'spinner', 'initialization', 'diagnosisService', 'patientVisitHistoryService', 'urlHelper','sessionService', 'conceptSetUiConfigService',
    function ($rootScope, $q, configurationService, patientService, authenticator, clinicalConfigService, encounterService,
              bedService, spinner, initialization, diagnosisService, patientVisitHistoryService, urlHelper, sessionService, conceptSetUiConfigService) {

        var patientMapper = new Bahmni.PatientMapper($rootScope.patientConfig);

        return function(patientUuid) {
            var getPatient = function() {
                return patientService.getPatient(patientUuid).then(function (openMRSPatientResponse) {
                    $rootScope.patient = patientMapper.map(openMRSPatientResponse.data);
                })
            };

            var getPatientBedDetails = function() {
                return bedService.getBedDetailsForPatient($rootScope.patient.uuid);
            };

            var getActiveEncounter = function() {
                var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                var consultationMapper = new Bahmni.ConsultationMapper($rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept);
                return encounterService.activeEncounter({
                    patientUuid : patientUuid,
                    providerUuid: currentProviderUuid,
                    includeAll :  Bahmni.Common.Constants.includeAllObservations,
                    locationUuid: sessionService.getLoginLocationUuid()
                }).then(function (encounterTransactionResponse) {
                    $rootScope.consultation = consultationMapper.map(encounterTransactionResponse.data);
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
                return patientVisitHistoryService.getVisits(patientUuid).then(function (visits) {
                    $rootScope.visits = visits.map(function (visitData) {
                        return new Bahmni.Clinical.VisitHistoryEntry(visitData)
                    });
                    $rootScope.activeVisit = $rootScope.visits.filter(function (visit) {
                        return visit.isActive();
                    })[0];
                });
            };

            var getActiveVisitData = function(){
                if($rootScope.activeVisit){
                    return encounterService.search($rootScope.activeVisit.uuid).then(function (encounterTransactionsResponse) {
                        var obsIgnoreList = clinicalConfigService.getObsIgnoreList();
                        $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept,$rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, obsIgnoreList, $rootScope.activeVisit.uuid, conceptSetUiConfigService.getConfig());
                    });
                }
            };

            var findDefaultConsultationBoard = function() {
                var appExtensions = clinicalConfigService.getAllConsultationBoards();
                var defaultBoard = _.find(appExtensions, 'default');
                $rootScope.consultationBoardLink = function() {return urlHelper.getConsultationUrl()};
                if(defaultBoard) {
                    $rootScope.consultationBoardLink = function() {return urlHelper.getPatientUrl() + "/" + defaultBoard.url};
                }
                return $q.when({});
            };

            var addSaveHandlers = function() {
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
                initialization.then(function(){
                    return $q.all([findDefaultConsultationBoard().then(getActiveEncounter).then(getPastDiagnoses).then(addSaveHandlers), getPatient().then(getPatientBedDetails), getPatientVisitHistory().then(getActiveVisitData)]);
                })
            );
        }
    }]
);
