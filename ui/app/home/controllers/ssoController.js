'use strict';

angular.module('bahmni.home')
    .controller('SsoController', ['$scope', '$state', 'sessionService', 'spinner',
        function ($scope, $state, sessionService, spinner) {
            // Landing page after Keycloak login. OpenMRS has already validated the token and
            // created the session, so only the Bahmni cookies and the location step are left.
            var loadCredentialsAndOpenDashboard = function () {
                return sessionService.loadCredentials().then(function () {
                    $state.go('dashboard');
                }, function (error) {
                    $scope.errorMessageTranslateKey = error;
                });
            };

            const promise = sessionService.loadSsoSession().then(function (session) {
                if (!session) {
                    $state.go('login');
                    return;
                }
                if (session.sessionLocation) {
                    return loadCredentialsAndOpenDashboard();
                }
                $state.go('loginLocation');
            }, function () {
                $state.go('login');
            });

            spinner.forPromise(promise);
        }]);
