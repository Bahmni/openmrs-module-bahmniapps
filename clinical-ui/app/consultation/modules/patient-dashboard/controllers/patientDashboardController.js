'use strict';

angular.module('opd.patientDashboard',[])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$routeParams', 'patientVisitHistoryService', function($scope, $rootScope, $location, $routeParams, patientVisitHistoryService) {
        var patientUuid = $routeParams.patientUuid;
        patientVisitHistoryService.getVisits(patientUuid).then(function(visits) {
            $scope.visits = visits.map(function(visitData){ return new Bahmni.Opd.Consultation.VisitHistoryEntry(visitData) });
        });
        $scope.showVisitSummary = function(visit) {
            $location.path(urlHelper.getVisitUrl(visit.uuid));
        }

        $scope.isCurrentVisit = function(visit) {
            return false;
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