'use strict';

angular.module('bahmni.common.domain')
    .service('localeService', ['$http','offlineService', 'offlineDbService', 'androidDbService',
        function ($http, offlineService, offlineDbService, androidDbService) {

        this.allowedLocalesList = function () {
            if(offlineService.isOfflineApp()) {
                if(offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return offlineDbService.getReferenceData('LocaleList').then(function(localeList){
                    return {"data": localeList.value};
                });
            }
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'locale.allowed.list'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
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
