'use strict';

angular.module('bahmni.clinical').controller('ConsultationController',
    ['$scope', '$rootScope', '$state','$location', 'clinicalAppConfigService', 'diagnosisService', 'urlHelper', 'contextChangeHandler',
        'spinner', 'encounterService', 'messagingService', 'sessionService', 'retrospectiveEntryService', 'patientContext', 'consultationContext', '$q',
        'patientVisitHistoryService', '$stateParams', '$window', 'visitHistory', 'clinicalDashboardConfig','appService','ngDialog','$filter', 'configurations',
        function ($scope, $rootScope, $state, $location, clinicalAppConfigService, diagnosisService, urlHelper, contextChangeHandler,
                  spinner, encounterService, messagingService, sessionService, retrospectiveEntryService, patientContext, consultationContext, $q,
                  patientVisitHistoryService, $stateParams, $window, visitHistory, clinicalDashboardConfig, appService, ngDialog, $filter, configurations) {
            $scope.patient = patientContext.patient;

            $scope.stateChange = function(){
                return $state.current.name === 'patient.dashboard.show'
            };

            $scope.visitHistory = visitHistory;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.clinicalDashboardConfig = clinicalDashboardConfig;

            $scope.openConsultationInNewTab = function () {
                $window.open('#' + $scope.consultationBoardLink, '_blank');
            };

            $scope.showDashboard = function (dashboard) {
                if (!clinicalDashboardConfig.isCurrentTab(dashboard)) {
                    $scope.$parent.$parent.$broadcast("event:switchDashboard", dashboard);
                }
            };

            $scope.printDashboard = function () {
                $scope.$parent.$parent.$broadcast("event:printDashboard", clinicalDashboardConfig.currentTab.printing);
            };

            $scope.allowConsultation = function(){
                return appService.getAppDescriptor().getConfigValue('allowConsultationWhenNoOpenVisit');
            };

            $scope.closeDashboard = function (dashboard) {
                clinicalDashboardConfig.closeTab(dashboard);
                $scope.$parent.$parent.$broadcast("event:switchDashboard", clinicalDashboardConfig.currentTab);
            };

            $scope.closeAllDialogs = function() {
                ngDialog.closeAll();
            };



            $scope.availableBoards = [];
            $scope.configName = $stateParams.configName;

            $scope.getTitle = function(board){
                return $filter('titleTranslate')(board);
            };

            $scope.showBoard = function (board) {
                $rootScope.collapseControlPanel();
                return buttonClickAction(findBoard(board));
            };

            var findBoard = function(boardDetail){
                var board = findBoardByTranslationKey(boardDetail);
                if(!board){
                    board = findBoardByTitle(boardDetail);
                }
                return board;
            };

            var findBoardByTranslationKey = function(boardDetail){
                if(boardDetail.translationKey){
                    return _.find($scope.availableBoards,{translationKey: boardDetail.translationKey});
                }
                return null;
            };

            var findBoardByTitle = function(boardDetail){
                return _.find($scope.availableBoards,{label: boardDetail.label});
            };

            $scope.gotoPatientDashboard = function () {
                if (contextChangeHandler.execute()["allow"]) {
                    var params = {configName: $scope.configName, patientUuid: patientContext.patient.uuid, encounterUuid: undefined};
                    if($scope.dashboardDirty) {
                        params['dashboardCachebuster'] = Math.random();
                    }
                    $state.go("patient.dashboard.show", params);
                }
            };

            $scope.isLongerName = function (value) {
                return value ? value.length > 18 : false;
            };

            $scope.getShorterName = function (value) {
                return $scope.isLongerName(value) ? value.substring(0, 15) + "..." : value;
            };

            $scope.isInEditEncounterMode = function(){
                return $stateParams.encounterUuid !== undefined && $stateParams.encounterUuid !== 'active';
            };

            var setCurrentBoardBasedOnPath = function () {
                var currentPath = $location.path();
                var board = _.find($scope.availableBoards,function (board) {
                    return _.contains(currentPath, board.url);
                });
                $scope.currentBoard = board || $scope.availableBoards[0];
            };


            var initialize = function () {
                var appExtensions = clinicalAppConfigService.getAllConsultationBoards();
                $scope.availableBoards = $scope.availableBoards.concat(appExtensions);
                setCurrentBoardBasedOnPath();
            };

            $scope.$on('$stateChangeStart', function () {
                setCurrentBoardBasedOnPath();
            });


            var getUrl = function (board) {
                var urlPrefix = urlHelper.getPatientUrl();
                var url = "/" + $stateParams.configName + (board.url ? urlPrefix + "/" + board.url : urlPrefix);
                var queryParams = []
                if($state.params.encounterUuid) {
                    queryParams.push("encounterUuid="+$state.params.encounterUuid);
                }
                if($state.params.programUuid) {
                    queryParams.push("programUuid="+$state.params.programUuid);
                }
                if(!_.isEmpty(queryParams)) {
                    url = url + "?" + queryParams.join("&");
                }

                $scope.lastConsultationTabUrl.url = url;
                return $location.url(url);
            };

            $scope.openConsultation = function() {
                $scope.closeAllDialogs();
                $scope.collapseControlPanel();
                switchToConsultationTab();
            };

            var switchToConsultationTab = function() {
                if($scope.lastConsultationTabUrl.url) {
                    $location.url($scope.lastConsultationTabUrl.url);
                } else {
                    //Default tab
                    getUrl($scope.availableBoards[0]);
                }
            };

            var contextChange = function () {
                return contextChangeHandler.execute();
            };

            var buttonClickAction = function (board) {
                if ($scope.currentBoard === board) return;
                if(!isFormValid()) return;

                contextChangeHandler.reset();
                $scope.currentBoard = board;
                return getUrl(board);
            };

            var preSavePromise = function () {
                var deferred = $q.defer();

                var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
                $scope.consultation.preSaveHandler.fire();
                var tempConsultation = angular.copy($scope.consultation);
                tempConsultation.observations = observationFilter.filter(tempConsultation.observations);
                tempConsultation.consultationNote = observationFilter.filter([tempConsultation.consultationNote])[0];
                tempConsultation.labOrderNote = observationFilter.filter([tempConsultation.labOrderNote])[0];
                var visitTypeForRetrospectiveEntries = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries();
                var defaultVisitType = clinicalAppConfigService.getDefaultVisitType();
                var hasActiveVisit = patientVisitHistoryService.getVisitHistory().activeVisit;
                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(tempConsultation, $scope.patient, sessionService.getLoginLocationUuid(), retrospectiveEntryService.getRetrospectiveEntry(),
                    visitTypeForRetrospectiveEntries, defaultVisitType, hasActiveVisit, $scope.isInEditEncounterMode());
                deferred.resolve(encounterData);
                return deferred.promise;
            };

            var isFormValid = function(){
                var contxChange = contextChange();
                var shouldAllow = contxChange["allow"];
                if (!shouldAllow) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                    messagingService.showMessage('formError', errorMessage);
                }
                return shouldAllow;
            };

            $scope.save = function () {
                if (!isFormValid()) return;
                spinner.forPromise($q.all([preSavePromise(), encounterService.getEncounterType($state.params.programUuid)]).then(function (results) {
                    var encounterData = results[0];
                    encounterData.encounterTypeUuid = results[1].uuid;
                    var params = angular.copy($state.params);
                    params.cachebuster = Math.random();
                    return encounterService.create(encounterData)
                        .then(function (saveResponse) {
                            var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                                configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(), configurations.stoppedOrderReasonConfig());
                            return consultationMapper.map(saveResponse.data);
                        })
                        .then(function (savedConsulation) {
                            messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                            spinner.forPromise(diagnosisService.populateDiagnosisInformation($scope.patient.uuid, savedConsulation)
                                .then(function (consultationWithDiagnosis) {
                                    consultationWithDiagnosis.preSaveHandler = $scope.consultation.preSaveHandler;
                                    $scope.$parent.consultation = consultationWithDiagnosis;
                                    $scope.dashboardDirty = true;
                                    return $state.transitionTo($state.current, params, {
                                        inherit: false,
                                        notify: true
                                    });
                                }));
                        }).catch(function (error) {
                            var message = Bahmni.Clinical.Error.translate(error) || "{{'CLINICAL_SAVE_FAILURE_MESSAGE_KEY' | translate}}";
                            messagingService.showMessage('formError', message);
                        })
                }));
            };

            initialize();
        }]);
