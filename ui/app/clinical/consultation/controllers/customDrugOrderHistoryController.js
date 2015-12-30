angular.module('bahmni.clinical')
    .controller('CustomDrugOrderHistoryController', ['$scope', 'clinicalAppConfigService', function ($scope, clinicalAppConfigService) {
        $scope.drugOrderHistorySections = clinicalAppConfigService.getMedicationConfig().sections;
    }]);
