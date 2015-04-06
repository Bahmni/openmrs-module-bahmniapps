'use strict';

angular.module('bahmni.clinical')
    .controller('VisitHeaderController', ['$rootScope', '$scope', '$state', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'visitTabConfig', 'contextChangeHandler', '$location',
        function ($rootScope, $scope, $state, clinicalAppConfigService, patientContext, visitHistory, visitTabConfig, contextChangeHandler, $location) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.visitTabConfig = visitTabConfig;

            $scope.switchTab = function (tab) {
                $scope.visitTabConfig.switchTab(tab);
                $rootScope.$broadcast('event:clearVisitBoard', tab);
            };

            $scope.gotoPatientDashboard = function () {
                if(contextChangeHandler.execute()["allow"]) {
                    $location.path("/patient/" + patientContext.patient.uuid + "/dashboard");
                }
            };

            $scope.closeTab = function (tab) {
                $scope.visitTabConfig.closeTab(tab);
                $rootScope.$broadcast("event:clearVisitBoard", tab);
            };

            $scope.print = function () {
                $rootScope.$broadcast("event:printVisitTab", $scope.visitTabConfig.currentTab);
            };

            $scope.showPrint = function(){
                return visitTabConfig.showPrint();
            }
        }]);
