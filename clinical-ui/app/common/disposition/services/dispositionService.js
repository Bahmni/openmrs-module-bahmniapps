'use strict';

angular.module('bahmni.common.disposition')
    .factory('dispositionService', ['$http', function ($http) {
        var getDispositionActions = function () {
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?name="+Bahmni.Common.Constants.dispositionConcept
                +"&v=custom:(uuid,name,answers:(uuid,name,mappings))", {cache: true});
        };

        var getDispositionNoteConcept = function(){
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?name="+Bahmni.Common.Constants.dispositionNoteConcept
                +"&v=custom:(uuid,name:(name))", {cache: true});
        };

        return {
            getDispositionActions: getDispositionActions,
            getDispositionNoteConcept:getDispositionNoteConcept
        };

    }]);
