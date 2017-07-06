'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentServicesController', ['$scope', '$state', '$location', 'spinner',
        'appointmentsServiceService',
        function ($scope, $state, $location, spinner, appointmentsServiceService) {
            $scope.createService = function (uuid) {
                if (!uuid) {
                    uuid = 'new';
                }
                $state.go('home.admin.service.edit', {uuid: uuid});
            };

            var init = function () {
                return appointmentsServiceService.getAllServices().then(function (response) {
                    $scope.appointmentServices = response.data;
                });
            };
            return spinner.forPromise(init());
        }]);
