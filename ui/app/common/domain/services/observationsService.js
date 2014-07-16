'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$http', '$q', '$rootScope', function($http, $q, $rootScope) {

    this.fetch = function(patientUuid, conceptNames, numberOfVisits) {
        return $http.get(Bahmni.Common.Constants.observationsUrl,
                            {
                                params:{
                                    patientUuid : patientUuid,
                                    concept : conceptNames,
                                    numberOfVisits : numberOfVisits
                                },
                                withCredentials : true
                            }
                );
    };

}]);
