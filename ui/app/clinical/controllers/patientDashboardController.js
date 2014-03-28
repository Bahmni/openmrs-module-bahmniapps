'use strict';

angular.module('opd.patientDashboard',[])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$stateParams', 'patientVisitHistoryService', 'urlHelper', 'visitService', 'encounterService', 'appService', function($scope, $rootScope, $location, $stateParams, patientVisitHistoryService, urlHelper, visitService, encounterService, appService) {
        $scope.patientUuid = $stateParams.patientUuid;
        var currentEncounterDate;

        $scope.obsIgnoreList = appService.getAppDescriptor().getConfig("obsIgnoreList").value || {};

        var getEnountersForVisit = function(visitUuid) {
            encounterService.search(visitUuid).success(function(encounterTransactions){
                $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig.orderTypes)
            });
        }

        $scope.isNumeric = function(value){
            return $.isNumeric(value);
        }

        patientVisitHistoryService.getVisits($scope.patientUuid).then(function(visits) {
            $scope.visits = visits.map(function(visitData){ return new Bahmni.Clinical.VisitHistoryEntry(visitData) });
            $scope.activeVisit = $scope.visits.filter(function(visit) {return visit.isActive()})[0];
            $scope.selectedVisit = $scope.visits[0];
            getEnountersForVisit($scope.selectedVisit.uuid);
        });

        $scope.showVisitSummary = function(visit) {
            $scope.selectedVisit = visit;
            getEnountersForVisit($scope.selectedVisit.uuid);
        }

        $scope.getConsultationPadLink = function() {
            if($scope.activeVisit) {
                return urlHelper.getVisitUrl($scope.activeVisit.uuid);
            } else {
                return urlHelper.getConsultationUrl();
            }
        }

        $scope.isCurrentVisit = function(visit) {
            return visit.uuid === $scope.selectedVisit.uuid;
        }

        $scope.toggle = function(item) {
            item.show = !item.show
        }

    }]);