'use strict';

angular.module('opd.admission.services')
    .factory('admissionService', ['$http', '$rootScope', function ($http, $rootScope) {
        
        var getPatient = function (uuid) {
            var aPatient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });

            if(aPatient != undefined){
                aPatient.image = $rootScope.bahmniConfiguration.patientImagesUrl + "/" + aPatient.identifier + ".jpeg" + "?q=" + new Date().getTime();
            }
            return aPatient;
        };
       
        return {
            getPatient: getPatient
        };
    }]);
