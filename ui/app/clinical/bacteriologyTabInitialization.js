'use.strict';

angular.module('bahmni.clinical').factory('bacteriologyTabInitialization',
    ['conceptSetService', 'spinner', function (conceptSetService, spinner) {
        return function () {
            var conceptSetName = "BACTERIOLOGY CONCEPT SET";
            return spinner.forPromise(conceptSetService.getConceptSetMembers({
                name: conceptSetName,
                v: "custom:(uuid,setMembers:(uuid,name,conceptClass,answers:(uuid,name,mappings),setMembers:(uuid,name,conceptClass,answers:(uuid,name,mappings),setMembers:(uuid,name,conceptClass))))"
            }, true))
                .then(function (response) {
                    return response.data.results[0];
                });
        }
    }]
);