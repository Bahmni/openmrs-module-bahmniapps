'use strict';

angular.module('bahmni.home')
    .controller('SsoController', ['$scope', '$state', '$window', 'sessionService', 'spinner', 'ssoConfig', 'postLoginService',
        function ($scope, $state, $window, sessionService, spinner, ssoConfig, postLoginService) {
            $scope.ssoReturn = true;

            $scope.endSsoSession = function () {
                return ssoConfig.get().then(function (sso) {
                    $window.location = sso.logoutUrl;
                });
            };

            const backToLoginWithError = function () {
                $state.go('login', {showLoginMessage: true});
            };

            const promise = sessionService.loadSsoSession().then(function (session) {
                if (!session) {
                    backToLoginWithError();
                    return;
                }
                return sessionService.loadCredentials().then(function () {
                    return postLoginService.completeLogin(session);
                }, function (error) {
                    $scope.errorMessageTranslateKey = error;
                });
            }, backToLoginWithError);

            spinner.forPromise(promise);
        }]);
