'use strict';

angular.module('bahmni.ot').factory('initialization', ['$rootScope', '$q', 'surgicalAppointmentHelper', 'appService', 'surgicalAppointmentService', 'authenticator', 'spinner', 'configurations',
    function ($rootScope, $q, surgicalAppointmentHelper, appService, surgicalAppointmentService, authenticator, spinner, configurations) {
        var loadConfigPromise = function () {
            var configNames = ['quickLogoutComboKey', 'contextCookieExpirationTimeInMinutes'];
            return configurations.load(configNames).then(function () {
                $rootScope.quickLogoutComboKey = configurations.quickLogoutComboKey() || 'Escape';
                $rootScope.cookieExpiryTime = configurations.contextCookieExpirationTimeInMinutes() || 0;
            });
        };
        var initApp = function () {
            return appService.initApp('ot', {'app': true, 'extension': true}).then(function (data) {
                var providerNames = data.getConfigValue("primarySurgeonsForOT");
                return $q.all([surgicalAppointmentService.getSurgeons(), surgicalAppointmentService.getSurgicalAppointmentAttributeTypes(), surgicalAppointmentService.getPrimaryDiagnosisConfigForOT()]).then(function (response) {
                    $rootScope.surgeons = surgicalAppointmentHelper.filterProvidersByName(providerNames, response[0].data.results);
                    $rootScope.attributeTypes = response[1].data.results;
                    $rootScope.showPrimaryDiagnosisForOT = response[2].data;
                    return response;
                });
            });
        };
        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(loadConfigPromise));
    }
]);
