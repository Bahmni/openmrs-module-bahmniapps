'use strict';

angular.module('bahmni.home')
    .controller('SsoController', ['$scope', '$state', '$window', 'sessionService', 'spinner', 'ssoConfig', 'postLoginService',
        function ($scope, $state, $window, sessionService, spinner, ssoConfig, postLoginService) {
            let logoutUrl;

            // Used when the Bahmni user could not be set up: the OpenMRS session is already gone, but Keycloak is
            // still signed in, so going back to the login page would just sign the same user in to the same error.
            $scope.endSsoSession = function () {
                localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
                localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
                $window.location = logoutUrl || Bahmni.Common.Constants.ssoLogoutUrl;
            };

            const backToLoginWithError = function () {
                $state.go('login', {showLoginMessage: true});
            };

            const promise = ssoConfig.get().then(function (sso) {
                logoutUrl = sso.logoutUrl;
                return sessionService.loadSsoSession(logoutUrl);
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
