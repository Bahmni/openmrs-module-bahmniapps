'use strict';

angular.module('bahmni.common.domain')
    .service('localeService', ['androidDbService',
        function (androidDbService) {
            this.allowedLocalesList = function () {
                return androidDbService.getReferenceData('LocaleList');
            };
        }]);
