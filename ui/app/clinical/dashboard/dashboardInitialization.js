'use strict';

angular.module('bahmni.clinical').factory('dashboardInitialization',
    ['$rootScope', '$q', 'clinicalAppConfigService', 'encounterService',
        'spinner', 'initialization', 'patientVisitHistoryService',
        'conceptSetUiConfigService', 'configurations', 'urlHelper',
        function ($rootScope, $q, clinicalAppConfigService, encounterService, spinner, initialization, patientVisitHistoryService, conceptSetUiConfigService, configurations, urlHelper) {

            return function (patientUuid) {

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

                var getActiveVisitData = function () {
                    if ($rootScope.activeVisit) {
                        return encounterService.search($rootScope.activeVisit.uuid).then(function (encounterTransactionsResponse) {
                            var obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
                            $rootScope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data,
                                configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(),
                                configurations.encounterConfig(),
                                configurations.allTestsAndPanelsConcept(), obsIgnoreList, $rootScope.activeVisit.uuid, conceptSetUiConfigService.getConfig());
                        });
                    }
                };

                var findDefaultConsultationBoard = function () {
                    var appExtensions = clinicalAppConfigService.getAllConsultationBoards();
                    var defaultBoard = _.find(appExtensions, 'default');
                    $rootScope.consultationBoardLink = function () {
                        return urlHelper.getConsultationUrl()
                    };
                    if (defaultBoard) {
                        $rootScope.consultationBoardLink = function () {
                            return urlHelper.getPatientUrl() + "/" + defaultBoard.url
                        };
                    }
                    return $q.when({});
                };

                $rootScope.showControlPanel = false;
                $rootScope.toggleControlPanel = function () {
                    $rootScope.showControlPanel = !$rootScope.showControlPanel;
                };

                $rootScope.collapseControlPanel = function () {
                    $rootScope.showControlPanel = false;
                };

                return spinner.forPromise(initialization.then(function () {
                    return $q.all([findDefaultConsultationBoard().then(getPatientVisitHistory().then(getActiveVisitData()))]);
                }));
            }
        }]
);
