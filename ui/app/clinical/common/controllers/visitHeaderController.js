'use strict';

angular.module('bahmni.clinical')
    .controller('VisitHeaderController', ['$rootScope', '$scope', '$state', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'visitContext', 'visitTabConfig',
        function ($rootScope, $scope, $state, clinicalAppConfigService, patientContext, visitHistory, visitContext, visitTabConfig) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.visit = visitContext;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.visitTabConfig = visitTabConfig;

            $scope.switchTab = function (tab) {
                $scope.visitTabConfig.switchTab(tab);
                $rootScope.$broadcast('event:clearVisitBoard', tab);
            };

            $scope.closeTab = function (tab) {
                $scope.visitTabConfig.closeTab(tab);
                $rootScope.$broadcast("event:clearVisitBoard", tab);
            };

            $scope.print = function () {
                $rootScope.$broadcast("event:printVisitTab", $scope.visitTabConfig.currentTab);
            };
        }]);
