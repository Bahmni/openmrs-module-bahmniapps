'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptService', ['$q', '$http', function ($q, $http) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();

        var getConceptByQuestion = function (request) {
            var params = {
                q: request.term,
                question: request.codedConceptName,
                v: "custom:(uuid,name,names:(name))",
                s: "byQuestion"
            };
            return $http.get(Bahmni.Common.Constants.conceptUrl, {params: params})
                .then(function (response) {
                    return response.data.results;
                });
        };

        var getAnswers = function (defaultConcept) {
            var deferred = $q.defer();
            var response = _(defaultConcept.answers)
                .uniq(_.property('uuid'))
                .map(conceptMapper.map)
                .value();
            deferred.resolve(response);
            return deferred.promise;
        };

        return {
            getConceptByQuestion: getConceptByQuestion,
            getAnswers: getAnswers
        }
    }]);
