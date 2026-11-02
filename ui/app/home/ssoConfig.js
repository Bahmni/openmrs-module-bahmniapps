'use strict';

angular.module('bahmni.home')
    .factory('ssoConfig', ['localeService',
        function (localeService) {
            var DEFAULT_LOGIN_URL = '/openmrs/oauth2login';
            var cached;

            var disabled = function () {
                return {enabled: false, loginUrl: DEFAULT_LOGIN_URL};
            };

            // SSO is switched on with "ssoEnabled": true under "loginPage" in whiteLabel.json.
            // That file is static, so it can be read before the user is authenticated.
            var load = function () {
                if (!cached) {
                    cached = localeService.getLoginText().then(function (response) {
                        var loginPage = (response.data && response.data.loginPage) || {};
                        return {
                            enabled: loginPage.ssoEnabled === true,
                            loginUrl: loginPage.ssoLoginUrl || DEFAULT_LOGIN_URL
                        };
                    }, disabled);
                }
                return cached;
            };

            return {
                get: load
            };
        }
    ]);
