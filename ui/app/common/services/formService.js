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

        const getUrlWithUuid = function (url, patientUuid) {
            return url.replace('{patientUuid}', patientUuid);
        };

        var getAllPatientForms = function (patientUuid, numberOfVisits, patientProgramUuid) {
            const patientFormsUrl = getUrlWithUuid(Bahmni.Common.Constants.patientFormsUrl, patientUuid);
            const params = {
                numberOfVisits: numberOfVisits,
                formType: 'v2',
                patientProgramUuid: patientProgramUuid
            };
            return $http.get(patientFormsUrl, {params: params});
        };

        var getFormTranslations = function (url, form) {
            if (url && url !== Bahmni.Common.Constants.formTranslationsUrl) {
                return $http.get(url);
            }
            return $http.get(Bahmni.Common.Constants.formTranslationsUrl, { params: form});
        };

        var getFormTranslate = function (formName, formVersion, locale, formUuid) {
            return $http.get(Bahmni.Common.Constants.formBuilderTranslationApi, { params: {formName: formName,
                formVersion: formVersion, locale: locale, formUuid: formUuid}});
        };

        return {
            getFormList: getFormList,
            getAllForms: getAllForms,
            getFormDetail: getFormDetail,
            getFormTranslations: getFormTranslations,
            getFormTranslate: getFormTranslate,
            getAllPatientForms: getAllPatientForms
        };
    }]);
