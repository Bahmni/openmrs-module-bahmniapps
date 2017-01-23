'use strict';

angular.module('bahmni.clinical')
    .controller('MedicationController', ['$scope', 'treatmentConfig', function ($scope, treatmentConfig) {
        $scope.props = {
            isDropDown: treatmentConfig.isDropDownForGivenConceptSet(),
            drugConceptSet: treatmentConfig.getDrugConceptSet()
        };
    }]);
