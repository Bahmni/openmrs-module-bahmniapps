angular.module('bahmni.clinical')
    .controller('CustomDrugOrderHistoryController', ['$scope', 'clinicalAppConfigService', function ($scope, clinicalAppConfigService) {
        var drugOrderHistoryConfig = clinicalAppConfigService.getMedicationConfig().drugOrderHistoryConfig || {};
        $scope.drugOrderHistorySections = drugOrderHistoryConfig.sections;
    }]);
