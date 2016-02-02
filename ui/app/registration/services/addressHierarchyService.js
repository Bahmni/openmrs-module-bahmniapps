'use strict';

angular.module('bahmni.registration')
    .factory('addressHierarchyService', ['$http', 'offlineService', '$q', function ($http, offlineService, $q) {
        var search = function(fieldName, query, parentUuid){

            if(offlineService.isOfflineApp()){
                return $q.when({data : []});
            }
            var url = Bahmni.Registration.Constants.openmrsUrl + "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";

            return $http.get(url, {
                method: "GET",
                params: {searchString: query, addressField: fieldName ,parentUuid: parentUuid, limit: defaults.maxAutocompleteResults},
                withCredentials: true
            });
        };

        var getNextAvailableParentName = function (addressField) {
            var parent = addressField.parent;
            while (parent) {
                if (parent.name) return parent.name;
                else parent = parent.parent;
            }
            return "";
        };

        var getAddressDataResults = function (data) {
            return data.data.map(function (addressField) {
                var parentName = getNextAvailableParentName(addressField);
                return {
                    'value': addressField.name,
                    'label': addressField.name + ( parentName ? ", " + parentName : "" ),
                    addressField: addressField
                };
            });
        };


        return{
            search : search,
            getNextAvailableParentName: getNextAvailableParentName,
            getAddressDataResults: getAddressDataResults
        };
    }]);
