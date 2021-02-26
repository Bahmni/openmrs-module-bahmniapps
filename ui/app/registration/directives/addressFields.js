'use strict';

angular.module('bahmni.registration')
    .directive('addressFields', function () {
        return {
            restrict: 'AE',
            templateUrl: ' views/addressFields.html',
            controller: 'AddressFieldsDirectiveController',
            scope: {
                address: '=',
                addressLevels: '=',
                fieldValidation: '=',
                strictAutocompleteFromLevel: '='
            }
        };
    })
    .controller('AddressFieldsDirectiveController', ['$scope', 'addressHierarchyService', '$translate', function ($scope, addressHierarchyService, $translate) {
        var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
        $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelsCloneInDescendingOrder, 2);
        var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function (addressLevel) {
            return addressLevel.addressField;
        });
        var modulePrefixMap = {
            'registration': 'REGISTRATION',
            'program': 'PROGRAM',
            'OT': 'OT'
        };
        $scope.addressFieldSelected = function (fieldName) {
            return function (addressFieldItem) {
                var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
                $scope.selectedValue[fieldName] = addressFieldItem.addressField.name;
                var parent = addressFieldItem.addressField.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) {
                        return;
                    }
                    $scope.address[parentField] = parent.name;
                    $scope.selectedValue[parentField] = parent.name;
                    parent = parent.parent;
                });
            };
        };
        $scope.getTranslatedAddressFields = function (address) {
            var translatedName = Bahmni.Common.Util.TranslationUtil.translateAttribute(address, Bahmni.Common.Constants.registration, $translate);
            return translatedName;
        };
        $scope.removeAutoCompleteEntry = function (fieldName) {
            return function () {
                $scope.selectedValue[fieldName] = null;
            };
        };

        $scope.getAddressEntryList = function (field) {
            return function (searchAttrs) {
                return addressHierarchyService.search(field, searchAttrs.term);
            };
        };

        $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults;

        $scope.clearFields = function (fieldName) {
            var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
            childFields.forEach(function (childField) {
                if (!_.isEmpty($scope.selectedValue[childField])) {
                    $scope.address[childField] = null;
                    $scope.selectedValue[childField] = null;
                }
            });
        };
        var init = function () {
            $scope.addressLevels.reverse();
            var isStrictEntry = false;
            _.each($scope.addressLevels, function (addressLevel) {
                addressLevel.isStrictEntry = $scope.strictAutocompleteFromLevel == addressLevel.addressField || isStrictEntry;
                isStrictEntry = addressLevel.isStrictEntry;
            });
            $scope.addressLevels.reverse();

            // wait for address to be resolved in edit patient scenario
            var addressWatch = $scope.$watch('address', function (newValue) {
                if (newValue !== undefined) {
                    $scope.selectedValue = _.mapValues($scope.address, function (value, key) {
                        var addressLevel = _.find($scope.addressLevels, {addressField: key});
                        return addressLevel && addressLevel.isStrictEntry ? value : null;
                    });
                    addressWatch();
                }
            });
        };
        init();
    }]);
