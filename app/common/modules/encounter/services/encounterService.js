'use strict';

angular.module('bahmni.common.encounter.services')
    .service('encounterService', ['$http', function ($http) {

    this.create = function (encounter) {
        encounter.observations = encounter.observations || [];
        encounter.observations.forEach(function(obs) {
            stripExtraConceptInfo(obs);
        });
        return $http.post(Bahmni.Common.Constants.encounterUrl, encounter, {
            withCredentials:true
        });
    };

    var stripExtraConceptInfo = function(obs) {
        obs.concept = {uuid: obs.concept.uuid};
        obs.groupMembers = obs.groupMembers || [];
        obs.groupMembers.forEach(function(groupMember) {
            stripExtraConceptInfo(groupMember);
        });
    }
}]);