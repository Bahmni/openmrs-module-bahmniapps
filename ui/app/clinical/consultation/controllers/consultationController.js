'use strict';

angular.module('bahmni.clinical').controller('ConsultationController',
    ['$scope', '$rootScope', '$state', '$location', 'clinicalAppConfigService', 'urlHelper', 'contextChangeHandler',
        'spinner', 'encounterService', 'messagingService', 'sessionService', 'retrospectiveEntryService', 'patientContext', 'consultationContext', '$q','patientVisitHistoryService',
        function ($scope, $rootScope, $state, $location, clinicalAppConfigService, urlHelper, contextChangeHandler,
                  spinner, encounterService, messagingService, sessionService, retrospectiveEntryService, patientContext, consultationContext, $q, patientVisitHistoryService) {
            $scope.patient = patientContext.patient;
            $scope.consultation = consultationContext;

            $scope.availableBoards = [];

            $scope.showBoard = function (label) {
                $rootScope.collapseControlPanel();
                var board = _.find($scope.availableBoards,{label:label});
                return buttonClickAction(board);
            };

            $scope.gotoPatientDashboard = function () {
                if (contextChangeHandler.execute()["allow"]) {
                    $location.path("/patient/" + patientContext.patient.uuid + "/dashboard");
                }
            };

            $scope.isLongerName = function (value) {
                return value ? value.length > 18 : false;
            };

            $scope.getShorterName = function (value) {
                return $scope.isLongerName(value) ? value.substring(0, 15) + "..." : value;
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
                var url = board.url ? urlPrefix + "/" + board.url : urlPrefix;
                url = url + "?encounterUuid=" + $state.params.encounterUuid;
                return $location.url(url);
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
                var isThereAnError = contxChange["allow"];
                if (!isThereAnError) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "Please correct errors in the form. Information not saved";
                    messagingService.showMessage('formError', errorMessage);
                }
                return isThereAnError;
            };
            $scope.save = function () {
                if(!isFormValid()) return;

                spinner.forPromise(preSavePromise().then(function (encounterData) {
                    return encounterService.create(encounterData).then(function () {
                        return $state.transitionTo($state.current, $state.params, {
                            reload: true,
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
