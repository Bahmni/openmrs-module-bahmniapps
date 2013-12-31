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

    $scope.toggleDrawer = function(){
            if($('.visit-history').hasClass("drawerClose")){
                $('.visit-history').removeClass("drawerClose");
                $('.visit-history').animate({width:'200px'},1000);
            }
            else{
                $('.visit-history').animate({width:'0px'},1000,function(){$('.visit-history').addClass("drawerClose");});
            }
    }
}]);
