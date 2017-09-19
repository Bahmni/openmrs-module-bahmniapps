'use strict';

angular.module('bahmni.appointments').factory('initialization',
    ['authenticator', 'appService', 'spinner', 'configurations',
        function (authenticator, appService, spinner, configurations) {
            return function () {
                var loadConfigPromise = function () {
                    return configurations.load([]);
                };
                var initApp = function () {
                    return appService.initApp('appointments', {'app': true, 'extension': true});
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(loadConfigPromise));
            };
        }
    ]
);
