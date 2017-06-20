'use strict';

angular.module('bahmni.ot').factory('initialization', ['$rootScope', 'surgicalAppointmentHelper', 'appService', 'surgicalAppointmentService', 'authenticator', 'spinner',
    function ($rootScope, surgicalAppointmentHelper, appService, surgicalAppointmentService, authenticator, spinner) {
        var initApp = function () {
            return appService.initApp('ot', {'app': true, 'extension': true}).then(function (data) {
                var providerNames = data.getConfigValue("primarySurgeonsForOT");
                return surgicalAppointmentService.getSurgeons().then(function (response) {
                    $rootScope.surgeons = surgicalAppointmentHelper.filterProvidersByName(providerNames, response.data.results);
                    return $rootScope.surgeons;
                });
            });
        };
        return spinner.forPromise(authenticator.authenticateUser().then(initApp));
    }
]);
