'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('observationFormService', ['$http', function ($http) {
        var getFormList = function (params) {
            return $http.get(Bahmni.Common.Constants.formUrl, { params: params });
        };

        var getFormDetail = function (formUuid, params) {
            return $http.get(Bahmni.Common.Constants.formUrl + '/' + formUuid, { params: params });
        };

        return {
            getFormList: getFormList,
            getFormDetail: getFormDetail
        };
    }]);
