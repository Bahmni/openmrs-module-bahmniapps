'use strict';

angular.module('bahmni.common.patient')
.directive('patientControlPanel', ['$q', '$rootScope', '$location', '$stateParams', '$state', 'contextChangeHandler', 'encounterService', 'visitActionsService', 'configurations',
        function($q, $rootScope, $location, $stateParams, $state, contextChangeHandler, encounterService, visitActionsService, configurations) {
    var link = function($scope) {
        $scope.patient = $rootScope.patient;
        $scope.activeVisit = $rootScope.activeVisit;

        var DateUtil = Bahmni.Common.Util.DateUtil;

        $scope.getConsultationPadLink = function () {
            return $rootScope.consultationBoardLink();
        };

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
            return $stateParams.visitUuid == visit.uuid;
        };

        $scope.calculateAge = function(birthDate){
            var age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());
            var ageInString = "";
            if(age.years) ageInString += age.years + " Years ";
            if(age.months) ageInString += age.months + " Months ";
            if(age.days) ageInString += age.days + " Days";
            return ageInString;
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
                    links.push({text: "Consultation", icon: "btn-consultation dashboard-btn", href: "#" + $scope.getConsultationPadLink()});
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
            return $rootScope.visits.filter(function (visit) {
                return visit.uuid === $rootScope.visit.uuid;
            })[0].startDatetime;
        };

        var appendPrintLinks = function(links) {
            if ($rootScope.visit) {
                links.push({text: "Visit Summary", icon: "btn-print dashboard-btn", onClick: function($event) {
                    visitActionsService.printVisitSummary($scope.patient, $rootScope.visit, getStartDateTime());
                    $event.preventDefault();
                }});

                links.push({text: "OPD Summary (For Admit)", icon: "btn-print dashboard-btn", onClick: function($event) {
                    visitActionsService.printOpdSummary($scope.patient, $rootScope.visit, getStartDateTime());
                    $event.preventDefault();
                }});

                if($rootScope.visit.hasAdmissionEncounter()) {
                    links.push({text: "Discharge Summary", icon: "btn-print dashboard-btn", onClick: function($event) {
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

    var controller =function ($scope) {
        var encounterTypeUuid =  configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
        $scope.documentsPromise = encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid).then(function(response) {
            return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
        });
    };

    return {
        restrict: 'E',
        templateUrl: 'views/controlPanel.html',
        controller: controller,
        link: link,
        scope: {}
    }
}]);