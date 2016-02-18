'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', 'treatmentConfig', '$stateParams',
        function ($scope, clinicalAppConfigService, treatmentConfig, $stateParams) {
        var init = function () {
            var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
            $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
            $scope.tabConfigName = $stateParams.tabConfigName || "default";

            var initializeTreatments = function(){
                $scope.consultation.newlyAddedTabTreatments = $scope.consultation.newlyAddedTabTreatments || {};
                $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] || [];
                $scope.treatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName];
            };

            $scope.$watch('consultation.newlyAddedTabTreatments', initializeTreatments);

            $scope.enrollment = $stateParams.enrollment;
            $scope.treatmentConfig = treatmentConfig;
        };
        init();
    }]);
