/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


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
                        // This block checks if status code is 401 and reloads the page instead of throwing a pop up error message
                        // Refer BAH-2407 Clinical Module homepage is throwing error on Login Page issue.
                            if (response.status == 401) {
                                location.reload();
                            } else {
                                response = 'MESSAGE_START_OPENMRS';
                                messagingService.showMessage('error', response);
                            }
                        }
                    }
                );

                return deferrable.promise;
            };

            return function () {
                return spinner.forPromise(init());
            };
        }
    ]);
