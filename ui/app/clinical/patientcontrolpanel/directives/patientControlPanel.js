'use strict';

angular.module('bahmni.common.patient')
.directive('patientControlPanel', ['$q', '$rootScope', '$stateParams', '$state', 'contextChangeHandler', 'encounterService', 'configurations', 'clinicalAppConfigService', '$bahmniCookieStore', '$translate',
    function ($q, $rootScope, $stateParams, $state, contextChangeHandler, encounterService, configurations, clinicalAppConfigService, $bahmniCookieStore, $translate) {
        var controller = function ($scope) {
            $scope.activeVisit = $scope.visitHistory.activeVisit;

            var DateUtil = Bahmni.Common.Util.DateUtil;
            var retrieveProviderCookieData = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
            };

            $scope.encounterProvider = retrieveProviderCookieData();

            $scope.isValidProvider = function () {
                return retrieveProviderCookieData() && retrieveProviderCookieData().value;
            };

            $scope.retrospectivePrivilege = Bahmni.Common.Constants.retrospectivePrivilege;
            $scope.encounterProviderPrivilege = Bahmni.Common.Constants.grantProviderAccess;

            $scope.today = DateUtil.getDateWithoutTime(DateUtil.now());

            $scope.getDashboardLink = function () {
                return "#/" + $stateParams.configName + "/patient/" + $scope.patient.uuid + "/dashboard";
            };

            $scope.changeContext = function ($event) {
                var allowContextChange = contextChangeHandler.execute()["allow"];

                if (!allowContextChange) {
                    $event.preventDefault();
                    return;
                }
                $rootScope.toggleControlPanel();
            };

            $scope.isCurrentVisit = function (visit) {
                return $stateParams.visitUuid === visit.uuid;
            };

            $scope.isInEditEncounterMode = function () {
                return $stateParams.encounterUuid !== undefined && $stateParams.encounterUuid !== 'active';
            };

            var getLinks = function () {
                var state = $state.current.name;
                if (state.match("patient.consultation")) {
                    return ([{text: $translate.instant('CONTROL_PANEL_DASHBOARD_TEXT'), icon: "btn-summary dashboard-btn", href: $scope.getDashboardLink()}]);
                } else {
                    var links = [];
                    if ($scope.activeVisit) {
                        links.push({text: $translate.instant('CONTROL_PANEL_CONSULTATION_TEXT'), icon: "btn-consultation dashboard-btn", href: "#" + clinicalAppConfigService.getConsultationBoardLink()});
                    } else if (state.match("patient.visit")) {
                        links.push({text: $translate.instant('CONTROL_PANEL_DASHBOARD_TEXT'), icon: "btn-summary dashboard-btn", href: "#/" + $stateParams.configName + "/patient/" + $scope.patient.uuid + "/dashboard"});
                    }
                    return links;
                }
            };

            $scope.links = getLinks();
            var cleanUpListenerStateChangeSuccess = $rootScope.$on('$stateChangeSuccess', function () {
                $scope.links = getLinks($state.current.name);
            });

            $scope.$on("$destroy", cleanUpListenerStateChangeSuccess);

            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });
        };

        return {
            restrict: 'E',
            templateUrl: 'patientcontrolpanel/views/controlPanel.html',
            controller: controller,
            scope: {
                patient: "=",
                visitHistory: "=",
                visit: "=",
                consultation: "="
            }
        };
    }]);
