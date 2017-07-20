'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptService', ['$q', '$http', function ($q, $http) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
        var mapConceptOrGetDrug = function (conceptAnswer) {
            return conceptAnswer.concept && conceptMapper.map(conceptAnswer.concept) || conceptAnswer.drug;
        };

        var getAnswersForConceptName = function (request) {
            var params = {
                q: request.term,
                question: request.answersConceptName,
                v: "custom:(concept:(uuid,name:(display,uuid,name,conceptNameType),names:(display,uuid,name,conceptNameType)),drug:(uuid,name,display))",
                s: "byQuestion"
            };
            return $http.get(Bahmni.Common.Constants.bahmniConceptAnswerUrl, {params: params})
                .then(_.partial(_.get, _, 'data.results'))
                .then(function (conceptAnswers) {
                    return _(conceptAnswers)
                        .map(mapConceptOrGetDrug)
                        .uniqBy('uuid')
                        .value();
                });
        };

        var getAnswers = function (defaultConcept) {
            var deferred = $q.defer();
            var response = _(defaultConcept.answers)
                .uniqBy('uuid')
                .map(conceptMapper.map)
                .value();
            deferred.resolve(response);
            return deferred.promise;
        };

        return {
            getAnswersForConceptName: getAnswersForConceptName,
            getAnswers: getAnswers
        };
    }]);
