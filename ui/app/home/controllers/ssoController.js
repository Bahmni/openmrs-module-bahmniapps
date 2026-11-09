'use strict';

angular.module('bahmni.home')
    .controller('SsoController', ['$rootScope', '$scope', '$state', '$window', 'sessionService', 'spinner', 'ssoConfig', 'loginInitialization', 'postLoginService', 'auditLogService',
        function ($rootScope, $scope, $state, $window, sessionService, spinner, ssoConfig, loginInitialization, postLoginService, auditLogService) {
            var logoutUrl;

            // Used when the Bahmni user could not be set up: the OpenMRS session is already gone, but Keycloak is
            // still signed in, so going back to the login page would just sign the same user in to the same error.
            $scope.endSsoSession = function () {
                localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
                localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
                $window.location = logoutUrl || Bahmni.Common.Constants.ssoLogoutUrl;
            };

            var backToLoginWithError = function () {
                $state.go('login', {showLoginMessage: true});
            };

            // Landing page after Keycloak login. OpenMRS has already validated the token and
            // created the session, so what is left is what the password flow does after authentication.
            var completeLogin = function (session) {
                postLoginService.saveAssignedLoginLocations($rootScope.currentUser);
                postLoginService.onLoggedIn();
                auditLogService.log(undefined, 'USER_LOGIN_SUCCESS', undefined, 'MODULE_LABEL_LOGIN_KEY');
                if (!session.sessionLocation) {
                    $state.go('loginLocation');
                    return;
                }
                // The loginLocation state runs loginInitialization itself; going straight to the
                // dashboard would otherwise skip writing homeUrl / enableCommandPalette.
                return loginInitialization.loadHomeConfig().then(function () {
                    $state.go('dashboard');
                });
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
                    return completeLogin(session);
                }, function (error) {
                    $scope.errorMessageTranslateKey = error;
                });
            }, backToLoginWithError);

            spinner.forPromise(promise);
        }]);
