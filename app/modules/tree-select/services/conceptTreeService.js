'use strict';

angular.module('opd.treeSelect.services')
    .factory('conceptTreeService', ['$http', function ($http) {

    var getConceptTree = function(rootConceptName) {
        return $http.get(constants.conceptUrl, {
            params: {name: rootConceptName, v: "full"}
        }).then(function(response) {
            if(response.data.results.length == 0) {
                return null;
            }
            var rootConcept = response.data.results[0];
            return createTreeStructure(rootConcept);
        });
    }

    function createTreeStructure(concept) {
        var childrenNodes = (concept.setMembers || []).map(function(child) { 
            return createTreeStructure(child);
        });
        return new Bahmni.Opd.TreeSelect.Node(concept, childrenNodes);
    }

    return {
        getConceptTree:getConceptTree
    };
}]);