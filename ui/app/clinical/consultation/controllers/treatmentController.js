'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', function($scope, clinicalAppConfigService){
        var init = function(){
            var drugOrderHistoryConfig = clinicalAppConfigService.getMedicationConfig().drugOrderHistoryConfig || {};
            $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
        };

        init();
    }]);