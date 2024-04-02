"use strict";

angular.module('bahmni.adt')
.controller('CareViewController', ['$rootScope', '$scope', '$state', '$window', 'auditLogService', 'sessionService', function ($rootScope, $scope, $state, $window, auditLogService, sessionService) {
    $scope.hostData = {
        provider: $rootScope.currentProvider
    };
    $scope.hostApi = {
        onHome: function () {
            $state.go('home');
        },
        onLogOut: function () {
            auditLogService.log(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY').then(function () {
                sessionService.destroy().then(
                    function () {
                        $window.location = "../home/index.html#/login";
                    });
            });
        }
    };
}]);
