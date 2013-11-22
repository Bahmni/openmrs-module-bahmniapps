'use strict';

angular.module('bahmni.common.visit.services')
    .service('visitService', ['$http', function ($http) {

    this.getVisit = function (uuid) {
        return $http.get("/openmrs/ws/rest/v1/visit/" + uuid,
         	{ 
         		method:"GET",
         		params: {
                    v: "custom:(uuid,patient,encounters:(uuid,encounterType,orders,obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))"
         		}
         	}
        );
    };

}]);