'use strict';

angular.module('bahmni.common.domain')
    .service('localeService', ['$http', 'androidDbService',
        function ($http, androidDbService) {

        this.allowedLocalesList = function () {
                return androidDbService.getReferenceData('LocaleList').then(function(localeList){
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
