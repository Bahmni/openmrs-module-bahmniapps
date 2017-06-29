'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsManageController', ['$scope', '$location', '$state',
        function ($scope, $location, $state) {
            $scope.goTo = function (url) {
                $location.url(url);
            };
            var init = function () {
            };
            return init();
        }]);
