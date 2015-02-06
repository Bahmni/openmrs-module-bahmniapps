'use strict';

angular.module('bahmni.clinical').controller('ConsultationController',
    ['$scope', '$rootScope', '$state', '$location', 'clinicalAppConfigService', 'urlHelper', 'contextChangeHandler', 
        'spinner', 'encounterService', 'messagingService', 'sessionService', 'retrospectiveEntryService', 'patientContext', 'consultationContext',
        function ($scope, $rootScope, $state, $location, clinicalAppConfigService, urlHelper, contextChangeHandler, 
                  spinner, encounterService, messagingService, sessionService, retrospectiveEntryService, patientContext, consultationContext) {
            $scope.patient = patientContext.patient;
            $scope.consultation = consultationContext;

            var boardTypes = {
                consultation: 'consultation'
            };
            $scope.availableBoards = [ ];

            $scope.showBoard = function (label) {
                $rootScope.collapseControlPanel();
                var board = findBoardByLabel(label);
                return buttonClickAction(board);
            };

            $scope.gotoPatientDashboard = function () {
                $location.path("/patient/" + patientContext.patient.uuid + "/dashboard");
            };

            var setCurrentBoardBasedOnPath = function () {
                var currentPath = $location.path();
                var board = findBoardByUrl(currentPath);
                $scope.currentBoard = board || $scope.availableBoards[0];
            };

            var stringContains = function (sourceString, pattern) {
                return (sourceString.search(pattern) >= 0);
            };

            var initialize = function () {
                var appExtensions = clinicalAppConfigService.getAllConsultationBoards();
                $scope.availableBoards = $scope.availableBoards.concat(appExtensions);
                setCurrentBoardBasedOnPath();
            };

            $scope.$on('$stateChangeStart', function () {
                setCurrentBoardBasedOnPath();
            });

            var findBoardByLabel = function (label) {
                var boards = $scope.availableBoards.filter(function (board) {
                    return board.label === label;
                });
                return boards.length > 0 ? boards[0] : null;
            };

            var findBoardByUrl = function (url) {
                var boards = $scope.availableBoards.filter(function (board) {
                    return stringContains(url, board.url);
                });
                return boards.length > 0 ? boards[0] : null;
            };

            var getUrl = function (board) {
                var urlPrefix = urlHelper.getPatientUrl();
                var url = board.url ? urlPrefix + "/" + board.url : urlPrefix;
                return $location.url(url);
            };

            var contextChange = function () {
                return contextChangeHandler.execute();
            };

            var buttonClickAction = function (board) {
                if ($scope.currentBoard === board) return;

                var contextChangeResponse = contextChange();
                if (!contextChangeResponse["allow"]) {
                    if (contextChangeResponse["errorMessage"]) {
                        messagingService.showMessage('formError', contextChangeResponse["errorMessage"]);
                    }
                    return;
                }
                contextChangeHandler.reset();
                $scope.currentBoard = board;
                console.log($scope.currentBoard);
                return getUrl(board);
            };

            $scope.save = function () {
                var contxChange = contextChange();
                var allowContextChange = contxChange["allow"];
                if (!allowContextChange) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "Please correct errors in the form. Information not saved";
                    messagingService.showMessage('formError', errorMessage);
                    return;
                }

                var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
                $scope.consultation.saveHandler.fire();
                var tempConsultation = angular.copy($scope.consultation);
                tempConsultation.observations = observationFilter.filter(tempConsultation.observations);
                tempConsultation.consultationNote = observationFilter.filter([tempConsultation.consultationNote])[0];
                tempConsultation.labOrderNote = observationFilter.filter([tempConsultation.labOrderNote])[0];

                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(tempConsultation, $scope.patient, sessionService.getLoginLocationUuid(), retrospectiveEntryService.getRetrospectiveEntry());

                spinner.forPromise(encounterService.create(encounterData).then(function () {
                    $state.transitionTo($state.current, $state.params, {
                        reload: true,
                        inherit: false,
                        notify: true
                    }).then(function () {
                            messagingService.showMessage('info', 'Saved');
                        });
                }).catch(function (error) {
                        var message = Bahmni.Clinical.Error.translate(error) || 'An error has occurred on the server. Information not saved.';
                        messagingService.showMessage('formError', message);
                    }));
            };

            initialize();
        }]);
