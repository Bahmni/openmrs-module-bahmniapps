'use strict';

angular.module('bahmni.clinical')
    .controller('MedicationController', ['$scope', 'treatmentConfig', '$stateParams', function ($scope, treatmentConfig, $stateParams) {
        $scope.props = {
            patientUuid: $stateParams.patientUuid,
            isDropDown: treatmentConfig.isDropDownForGivenConceptSet(),
            drugConceptSet: treatmentConfig.getDrugConceptSet(),
            treatmentConfig: treatmentConfig

        };
    }]);
