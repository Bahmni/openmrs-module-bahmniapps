'use strict';

angular.module('bahmni.ipd')
    .controller('HeaderController', ['$scope', '$rootScope', '$state',
        function ($scope, $rootScope, $state) {
            $scope.goToAdmitState = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("admit", options);
            };

            $scope.goToBedManagementState = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("bedManagement", options);
            };
        }]);
