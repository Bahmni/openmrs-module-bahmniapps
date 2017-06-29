'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsAdminController', ['$scope', '$translate', '$location',
        function ($scope, $translate, $location) {
            $scope.openServiceView = function (uuid) {
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
