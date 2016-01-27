angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', 'treatmentConfig', '$stateParams',
        function ($scope, clinicalAppConfigService, treatmentConfig, $stateParams) {
        var init = function () {
            var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
            $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
            $scope.tabConfigName = $stateParams.tabConfigName || "default";

            $scope.treatmentConfig = treatmentConfig;
        };
        init();
    }]);
