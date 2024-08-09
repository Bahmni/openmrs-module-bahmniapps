"use strict";

angular.module('bahmni.adt')
.controller('CareViewController', ['$rootScope', '$scope', '$state', '$window', 'auditLogService', 'sessionService', function ($rootScope, $scope, $state, $window, auditLogService, sessionService) {
    function handleLogoutShortcut (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === $rootScope.quickLogoutComboKey) {
            $scope.hostApi.onLogOut();
        }
    }
    function cleanup () {
        $window.removeEventListener('keydown', handleLogoutShortcut);
    }
    $window.addEventListener('keydown', handleLogoutShortcut);
    $scope.$on('$destroy', cleanup);
    $scope.hostData = {
        currentUser: $rootScope.currentUser,
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
        },
        handleAuditEvent: function (patientUuid, eventType, messageParams, module) {
            return auditLogService.log(patientUuid, eventType, messageParams, module);
        }
    };
}]);
