'use strict';
angular.module('bahmni.common.services')
    .factory('drugService', ['$http', function ($http) {

        var search = function (drugName) {
            return $http.get(Bahmni.Common.Constants.drugUrl,
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

        var getSetMembersOfConcept = function (conceptSetFullySpecifiedName,searchTerm) {
            return $http.get(Bahmni.Common.Constants.drugUrl,
                {
                    method: "GET",
                    params: {
                        v: 'custom:(uuid,name,doseStrength,units,dosageForm,concept:(uuid,name,names:(name)))',
                        q: conceptSetFullySpecifiedName,
                        s: "byConceptSet",
                        searchTerm: searchTerm
                    },
                    withCredentials: true
                }
            ).then(function (response) {
                    return response.data.results;
                });
        };

        var getRegimen = function (patientUuid, patientProgramUuid, drugs) {
            var params = {
                patientUuid: patientUuid,
                patientProgramUuid: patientProgramUuid,
                drugs: drugs
            };

            return $http.get(Bahmni.Common.Constants.bahmniRESTBaseURL + "/drugOGram/regimen", {
                params: params,
                withCredentials: true
            });
        };

        return {
            search: search,
            getRegimen: getRegimen,
            getSetMembersOfConcept: getSetMembersOfConcept
        };
    }]);