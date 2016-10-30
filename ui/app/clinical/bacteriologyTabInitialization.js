'use strict';

angular.module('bahmni.clinical').factory('bacteriologyTabInitialization',
    ['conceptSetService', function (conceptSetService) {
        return function () {
            var conceptSetName = "BACTERIOLOGY CONCEPT SET";
            return conceptSetService.getConcept({
                name: conceptSetName,
                v: "custom:(uuid,setMembers:(uuid,name,conceptClass,answers:(uuid,name,mappings,names),setMembers:(uuid,name,conceptClass,answers:(uuid,name,mappings),setMembers:(uuid,name,conceptClass))))"
            }, true)
                .then(function (response) {
                    return response.data.results[0];
                });
        };
    }]
);
