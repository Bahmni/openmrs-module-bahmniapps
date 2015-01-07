'use strict';

angular.module('bahmni.clinical')
    .controller('DashboardHeaderController', ['$scope', 'clinicalAppConfigService', 'patientContext', 'visitHistory',
        function ($scope, clinicalAppConfigService, patientContext, visitHistory) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
        }]);
