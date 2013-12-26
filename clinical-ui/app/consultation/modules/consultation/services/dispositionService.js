'use strict';

angular.module('opd.consultation.services')
        .factory('dispositionService', ['$http', '$rootScope', function ($http, $rootScope) {

        var getDispositionActions = function () {
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?name="+Bahmni.Opd.Consultation.Constants.dispositionConcept
                +"&v=custom:(uuid,name,answers:(uuid,name,mappings))", {cache: true});
        };

        var getDispositionNoteConcept = function(){
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?name="+Bahmni.Opd.Consultation.Constants.dispositionNoteConcept
                +"&v=custom:(uuid,name:(name))", {cache: true});
        };

        return {
            getDispositionActions: getDispositionActions,
            getDispositionNoteConcept:getDispositionNoteConcept
        };

    }]);
