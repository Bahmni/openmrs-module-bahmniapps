'use strict';

(function () {
    var disabled = function () {
        return {
            enabled: false,
            loginUrl: Bahmni.Common.Constants.ssoLoginUrl,
            logoutUrl: Bahmni.Common.Constants.ssoLogoutUrl
        };
    };

    angular.module('bahmni.home')
        .factory('ssoConfig', ['localeService',
            function (localeService) {
                var cached;

                var load = function () {
                    if (!cached) {
                        cached = localeService.getLoginText().then(function (response) {
                            const loginPage = (response.data && response.data.loginPage) || {};
                            return {
                                enabled: loginPage.ssoEnabled === true,
                                loginUrl: loginPage.ssoLoginUrl || Bahmni.Common.Constants.ssoLoginUrl,
                                logoutUrl: loginPage.ssoLogoutUrl || Bahmni.Common.Constants.ssoLogoutUrl
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
})();
