'use strict';

angular.module('bahmni.common.i18n')
    .service('mergeLocaleFilesService', ['$http', '$q', 'mergeService', function ($http, $q, mergeService) {
        return function(options) {
            var baseLocaleUrl = '../i18n/';
            var customLocaleUrl = Bahmni.Common.Constants.customLocaleUrl;

            var loadFile = function (url) {
                return $http.get(url, {withCredentials: true});
            };

            var mergeLocaleFile = function (options) {
                var deferrable = $q.defer();
                var fileURL = options.app + "/locale_" + options.key + ".json";
                var mergedLocaleFile = loadFile(baseLocaleUrl + fileURL).then(
                    function (baseResponse) {
                        return loadFile(customLocaleUrl + fileURL).then(function (customResponse) {
                            if (options.shouldMerge || options.shouldMerge === undefined) {
                                return mergeService.merge(baseResponse.data, customResponse.data);
                            }
                            return [baseResponse.data, customResponse.data];
                        }, function () {
                            return baseResponse.data;
                        });
                    },
                    function () {
                        return loadFile(customLocaleUrl + fileURL).then(function (customResponse) {
                            return customResponse.data;
                        });
                    }
                );
                deferrable.resolve(mergedLocaleFile);
                return deferrable.promise;
            };
            return $q.when(mergeLocaleFile(options));
        }
    }]);