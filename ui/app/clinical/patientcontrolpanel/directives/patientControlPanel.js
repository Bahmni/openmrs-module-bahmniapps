'use strict';

angular.module('bahmni.common.patient')
.directive('patientControlPanel', ['$q', '$rootScope', '$stateParams', '$state', 'contextChangeHandler', 'encounterService', 'visitActionsService', 'configurations', 'clinicalAppConfigService',
        function($q, $rootScope, $stateParams, $state, contextChangeHandler, encounterService, visitActionsService, configurations, clinicalAppConfigService) {
            
    var controller = function ($scope) {

        $scope.activeVisit = $scope.visitHistory.activeVisit;

        var DateUtil = Bahmni.Common.Util.DateUtil;
        $scope.retrospectivePrivilege = Bahmni.Common.Constants.retrospectivePrivilege;

        $scope.today = DateUtil.getDateWithoutTime(DateUtil.now());

        $scope.getDashboardLink = function() {
            return "#/patient/" + $scope.patient.uuid + "/dashboard";
        };

        $scope.changeContext = function($event) {
            var allowContextChange = contextChangeHandler.execute()["allow"];

            if(!allowContextChange) {
                $event.preventDefault();
                return;
            }
            $rootScope.toggleControlPanel();
        };
        
        $scope.isCurrentVisit = function (visit) {
            return $stateParams.visitUuid === visit.uuid;
        };

        var getLinks = function () {
            var state = $state.current.name;
            if (state.match("patient.consultation")) {
                return appendPrintLinks([
                    {text: "Dashboard", icon: "btn-summary dashboard-btn", href: $scope.getDashboardLink()}
                ]);
            } else {
                var links = [];
                if ($scope.activeVisit) {
                    links.push({text: "Consultation", icon: "btn-consultation dashboard-btn", href: "#" + clinicalAppConfigService.getConsultationBoardLink()});
                }
                if (state.match("patient.dashboard")) {
                    links.push({text: "Trends", icon: "btn-trends dashboard-btn", href: "../trends/#/patients/" + $scope.patient.uuid});
                } else if (state.match("patient.visit")) {
                    links.push({text: "Dashboard", icon: "btn-summary dashboard-btn", href: "#/patient/" + $scope.patient.uuid + "/dashboard"});
                    links = appendPrintLinks(links);
                }
                return links;
            }
        };

        var getStartDateTime = function () {
            return $scope.visitHistory.visits.filter(function (visit) {
                return visit.uuid === $scope.visit.uuid;
            })[0].startDatetime;
        };

        var appendPrintLinks = function(links) {
            if ($scope.visit) {
                links.push({text: "Visit Summary", icon: "btn-print dashboard-btn", onClick: function($event) {
                    visitActionsService.printVisitSummary($scope.patient, $scope.visit, getStartDateTime());
                    $event.preventDefault();
                }});

                links.push({text: "OPD Summary (For Admit)", icon: "btn-print dashboard-btn", onClick: function($event) {
                    visitActionsService.printOpdSummary($scope.patient, $scope.visit, getStartDateTime());
                    $event.preventDefault();
                }});

                if($scope.visit.hasAdmissionEncounter()) {
                    links.push({text: "Discharge Summary", icon: "btn-print dashboard-btn", onClick: function($event) {
                        visitActionsService.printDischargeSummary($scope.patient, $scope.visit);
                        $event.preventDefault();
                    }});
                }
            }
            return links;
        };

        $scope.links = getLinks();
        $rootScope.$on('$stateChangeSuccess', function() {
            $scope.links = getLinks($state.current.name);
        });

        var encounterTypeUuid =  configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
        $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function(response) {
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
            visit: "="
        }
    }
}]);