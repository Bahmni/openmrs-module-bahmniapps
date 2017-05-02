'use strict';

angular.module('bahmni.ot')
    .controller('surgicalAppointmentController', ['$scope', 'spinner', 'surgicalAppointmentService', "$rootScope",
        function ($scope, spinner, surgicalAppointmentService, $rootScope) {
            var init = function () {
                return surgicalAppointmentService.getSurgeonNames().then(function (response) {
                    $scope.surgeonNames = response.data.results[0].answers;
                    var locations = [{"title": "OT1"},{"title": "OT2"},{"title": "OT3"}];
                    $scope.locations = locations;
                    $scope.surgicalForm = {};
                    $rootScope.surgicalForm = $scope.surgicalForm;
                    return response;
                });
            };
            var areAllFieldsFilled = function () {
              return true;
            };

            $scope.updateOTLocation = function(location) {
                $scope.surgicalForm.location = location;
            };

            $scope.setDate = function (date) {
              $scope.surgicalForm.surgicalDate = date;
            };

            spinner.forPromise(init());
        }]);
