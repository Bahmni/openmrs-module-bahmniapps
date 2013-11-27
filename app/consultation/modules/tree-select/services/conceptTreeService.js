'use strict';

angular.module('opd.treeSelect.services')
    .factory('conceptTreeService', ['$http', '$q', function ($http, $q) {

    var conceptTreeCache = {};

    var getConceptTree = function(rootConceptName) {
        if(conceptTreeCache[rootConceptName] != null ) {
            return conceptTreeFromCache(rootConceptName);
        }
        return $http.get(Bahmni.Common.Constants.conceptUrl, {
            params: {name : rootConceptName, v: "fullchildren"}
        }).then(function(response) {
            if(response.data.results.length == 0) {
                return null;
            }
            var conceptTree = createTreeStructure(response.data.results[0]);
            conceptTreeCache[rootConceptName] = conceptTree;
            return conceptTree;
        });
    }

    function conceptTreeFromCache(rootConceptName) {
        var deferred = $q.defer();
        deferred.resolve(conceptTreeCache[rootConceptName]);
        return deferred.promise;
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