'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'DrugService', 'contextChangeHandler', 'RegisterTabService', 'treatmentConfig',
    function ($scope, $rootScope, treatmentService, contextChangeHandler, registerTabService, treatmentConfig) {
        $scope.treatment = {};
        $scope.treatmentConfig = treatmentConfig;
    }]);
