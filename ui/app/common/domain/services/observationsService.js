'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$http', function ($http) {

        this.fetch = function (patientUuid, conceptNames, scope, numberOfVisits) {
            return $http.get(Bahmni.Common.Constants.observationsUrl,
                {
                    params: {
                        patientUuid: patientUuid,
                        concept: conceptNames,
                        numberOfVisits: numberOfVisits,
                        scope: scope
                    },
                    withCredentials: true
                }
            );
        };

        this.getObsRelationship = function(targetObsUuid){
            return $http.get(Bahmni.Common.Constants.obsRelationshipUrl,
                {
                    params: {
                        targetObsUuid: targetObsUuid
                    },
                    withCredentials: true
                }
            );
        };
    }]);
