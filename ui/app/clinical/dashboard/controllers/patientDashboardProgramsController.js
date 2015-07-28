'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardProgramsController', ['$scope', '$state', '$stateParams',
        function ($scope, $state, $stateParams) {
            $scope.gotoDetailsPage = function() {
                $state.go('patient.consultationContext');
            }
        }]);