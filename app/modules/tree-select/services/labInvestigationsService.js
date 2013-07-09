'use strict';

angular.module('opd.treeSelect.services')
    .factory('labInvestigationsService', ['$http', '$q', function ($http, $q) {

    var getInvestigations = function() {
        return $http.get(constants.conceptUrl, {
            params: {name: "TreeTestL1", v: "full"}
        }).then(function(response) {
            return new OpdTreeSelect.Node("root", response.data.results.map(function(concept) {
                return investigationMapper(concept);
            }));
        });
    }

    function investigationMapper(data) {
        data.setMembers = data.setMembers || []
        return new OpdTreeSelect.Node(data.display, 
            data.setMembers.map(function(child) { 
                return investigationMapper(child)
            })
        );
    }

    return {
        getInvestigations:getInvestigations
    };
}]);