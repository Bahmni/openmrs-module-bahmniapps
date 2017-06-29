'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsAdminController', ['$scope', '$location',
        function ($scope, $location) {
            $scope.openService = function (uuid) {
                if (!uuid) {
                    uuid = "new";
                }
                var url = "/home/service/" + uuid;
                $location.url(url);
            };

            var init = function () {
            };
            return init();
        }]);
