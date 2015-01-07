'use strict';

angular.module('bahmni.clinical')
    .controller('VisitHeaderController', ['$scope', '$state', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'visitContext',
        function ($scope, $state, clinicalAppConfigService, patientContext, visitHistory, visitContext) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.visit = visitContext;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;

            $scope.loadVisit = function (visitUuid) {
                $state.go('patient.visit', {visitUuid: visitUuid});
            };

        }]);
