'use strict';

angular.module('bahmni.registration')
    .directive('topDownAddressFields', function () {
        return {
            restrict: 'AE',
            templateUrl: 'views/topDownAddressFields.html',
            controller: 'TopDownAddressFieldsDirectiveController',
            scope: {
                address: '=',
                addressLevels: '=',
                fieldValidation: '=',
                freeTextAddressFields: '='
            }
        };
    })
    .controller('TopDownAddressFieldsDirectiveController', function ($scope, addressAttributeService) {
        $scope.addressFieldInvalid = false;

        var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
        var addressLevelUIOrderBasedOnConfig = $scope.addressLevels;
        $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelUIOrderBasedOnConfig, 2)
        var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function (addressLevel) {
            return addressLevel.addressField;
        });
        var autocompletedFields = [];
        $scope.addressFieldSelected = function (fieldName) {
            return function (addressFieldItem) {
                var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
                var parent = addressFieldItem.addressField.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) return;
                    $scope.address[parentField] = parent.name;
                    parent = parent.parent;
                });
                autocompletedFields = [];
                autocompletedFields.push(fieldName);
                autocompletedFields = autocompletedFields.concat(parentFields);
            }
        };

        $scope.findParentField = function (fieldName) {
            var found = _.find($scope.addressLevels, {addressField: fieldName});
            var index = _.findIndex($scope.addressLevels, found);
            var parentFieldName;
            var topLevel = 0;
            if (index != topLevel) {
                var parent = $scope.addressLevels[index - 1];
                parentFieldName = parent.addressField;
            }
            return parentFieldName;
        };

        $scope.isReadOnly = function (fieldName) {
            var parentFieldName = $scope.findParentField(fieldName);
            var parentValue = $scope.address[parentFieldName];
            var parentValueInvalid = isParentValueInvalid(parentFieldName);
            if (!parentFieldName) {
                return false;
            }
            if (parentFieldName && !parentValue) {
                return true;
            }
            return parentFieldName && parentValue && parentValueInvalid;
        };

        var isParentValueInvalid = function (parentId) {
            return angular.element($("#" + parentId)).hasClass('illegalValue');
        };

        $scope.getAddressEntryList = function (field) {
            return function (searchAttrs) {
                var parentField = $scope.findParentField(field);
                var parentName = $scope.address[parentField];
                return addressAttributeService.search(field, searchAttrs.term, parentField, parentName);
            };
        };

        var getNextAvailableParentName = function (addressField) {
            var parent = addressField.parent;
            while (parent) {
                if (parent.name) return parent.name;
                else parent = parent.parent;
            }
        };

        $scope.getAddressDataResults = function (data) {
            return data.data.map(function (addressField) {
                var parentName = getNextAvailableParentName(addressField);
                return {
                    'value': addressField.name,
                    'label': addressField.name + ( parentName ? ", " + parentName : "" ),
                    addressField: addressField
                }
            });
        };
        $scope.clearFields = function (fieldName) {
            var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
            childFields.forEach(function (childField) {
                if (!$scope.isFreeTextAddressField(childField)) {
                    $scope.address[childField] = "";
                }
            });
        };

        $scope.isFreeTextAddressField = function (field) {
            return $scope.freeTextAddressFields && _.contains($scope.freeTextAddressFields, field)
        }
    });
