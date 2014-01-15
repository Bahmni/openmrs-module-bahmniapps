'use strict';

angular.module('bahmni.common.visit.services')
    .service('visitService', ['$http', function ($http) {

    this.getVisit = function (uuid) {
        return $http.get(Bahmni.Common.Constants.visitUrl + '/' + uuid,
         	{ 
         		params: {
                    v: "custom:(uuid,visitType,patient,encounters:(uuid,encounterType,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))"
         		}
         	}
        );
    };
    this.getVisitSummary = function (uuid) {
        return $http.get(Bahmni.Common.Constants.visitSummaryUrl + '/' + uuid,
         	{
         		withCredentials: true
         	}
        );
    };

    this.search = function(parameters) {
        return $http.get(Bahmni.Common.Constants.visitUrl, {
            params: parameters,
            withCredentials: true
        });
    };

    this.getVisitType = function() {
        return $http.get(Bahmni.Common.Constants.visitTypeUrl, {
            withCredentials: true
        });

    }
}]);
