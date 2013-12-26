'use strict';

angular.module('opd.adt.services')
        .factory('adtService', ['$http', '$rootScope', function ($http, $rootScope) {

        var getAdtNoteConcept = function(){
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?name="+Bahmni.Opd.ADT.Constants.adtNotes
                +"&v=custom:(uuid,name:(name))", {cache: true});
        };

        return {
            getAdtNoteConcept:getAdtNoteConcept
        };

    }]);
