'use strict';

angular.module('bahmni.common.patient')
.directive('patientControlPanel', ['$q', '$rootScope', '$location', '$stateParams', '$state', 'contextChangeHandler', 'encounterService', 'visitActionsService', 'urlHelper', 'spinner', function($q, $rootScope, $location, $stateParams, $state, contextChangeHandler, encounterService, visitActionsService, urlHelper, spinner) {
    var controller = function($scope) {
        $scope.getPatientDocuments = function () {
            var encounterTypeUuid = $rootScope.encounterConfig.getPatientDocumentEncounterTypeUuid();
            var promise = encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid);
            return spinner.forPromise(promise);
        };
    }

    var link = function($scope) {
        $scope.patient = $rootScope.patient;
        $scope.visits = $rootScope.visits;

        var getActiveVisit = function (){
            return $scope.visits.filter(function(visit) {
                return visit.isActive();
            })[0];
        };

        $scope.getConsultationPadLink = function () {
            $scope.activeVisit = getActiveVisit();
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
        }

        $scope.isCurrentVisit = function (visit) {
            return $stateParams.visitUuid == visit.uuid;
        };

        var getLinks = function() {
            var state = $state.current.name;
            if(state.match("patient.consultation")) {
                return appendPrintLinks([
                    {text: "Summary", href: "#/patient/" + $scope.patient.uuid + "/dashboard"},
                ]);
            } else if(state.match("patient.dashboard")) {
                return [
                    {text: "Consultation", href: "#" + $scope.getConsultationPadLink()},
                    {text: "Trends", href: "/trends/#/patients/" + $scope.patient.uuid},
                ];
            } else if(state.match("patient.visit")) {
                return appendPrintLinks([
                    {text: "Summary", href: "#/patient/" + $scope.patient.uuid + "/dashboard"},
                    {text: "Consultation", href: "#" + $scope.getConsultationPadLink()},
                ]);
            }
        }

        var appendPrintLinks = function(links) {
            if ($rootScope.visit) {
                links.push({text: "Print Visit Details", onClick: function($event) {
                    visitActionsService.printVisit($scope.patient, $rootScope.visit);
                    $event.preventDefault();
                }});

                links.push({text: "Print Visit Summary", onClick: function($event) {
                    visitActionsService.printVisitSummary($scope.patient, $rootScope.visit, null);
                    $event.preventDefault();
                }});

                if($rootScope.visit.hasAdmissionEncounter()) {
                    links.push({text: "Print Discharge Summary", onClick: function($event) {
                        visitActionsService.printDischargeSummary($scope.patient, $rootScope.visit)
                        $event.preventDefault();
                    }});
                }
            }
            return links;
        }

        $scope.links = getLinks();
        $rootScope.$on('$stateChangeSuccess', function() {
            $scope.links = getLinks($state.current.name);
        })
    }

    return {
        restrict: 'E',
        templateUrl: 'views/controlPanel.html',
        controller: controller,
        link: link,
        scope: {}
    }
}])