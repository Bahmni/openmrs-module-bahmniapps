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
                strictAutocompleteFromLevel: '='
            }
        };
    })
    .controller('TopDownAddressFieldsDirectiveController', ['$scope', 'addressHierarchyService', '$translate', function ($scope, addressHierarchyService, $translate) {
        $scope.addressFieldInvalid = false;
        var selectedAddressUuids = {};
        var selectedUserGeneratedIds = {};
        var modulePrefixMap = {
            'registration': 'REGISTRATION',
            'program': 'PROGRAM',
            'OT': 'OT'
        };
        var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
        var addressLevelUIOrderBasedOnConfig = $scope.addressLevels;
        $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelUIOrderBasedOnConfig, 2);
        var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function (addressLevel) {
            return addressLevel.addressField;
        });

        var populateSelectedAddressUuids = function (levelIndex, parentUuid) {
            if ($scope.addressLevels.length === 0 || !$scope.addressLevels[levelIndex]) {
                return;
            }

            var fieldName = $scope.addressLevels[levelIndex].addressField;
            var addressValue = $scope.address[fieldName];
            if (addressValue) {
                addressHierarchyService.search(fieldName, addressValue, parentUuid).then(function (response) {
                    var address = response && response.data && response.data[0];
                    if (address) {
                        selectedAddressUuids[fieldName] = address.uuid;
                        selectedUserGeneratedIds[fieldName] = address.userGeneratedId;
                        populateSelectedAddressUuids(levelIndex + 1, address.uuid);
                    }
                });
            }
        };
        $scope.getTranslatedTopAddress = function (address) {
            var translatedName = Bahmni.Common.Util.TranslationUtil.translateAttribute(address, Bahmni.Common.Constants.registration, $translate);
            return translatedName;
        };
        $scope.addressFieldSelected = function (fieldName) {
            return function (addressFieldItem) {
                selectedAddressUuids[fieldName] = addressFieldItem.addressField.uuid;
                selectedUserGeneratedIds[fieldName] = addressFieldItem.addressField.userGeneratedId;
                $scope.selectedValue[fieldName] = addressFieldItem.addressField.name;
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
            };
        };

        $scope.findParentField = function (fieldName) {
            var found = _.find($scope.addressLevels, {addressField: fieldName});
            var index = _.findIndex($scope.addressLevels, found);
            var parentFieldName;
            var topLevel = 0;
            if (index !== topLevel) {
                var parent = $scope.addressLevels[index - 1];
                parentFieldName = parent.addressField;
            }
            return parentFieldName;
        };

        $scope.isReadOnly = function (addressLevel) {
            if (!$scope.address) {
                return false;
            }
            if (!addressLevel.isStrictEntry) {
                return false;
            }
            var fieldName = addressLevel.addressField;
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

        var parentUuid = function (field) {
            return selectedAddressUuids[$scope.findParentField(field)];
        };

        $scope.getAddressEntryList = function (field) {
            return function (searchAttrs) {
                return addressHierarchyService.search(field, searchAttrs.term, parentUuid(field));
            };
        };

        $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults;

        $scope.clearFields = function (fieldName) {
            var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
            childFields.forEach(function (childField) {
                if ($scope.selectedValue[childField] !== null) {
                    $scope.address[childField] = null;
                    $scope.selectedValue[childField] = null;
                    selectedAddressUuids[childField] = null;
                    selectedUserGeneratedIds[childField] = null;
                }
            });

            if (_.isEmpty($scope.address[fieldName])) {
                $scope.address[fieldName] = null;
                selectedUserGeneratedIds[fieldName] = null;
            }
        };

        $scope.removeAutoCompleteEntry = function (fieldName) {
            return function () {
                $scope.selectedValue[fieldName] = null;
            };
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
            var deregisterAddressWatch = $scope.$watch('address', function (newValue) {
                if (newValue !== undefined) {
                    populateSelectedAddressUuids(0);
                    $scope.selectedValue = _.mapValues($scope.address, function (value, key) {
                        var addressLevel = _.find($scope.addressLevels, {addressField: key});
                        return addressLevel && addressLevel.isStrictEntry ? value : null;
                    });
                    deregisterAddressWatch();
                }
            });
        };
        init();
    }]);
