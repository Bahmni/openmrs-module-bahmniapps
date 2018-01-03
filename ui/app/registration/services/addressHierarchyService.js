'use strict';

angular.module('bahmni.registration')
    .factory('addressHierarchyService', ['$http',
        function ($http) {
            var parseSearchString = function (searchString) {
                searchString = searchString.replace(new RegExp("\\(", "g"), "\\(");
                searchString = searchString.replace(new RegExp("\\)", "g"), "\\)");
                return searchString;
            };

            var search = function (fieldName, query, parentUuid) {
                var params = {searchString: query, addressField: fieldName, parentUuid: parentUuid, limit: defaults.maxAutocompleteResults};
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
                    } else {
                        parent = parent.parent;
                    }
                }
                return "";
            };

            var getAddressDataResults = function (data) {
                return data.data ? data.data.map(function (addressField) {
                    var parentName = getNextAvailableParentName(addressField);
                    return {
                        'value': addressField.name,
                        'label': addressField.name + (parentName ? ", " + parentName : ""),
                        addressField: addressField
                    };
                }) : [];
            };

            return {
                search: search,
                getNextAvailableParentName: getNextAvailableParentName,
                getAddressDataResults: getAddressDataResults
            };
        }]);
