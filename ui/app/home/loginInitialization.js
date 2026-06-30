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
    .factory('loginInitialization', ['$rootScope', '$q', 'locationService', 'spinner', 'messagingService', 'loadConfigService',
        function ($rootScope, $q, locationService, spinner, messagingService, loadConfigService) {
            var init = function () {
                var locationsDeferred = $q.defer();
                locationService.getAllByTag("Login Location").then(
                    function (response) {
                        locationsDeferred.resolve({locations: response.data.results});
                    },
                    function (response) {
                        locationsDeferred.reject();
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

                var configDeferred = $q.defer();
                loadConfigService.loadConfig(Bahmni.Common.Constants.baseUrl + "home/app.json").then(
                    function (response) {
                        var config = response.data && response.data.config;
                        $rootScope.homeURL = (config && config.homeUrl) || Bahmni.Common.Constants.homeUrl;
                        localStorage.setItem('homeUrl', $rootScope.homeURL);
                        localStorage.setItem('enableCommandPalette', config && config.enableCommandPalette === true ? 'true' : 'false');
                        configDeferred.resolve();
                    },
                    function () {
                        $rootScope.homeURL = Bahmni.Common.Constants.homeUrl;
                        localStorage.setItem('homeUrl', $rootScope.homeURL);
                        localStorage.setItem('enableCommandPalette', 'false');
                        configDeferred.resolve();
                    }
                );

                return $q.all([locationsDeferred.promise, configDeferred.promise]).then(function (results) {
                    return results[0];
                });
            };

            return function () {
                return spinner.forPromise(init());
            };
        }
    ]);
