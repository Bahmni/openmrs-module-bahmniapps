angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', function($scope, clinicalAppConfigService){
        var init = function(){
            var treatmentTabExtension = clinicalAppConfigService.getTreatmentTabExtension();
                $scope.view = treatmentTabExtension.view || 'default';
        };

        init();
    }]);
