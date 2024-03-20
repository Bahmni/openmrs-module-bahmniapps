"use strict";

angular.module('bahmni.adt')
.controller('CareViewController', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
    $scope.hostData = {
        provider: $rootScope.currentProvider
    };
    $scope.hostApi = {
        onHome: function () {
            $state.go('home');
        }
    };
}]);
