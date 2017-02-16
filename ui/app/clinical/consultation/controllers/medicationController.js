'use strict';

angular.module('bahmni.clinical')
    .controller('MedicationController', ['$scope', 'treatmentConfig', '$stateParams', '$ngRedux',
        function ($scope, treatmentConfig, $stateParams, $ngRedux) {
            $scope.$parent.medicationFlag = $scope.$parent.medicationFlag || false;
            var init = function () {

                if (!$scope.$parent.medicationFlag) {
                    $ngRedux.connect(function (state) {
                        $scope.consultation.medication = state;
                        return state;
                    })({});
                    $scope.$parent.medicationFlag = true;
                }
            };
            $scope.$parent.$on('$destroy', function() {
                $ngRedux.dispatch({type: 'CLEAR_MEDICATION'});
            });
            $scope.props = {
                patientUuid: $stateParams.patientUuid,
                isDropDown: treatmentConfig.isDropDownForGivenConceptSet(),
                drugConceptSet: treatmentConfig.getDrugConceptSet(),
                treatmentConfig: treatmentConfig,
                store: $ngRedux
            };

            init();
        }]);
