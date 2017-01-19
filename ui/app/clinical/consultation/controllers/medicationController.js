'use strict';

angular.module('bahmni.clinical')
    .controller('MedicationController', ['$scope', 'treatmentConfig', function ($scope, treatmentConfig) {
        $scope.props = {
            isDropDown: treatmentConfig.isDropDown,
            drugConceptSet: treatmentConfig.drugConceptSet
        };
    }]);
