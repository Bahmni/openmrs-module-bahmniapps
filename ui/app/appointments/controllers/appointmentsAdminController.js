'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsAdminController', ['$scope', '$location','appointmentsServiceService', 'spinner',
        function ($scope, $location, appointmentsServiceService, spinner) {
            $scope.openService = function (uuid) {
                if (!uuid) {
                    uuid = "new";
                }
                var url = "/home/service/" + uuid;
                $location.url(url);
            };

            var init = function () {
                return appointmentsServiceService.getAllServices().then(function(response){
                    $scope.appointmentServices = response.data;
                });
            };
            return spinner.forPromise(init());
        }]);
