'use strict';

angular.module('bahmni.common.patient')
.directive('patientControlPanel', ['$q', '$rootScope', '$location', '$stateParams', '$state', 'contextChangeHandler', 'encounterService', 'visitActionsService', 'urlHelper', 'spinner', function($q, $rootScope, $location, $stateParams, $state, contextChangeHandler, encounterService, visitActionsService, urlHelper, spinner) {
    var controller = function($scope) {
        $scope.getPatientDocuments = function () {
            var encounterTypeUuid = $rootScope.encounterConfig.getPatientDocumentEncounterTypeUuid();
            var promise = encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid);
            return spinner.forPromise(promise);
        };
    };

    var link = function($scope) {
        $scope.patient = $rootScope.patient;
        $scope.visits = $rootScope.visits;

        $scope.activeVisit = (function (){
            return $scope.visits.filter(function(visit) {
                return visit.isActive();
            })[0];
        })();


        $scope.getConsultationPadLink = function () {
            if ($scope.activeVisit) {
                return urlHelper.getVisitUrl($scope.activeVisit.uuid);
            } else {
                return urlHelper.getConsultationUrl();
            }
        };

        $scope.changeContext = function($event) {
            if(!contextChangeHandler.execute()) {
                $event.preventDefault();
                return;
            }
            $rootScope.toggleControlPanel();
        };

        $scope.isCurrentVisit = function (visit) {
            return $stateParams.visitUuid == visit.uuid;
        };

        var getLinks = function () {
            var state = $state.current.name;
            if (state.match("patient.consultation")) {
                return appendPrintLinks([
                    {text: "Summary", href: "#/patient/" + $scope.patient.uuid + "/dashboard"}
                ]);
            } else {
                var links = [];
                if ($scope.activeVisit) {
                    links.push({text: "Consultation", href: "#" + $scope.getConsultationPadLink()});
                }
                if (state.match("patient.dashboard")) {
                    links.push({text: "Trends", href: "/trends/#/patients/" + $scope.patient.uuid});
                } else if (state.match("patient.visit")) {
                    links.push({text: "Summary", href: "#/patient/" + $scope.patient.uuid + "/dashboard"});
                    links = appendPrintLinks(links);
                }
                return links;
            }
        };

        var getStartDateTime = function () {
            return $scope.visits.filter(function (visit) {
                return visit.uuid === $rootScope.visit.uuid;
            })[0].startDatetime;
        };

        var appendPrintLinks = function(links) {
            if ($rootScope.visit) {

                links.push({text: "Visit Summary", onClick: function($event) {
                    visitActionsService.printVisitSummary($scope.patient, $rootScope.visit, getStartDateTime());
                    $event.preventDefault();
                }});

                links.push({text: "OPD Summary (For Admit)", onClick: function($event) {
                    visitActionsService.printOpdSummary($scope.patient, $rootScope.visit, getStartDateTime());
                    $event.preventDefault();
                }});

                if($rootScope.visit.hasAdmissionEncounter()) {
                    links.push({text: "Discharge Summary", onClick: function($event) {
                        visitActionsService.printDischargeSummary($scope.patient, $rootScope.visit);
                        $event.preventDefault();
                    }});
                }
            }
            return links;
        };

        $scope.links = getLinks();
        $rootScope.$on('$stateChangeSuccess', function() {
            $scope.links = getLinks($state.current.name);
        })
    };

    return {
        restrict: 'E',
        templateUrl: 'views/controlPanel.html',
        controller: controller,
        link: link,
        scope: {}
    }
}]);