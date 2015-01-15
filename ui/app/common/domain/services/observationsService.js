'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$http', function ($http) {

        this.fetch = function (patientUuid, conceptNames, scope, numberOfVisits,visitUuid) {
            var params = {};
            if(visitUuid){
                params.visitUuid = visitUuid;
                params.concept = conceptNames;
            }
            else{
                params.patientUuid = patientUuid;
                params.concept = conceptNames;
                params.numberOfVisits = numberOfVisits;
                params.scope = scope;
            }
            return $http.get(Bahmni.Common.Constants.observationsUrl,
                {
                    params: params,
                    withCredentials: true
                }
            );
        };

//        this.fetchByVisit = function (visitUuid, conceptNames) {
//            return $http.get(Bahmni.Common.Constants.observationsUrl,
//                {
//                    params: {
//                        visitUuid: visitUuid,
//                        concept: conceptNames
//                    },
//                    withCredentials: true
//                }
//            );
//        };


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
