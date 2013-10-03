'use strict';

angular.module('opd.consultation.services')
    .factory('dispositionService', ['$http', '$rootScope', function ($http, $rootScope) {

        var getDispositionActions = function () {
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?q="+Bahmni.Opd.Constants.dispositionConcept
                +"&v=custom:(uuid,answers:(uuid,name,mappings))");
        };

        var getDispositionNoteConcept = function(){
            return $http.get(Bahmni.Common.Constants.conceptUrl
                +"?q="+Bahmni.Opd.Constants.dispositionNoteConcept
                +"&v=custom:(uuid,name:(name))");
        };

        return {
            getDispositionActions: getDispositionActions,
            getDispositionNoteConcept:getDispositionNoteConcept
        };

    }]);