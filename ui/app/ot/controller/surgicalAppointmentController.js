'use strict';

angular.module('bahmni.ot')
    .controller('surgicalAppointmentController', ['$scope', 'spinner', 'surgicalAppointmentService',
        function ($scope, spinner, surgicalAppointmentService) {
            var init = function () {
                return surgicalAppointmentService.getSurgeonNames().then(function (response) {
                    $scope.surgeonNames = response.data.results[0].answers;
                    return response;
                });
            };
            spinner.forPromise(init());
        }]);
