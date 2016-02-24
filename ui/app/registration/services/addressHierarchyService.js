'use strict';

angular.module('bahmni.registration')
    .factory('addressHierarchyService', ['$http', 'offlineService', 'offlineDbService', 'androidDbService',
        function ($http, offlineService, offlineDbService, androidDbService) {
        var search = function(fieldName, query, parentUuid){

            var params =  {searchString: query, addressField: fieldName ,parentUuid: parentUuid, limit: defaults.maxAutocompleteResults};
            if(offlineService.isOfflineApp()){
                if(offlineService.isAndroidApp()){
                    return androidDbService.searchAddress(params);
                }else{
                    return offlineDbService.searchAddress(params);
                }

            }
            var url = Bahmni.Registration.Constants.openmrsUrl + "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";

            return $http.get(url, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        var getNextAvailableParentName = function (addressField) {
            var parent = addressField.parent;
            while (parent) {
                if (parent.name) {
                    return parent.name;
                }
                else {
                    parent = parent.parent;
                }
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
