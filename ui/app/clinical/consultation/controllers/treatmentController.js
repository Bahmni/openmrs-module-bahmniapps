angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', function($scope, clinicalAppConfigService){
        var init = function(){
            var medicationConfig = clinicalAppConfigService.getMedicationConfig();
            $scope.view = medicationConfig.view || 'default';
        };

        init();
    }]);
