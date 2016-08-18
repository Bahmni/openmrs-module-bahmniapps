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
                strictEntryAddressFields: '='
            }
        };
    })
    .controller('AddressFieldsDirectiveController', function ($scope, addressHierarchyService) {
        var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
        $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelsCloneInDescendingOrder, 2);
        var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function (addressLevel) {
            return addressLevel.addressField;
        });

        $scope.autocompletedFields = [];
        $scope.addressFieldSelected = function (fieldName) {
            return function (addressFieldItem) {
                var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
                var parent = addressFieldItem.addressField.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) {
                        return;
                    }
                    $scope.address[parentField] = parent.name;
                    $scope.selectedValue[parentField] = parent.name;
                    parent = parent.parent;
                });
                $scope.autocompletedFields = [];
                $scope.autocompletedFields.push(fieldName);
                $scope.autocompletedFields = $scope.autocompletedFields.concat(parentFields);
            };
        };

        $scope.removeAutoCompleteEntry = function (fieldName) {
            return function () {
                _.pull($scope.autocompletedFields, fieldName);
            };
        };

        $scope.getAddressEntryList = function (field) {
            return function (searchAttrs) {
                return addressHierarchyService.search(field, searchAttrs.term);
            };
        };

        $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults;

        $scope.clearFields = function (fieldName) {
            if (_.includes($scope.autocompletedFields, fieldName)) {
                var childFields = $scope.autocompletedFields.slice(0, $scope.autocompletedFields.indexOf(fieldName));
                childFields.forEach(function (childField) {
                    $scope.address[childField] = "";
                    $scope.selectedValue[childField] = "";
                });
            }
        };
        var init = function () {
            var addressWatch = $scope.$watch('address', function () {
                $scope.selectedValue = angular.copy($scope.address);
                if ($scope.address) {
                    addressWatch();
                }
            });
            $scope.addressLevels.reverse();
            var isStrictEntry  = false;
            _.each($scope.addressLevels, function (addressLevel) {
                    addressLevel.isStrictEntry = _.includes($scope.strictEntryAddressFields, addressLevel.addressField) || isStrictEntry;
                    isStrictEntry = addressLevel.isStrictEntry;
            });
            $scope.addressLevels.reverse();
        };
        init();
    });
