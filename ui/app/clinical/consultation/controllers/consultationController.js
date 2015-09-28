'use strict';

angular.module('bahmni.clinical').controller('ConsultationController',
    ['$scope', '$rootScope', '$state', '$location', 'clinicalAppConfigService', 'urlHelper', 'contextChangeHandler',
        'spinner', 'encounterService', 'messagingService', 'sessionService', 'retrospectiveEntryService', 'patientContext', 'consultationContext', '$q',
        'patientVisitHistoryService', '$stateParams', '$window', 'visitHistory', 'clinicalDashboardConfig','appService','ngDialog',
        function ($scope, $rootScope, $state, $location, clinicalAppConfigService, urlHelper, contextChangeHandler,
                  spinner, encounterService, messagingService, sessionService, retrospectiveEntryService, patientContext, consultationContext, $q,
                  patientVisitHistoryService, $stateParams, $window, visitHistory, clinicalDashboardConfig, appService, ngDialog) {
            $scope.patient = patientContext.patient;
            $scope.consultation = consultationContext;


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

            $scope.showBoard = function (label) {
                $rootScope.collapseControlPanel();
                var board = _.find($scope.availableBoards,{label:label});
                return buttonClickAction(board);
            };

            $scope.gotoPatientDashboard = function () {
                if (contextChangeHandler.execute()["allow"]) {
                    $state.go("patient.dashboard.show", {configName: $scope.configName, patientUuid: patientContext.patient.uuid, encounterUuid: "active"});
                }
            };

            $scope.isLongerName = function (value) {
                return value ? value.length > 18 : false;
            };

            $scope.getShorterName = function (value) {
                return $scope.isLongerName(value) ? value.substring(0, 15) + "..." : value;
            };

            $scope.editEncounterClass = function(){
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

                $scope.lastConsultationTabUrl = url;
                return $location.url(url);
            };

            $scope.openConsultation = function() {
                $scope.closeAllDialogs();
                $scope.collapseControlPanel();
                switchToConsultationTab();
            };

            var switchToConsultationTab = function() {
                if($scope.lastConsultationTabUrl) {
                    $location.url($scope.lastConsultationTabUrl);
                } else {
                    //Default tab
                    $state.go("patient.dashboard.show.observations", {patientUuid: $scope.patient.uuid, programUuid: $state.params.programUuid, conceptSetGroupName: 'observations'});
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
                $scope.consultation.saveHandler.fire();
                var tempConsultation = angular.copy($scope.consultation);
                tempConsultation.observations = observationFilter.filter(tempConsultation.observations);
                tempConsultation.consultationNote = observationFilter.filter([tempConsultation.consultationNote])[0];
                tempConsultation.labOrderNote = observationFilter.filter([tempConsultation.labOrderNote])[0];
                var visitTypeForRetrospectiveEntries = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries();
                var defaultVisitType = clinicalAppConfigService.getDefaultVisitType();
                var hasActiveVisit = patientVisitHistoryService.getVisitHistory().activeVisit;

                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(tempConsultation, $scope.patient, sessionService.getLoginLocationUuid(), retrospectiveEntryService.getRetrospectiveEntry(), visitTypeForRetrospectiveEntries, defaultVisitType, hasActiveVisit);
                deferred.resolve(encounterData);
                return deferred.promise;
            };

            var isFormValid = function(){
                var contxChange = contextChange();
                var shouldAllow = contxChange["allow"];
                if (!shouldAllow) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "Please correct errors in the form. Information not saved";
                    messagingService.showMessage('formError', errorMessage);
                }
                return shouldAllow;
            };

            $scope.save = function () {
                if (!isFormValid()) return;
                spinner.forPromise($q.all([preSavePromise(), encounterService.getEncounterType($state.params.programUuid)]).then(function (results) {
                   var encounterData = results[0];
                    encounterData.encounterTypeUuid = results[1].uuid;
                    return encounterService.create(encounterData).then(function () {
                        $scope.dashboardState.stale = true;
                        return $state.transitionTo($state.current, $state.params, {
                            inherit: false,
                            notify: true
                        }).then(function () {
                            messagingService.showMessage('info', 'Saved');
                        });
                    }).catch(function (error) {
                        var message = Bahmni.Clinical.Error.translate(error) || 'An error has occurred on the server. Information not saved.';
                        messagingService.showMessage('formError', message);
                    })
                }));
            };

            initialize();
        }]);
