'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$http', '$q', '$rootScope', function($http, $q, $rootScope) {

    this.fetch = function(patientUuid, conceptNames, scope, numberOfVisits) {
        return $http.get(Bahmni.Common.Constants.observationsUrl,
                            {
                                params:{
                                    patientUuid : patientUuid,
                                    concept : conceptNames,
                                    numberOfVisits : numberOfVisits,
                                    scope: scope
                                },
                                withCredentials : true
                            }
                );
    };

}]);
