'use strict';

angular.module('bahmni.ot')
    .controller('OTHeaderController', ['$scope', '$rootScope', '$state',
        function ($scope, $rootScope, $state) {
            $scope.goToNewSurgicalAppointment = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("newSurgicalAppointment", options);
            };
        }]);
