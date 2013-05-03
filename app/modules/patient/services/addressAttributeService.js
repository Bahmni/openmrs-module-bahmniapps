'use strict';

angular.module('resources.addressAttributeService', [])
    .factory('addressAttributeService', ['$http', function ($http) {
        var search = function(fieldName, query){
            var url = constants.openmrsUrl + "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";

            return $http.get(url, {
                method: "GET",
                params: {searchString: query, addressField: fieldName },
                withCredentials: true
            });
        }

        return{
            search : search
        };
    }]);