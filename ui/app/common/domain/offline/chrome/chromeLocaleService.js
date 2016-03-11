'use strict';

angular.module('bahmni.common.domain')
    .service('localeService', ['$http', 'offlineDbService',
        function ($http, offlineDbService) {
            this.allowedLocalesList = function () {
                return offlineDbService.getReferenceData('LocaleList').then(function (localeList) {
                    return {"data": localeList.value};
                });
            };

            this.defaultLocale = function () {
                return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                    method: "GET",
                    params: {
                        property: 'default_locale'
                    },
                    withCredentials: true,
                    headers: {
                        Accept: 'text/plain'
                    }
                });
            };
        }]);
