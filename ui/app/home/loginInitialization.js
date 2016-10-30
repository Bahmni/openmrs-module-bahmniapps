'use strict';

angular.module('bahmni.home')
    .factory('loginInitialization', ['$rootScope', '$q', 'locationService', 'spinner', 'messagingService',
        function ($rootScope, $q, locationService, spinner, messagingService) {
            var init = function () {
                var deferrable = $q.defer();
                locationService.getAllByTag("Login Location").then(
                    function (response) {
                        deferrable.resolve({locations: response.data.results});
                    },
                    function (response) {
                        deferrable.reject();
                        if (response.status) {
                            response = 'MESSAGE_START_OPENMRS';
                        }
                        messagingService.showMessage('error', response);
                    }
                );
                return deferrable.promise;
            };

            return function () {
                return spinner.forPromise(init());
            };
        }
    ]);
