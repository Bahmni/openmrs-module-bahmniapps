'use strict';

angular.module('bahmni.common.domain')
    .service('localeService', ['offlineDbService',
        function (offlineDbService) {
            this.allowedLocalesList = function () {
                return offlineDbService.getReferenceData('LocaleList').then(function (localeList) {
                    return {"data": localeList.value};
                });
            };
        }]);
