'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitHistoryController', ['$scope', '$route', 'patientVisitHistoryService','$location', '$rootScope', 'urlHelper', function ($scope, $route, patientVisitHistoryService, $location, $rootScope, urlHelper) {
    var visitUuid = $route.current.params.visitUuid;

    patientVisitHistoryService.getVisits($rootScope.patient.uuid).then(function(visits) {
        $scope.visits = visits.map(function(visitData){ return new Bahmni.Opd.Consultation.VisitHistoryEntry(visitData) });
    });        

    $scope.showVisitSummary = function(visit) {
        $location.path(urlHelper.getVisitUrl(visit.uuid));
    }

    $scope.isCurrentVisit = function(visit) {
        return visit.uuid === visitUuid;
    }
}]);
