'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsServiceController', ['$scope', 'appointmentsServiceService',
        function ($scope, appointmentsServiceService) {
            $scope.save = function () {
                appointmentsServiceService.save($scope.service);
            };
            var init = function () {
            };
            return init();
        }]);
