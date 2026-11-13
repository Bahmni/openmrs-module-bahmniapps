'use strict';

angular.module('bahmni.home')
    .controller('SsoController', ['$scope', '$state', '$window', 'sessionService', 'spinner', 'ssoConfig', 'postLoginService',
        function ($scope, $state, $window, sessionService, spinner, ssoConfig, postLoginService) {
            $scope.endSsoSession = function () {
                localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
                localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
                return ssoConfig.get().then(function (sso) {
                    $window.location = sso.logoutUrl;
                });
            };

            const backToLoginWithError = function () {
                $state.go('login', {showLoginMessage: true});
            };

            const promise = ssoConfig.get().then(function (sso) {
                return sessionService.loadSsoSession(sso.logoutUrl);
            }).then(function (session) {
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
