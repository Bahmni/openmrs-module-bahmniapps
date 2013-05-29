'use strict';

angular.module('opd.navigation', [])
    .controller('NavigationController', ['$scope', '$location', function ($scope, $location) {
        $scope.blank = function() {
            return $location.url("/blank");
        }
    }]);
