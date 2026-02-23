/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.i18n')
    .service('mergeLocaleFilesService', ['$http', '$q', 'mergeService', function ($http, $q, mergeService) {
        return function (options) {
            var baseLocaleUrl = '../i18n/';
            var customLocaleUrl = Bahmni.Common.Constants.rootDir + '/bahmni_config/openmrs/i18n/';

            var loadFile = function (url) {
                return $http.get(url, {withCredentials: true});
            };

            var mergeLocaleFile = function (options) {
                var fileURL = options.app + "/locale_" + options.key + ".json";

                var loadBahmniTranslations = function () {
                    return loadFile(baseLocaleUrl + fileURL).then(function (result) {
                        return result;
                    }, function () {
                        return;
                    });
                };
                var loadCustomTranslations = function () {
                    return loadFile(customLocaleUrl + fileURL).then(function (result) {
                        return result;
                    }, function () {
                        return;
                    });
                };

                var mergeTranslations = function (result) {
                    var baseFileData = result[0] ? result[0].data : undefined;
                    var customFileData = result[1] ? result[1].data : undefined;
                    if (options.shouldMerge || options.shouldMerge === undefined) {
                        return mergeService.merge(baseFileData, customFileData);
                    }
                    return [baseFileData, customFileData];
                };

                return $q.all([loadBahmniTranslations(), loadCustomTranslations()])
                    .then(mergeTranslations);
            };
            return mergeLocaleFile(options);
        };
    }]);
