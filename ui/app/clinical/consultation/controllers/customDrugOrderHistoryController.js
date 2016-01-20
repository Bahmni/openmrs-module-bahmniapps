angular.module('bahmni.clinical')
    .controller('CustomDrugOrderHistoryController', ['$scope', 'treatmentConfig', function ($scope, treatmentConfig) {
        var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
        $scope.drugOrderHistorySections = _.values(drugOrderHistoryConfig.sections);
    }]);
