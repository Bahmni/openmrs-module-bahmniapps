'use strict';

angular.module('bahmni.registration')
    .factory('addressHierarchyService', ['$http', 'offlineService', '$q', function ($http, offlineService, $q) {
        var search = function(fieldName, query, parentUuid){

            if(offlineService.offline()){
                return $q.when({data : []});
            }
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
