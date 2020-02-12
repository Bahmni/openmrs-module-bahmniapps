'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('formService', ['$http', function ($http) {
        var getFormList = function (encounterUuid) {
            return $http.get(Bahmni.Common.Constants.latestPublishedForms, {params: {encounterUuid: encounterUuid}});
        };

        var getAllForms = function () {
            return $http.get(Bahmni.Common.Constants.allFormsUrl, {params: {v: "custom:(version,name,uuid)"}});
        };

        var getFormDetail = function (formUuid, params) {
            return $http.get(Bahmni.Common.Constants.formUrl + '/' + formUuid, {params: params});
        };

        var getFormTranslations = function (url, form) {
            if (url && url !== Bahmni.Common.Constants.formTranslationsUrl) {
                return $http.get(url);
            }
            return $http.get(Bahmni.Common.Constants.formTranslationsUrl, { params: form});
        };

        return {
            getFormList: getFormList,
            getAllForms: getAllForms,
            getFormDetail: getFormDetail,
            getFormTranslations: getFormTranslations
        };
    }]);
