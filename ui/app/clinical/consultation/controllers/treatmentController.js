angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', 'treatmentConfig', function($scope, clinicalAppConfigService, treatmentConfig){
        var init = function(){
            var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
            $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
        };
        init();
    }]);
