'use strict';

angular.module('bahmni.clinical')
    .controller('VisitHeaderController', ['$rootScope', '$scope', '$state', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'visitContext',
        function ($rootScope, $scope, $state, clinicalAppConfigService, patientContext, visitHistory, visitContext) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.visit = visitContext;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.currentVisitTab = $scope.currentVisitTab || {};

            $scope.visitConfig = clinicalAppConfigService.getVisitConfig();

            $scope.loadVisit = function (visitUuid) {
                $state.go('patient.visit', {visitUuid: visitUuid});
            };

            $scope.tabSelect = function(visitTab){
                $scope.currentVisitTab = visitTab;
                $rootScope.$broadcast("event:visitTabSwitch", visitTab);
            };

            $scope.print= function(){
                $rootScope.$broadcast("event:printVisitTab", $scope.currentVisitTab);
            };
        }]);
