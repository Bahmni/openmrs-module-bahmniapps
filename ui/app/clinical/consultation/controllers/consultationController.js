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

            $scope.showBoard = function (boardIndex) {
                $rootScope.collapseControlPanel();
                return buttonClickAction($scope.availableBoards[boardIndex]);
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
                var currentPath = $location.url();
                var board = _.find($scope.availableBoards,function (board) {
                    if(board.url === "treatment") {
                        return _.includes(currentPath, board.extensionParams ? board.extensionParams.tabConfigName: board.url)
                    }
                    return _.includes(currentPath, board.url);
                });
                if(board) {
                    $scope.currentBoard = board;
                    $scope.currentBoard.isSelectedTab = true;
                }
            };


            var initialize = function () {
                var appExtensions = clinicalAppConfigService.getAllConsultationBoards();
                $scope.availableBoards = $scope.availableBoards.concat(appExtensions);
                $scope.showSaveConfirmDialogConfig = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
                setCurrentBoardBasedOnPath();
            };

            $scope.shouldDisplaySaveConfirmDialogForStateChange = function(toState, toParams, fromState) {
                if((toState.name === fromState.name) && (fromState.name === "patient.dashboard.show")) {
                    return true;
                }

                if (toState.name.match(/patient.dashboard.show.*/)) {
                    return false;
                }
                return true;
            };

            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams ) {
                if ($scope.showSaveConfirmDialogConfig) {
                    if ($rootScope.hasVisitedConsultation && $scope.shouldDisplaySaveConfirmDialogForStateChange(toState, toParams, fromState, fromParams)) {
                        if (!$scope.stateChangeTriggedByDialog) {
                            $scope.stateChangeTriggedByDialog = true;
                            event.preventDefault();
                            spinner.hide(toState.spinnerToken);
                            $scope.toState = toState;
                            $scope.toParams = toParams;
                            $scope.displayConfirmationDialog();
                        }
                    }
                }
                setCurrentBoardBasedOnPath();
            });


            $scope.displayConfirmationDialog = function (event) {
                if ($rootScope.hasVisitedConsultation && $scope.showSaveConfirmDialogConfig) {
                    if (event) {
                        event.preventDefault();
                        $scope.targetUrl = event.currentTarget.getAttribute('href');
                    }
                    ngDialog.openConfirm({template: 'consultation/views/saveConfirmation.html', scope: $scope});
                }
            };

            $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
                $scope.stateChangeTriggedByDialog = false;
                if (toState.name.match(/patient.dashboard.show.+/)) {
                    $rootScope.hasVisitedConsultation = true;
                    if($scope.showSaveConfirmDialogConfig) {
                        $rootScope.$broadcast("event:pageUnload");
                    }
                }
                if ((toState.name === fromState.name) && (fromState.name === "patient.dashboard.show")) {
                    $rootScope.hasVisitedConsultation = false;
                }
            });

            $scope.cancelTransition = function() {
                $scope.stateChangeTriggedByDialog = false;
                ngDialog.close();
                delete $scope.targetUrl;
            };

            $scope.saveAndContinue = function() {
                ngDialog.close();
                $state.current = $scope.toState || $state.current;
                $state.params = $scope.toParams || $state.params;
                $scope.save(true);
                $window.onbeforeunload = null;
            };

            $scope.continueWithoutSaving = function() {
                ngDialog.close();
                if ($scope.targetUrl) {
                    $window.open($scope.targetUrl, "_self");
                }
                $window.onbeforeunload = null;
                $state.go($scope.toState, $scope.toParams);
            };

            var getUrl = function (board) {
                var urlPrefix = urlHelper.getPatientUrl();
                var url = "/" + $stateParams.configName + (board.url ? urlPrefix + "/" + board.url : urlPrefix);
                var queryParams = [];
                if($state.params.encounterUuid) {
                    queryParams.push("encounterUuid="+$state.params.encounterUuid);
                }
                if($state.params.programUuid) {
                    queryParams.push("programUuid="+$state.params.programUuid);
                }

                if($state.params.enrollment) {
                    queryParams.push("enrollment="+$state.params.enrollment);
                }

                if($state.params.dateEnrolled) {
                    queryParams.push("dateEnrolled="+$state.params.dateEnrolled);
                }

                if($state.params.dateCompleted) {
                    queryParams.push("dateCompleted="+$state.params.dateCompleted);
                }


                var extensionParams = board.extensionParams;
                angular.forEach(extensionParams, function(extensionParamValue, extensionParamKey){
                    queryParams.push(extensionParamKey + "=" + extensionParamValue)
                });

                if(!_.isEmpty(queryParams)) {
                    url = url + "?" + queryParams.join("&");
                }

                $scope.lastConsultationTabUrl.url = url;
                return $location.url(url);
            };

            $scope.openConsultation = function() {
                if($scope.showSaveConfirmDialogConfig){
                    $rootScope.$broadcast("event:pageUnload");
                }
                $scope.closeAllDialogs();
                $scope.collapseControlPanel();
                $rootScope.hasVisitedConsultation = true;
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
                if ($scope.currentBoard === board) {
                    return;
                }
                if(!isFormValid()) {
                    $scope.$parent.$parent.$broadcast("event:errorsOnForm");
                    return;
                }

                contextChangeHandler.reset();
                _.map($scope.availableBoards, function(board){
                    board.isSelectedTab = false;
                });

                $scope.currentBoard = board;
                $scope.currentBoard.isSelectedTab = true;
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
                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(tempConsultation, $scope.patient, sessionService.getLoginLocationUuid(), retrospectiveEntryService.getRetrospectiveEntry(),
                    visitTypeForRetrospectiveEntries, defaultVisitType, $scope.isInEditEncounterMode(), $state.params.enrollment );
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

            $scope.save = function (shouldReloadPage) {
                if (!isFormValid()) {
                    $scope.$parent.$parent.$broadcast("event:errorsOnForm");
                    return;
                }
                return spinner.forPromise($q.all([preSavePromise(), encounterService.getEncounterType($state.params.programUuid, sessionService.getLoginLocationUuid())]).then(function (results) {
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
                                    if($scope.targetUrl) {
                                        return $window.open($scope.targetUrl, "_self");
                                    }
                                    return $state.transitionTo($state.current, params, {
                                        inherit: false,
                                        notify: true,
                                        reload: shouldReloadPage
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
