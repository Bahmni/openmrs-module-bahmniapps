'use strict';

angular.module('bahmni.registration')
    .factory('addressAttributeService', ['$http', function ($http) {
        var search = function(fieldName, query, parentUuid){
            var url = Bahmni.Registration.Constants.openmrsUrl + "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";

            return $http.get(url, {
                method: "GET",
                params: {searchString: query, addressField: fieldName ,parentUuid: parentUuid, limit: defaults.maxAutocompleteResults},
                withCredentials: true
            });
        };

        return{
            search : search
        };
    }]);