'use strict';

angular.module('bahmni.clinical')
    .factory('DrugService', ['$http', function ($http) {

        var search = function (drugName) {
            return $http.get("/openmrs/ws/rest/v1/drug",
                {
                    method: "GET",
                    params: {
                        v: 'custom:(uuid,name,doseStrength,units,dosageForm,concept:(uuid,name,names:(name)))',
                        q: drugName,
                        s: "ordered"
                    },
                    withCredentials: true
                }
            ).then(function (response) {
                    return response.data.results;
                });
        };

        var getRegimen = function (patientUuid, drugs) {
            var params = {
                patientUuid: patientUuid,
                drugs: drugs
            };

            return $http.get(Bahmni.Common.Constants.bahmniRESTBaseURL + "/drugOGram/regimen", {
                params: params,
                withCredentials: true
            });
        };

        return {
            search: search,
            getRegimen: getRegimen
        };
    }]);