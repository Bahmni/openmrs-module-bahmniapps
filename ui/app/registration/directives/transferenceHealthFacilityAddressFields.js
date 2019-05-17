'use strict';
angular.module('bahmni.registration')
    .directive('transferenceHealthFacilityAddressFields', function () {
        return {
            restrict: 'AE',
            templateUrl: 'views/transferenceHealthFacilityAddressFields.html',
            controller: 'TransferenceHealthFacilityAddressFieldsDirectiveController',
            scope: {
                address: '=',
                addressLevels: '=',
                fieldValidation: '=',
                strictAutocompleteFromLevel: '='
            }
        };
    })
    .controller('TransferenceHealthFacilityAddressFieldsDirectiveController', ['$scope', 'addressHierarchyService', '$timeout', function ($scope, addressHierarchyService, $timeout) {
        $scope.addressFieldInvalid = false;
        var selectedAddressUuids = {};
        var selectedUserGeneratedIds = {};

        $scope.provenanceHealthFacilityProvince = "";
        $scope.provenanceHealthFacilityProvince = "";
        $scope.provenanceHealthFacilityDistrict = "";

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

        $scope.addressFieldSelected = function (fieldName) {
            $timeout(function () {
                if (fieldName === "address7" && ($scope.$parent.$parent.patient.TRANSFERENCE_HF_PROVINCE !== undefined)) {
                    $scope.provenanceHealthFacilityProvince = $scope.$parent.$parent.patient.TRANSFERENCE_HF_PROVINCE;
                }
                if (fieldName === "address8" && ($scope.$parent.$parent.patient.TRANSFERENCE_HF_DISTRICT !== undefined)) {
                    $scope.provenanceHealthFacilityDistrict = $scope.$parent.$parent.patient.TRANSFERENCE_HF_DISTRICT;
                }
                if (fieldName === "address10" && ($scope.$parent.$parent.patient.TRANSFERENCE_HF_NAME !== undefined)) {
                    $scope.provenanceHealthFacilityName = $scope.$parent.$parent.patient.TRANSFERENCE_HF_NAME;
                }
            }, 200);
            return function (addressFieldItem) {
                if (fieldName === "address7") {
                    $scope.$parent.$parent.patient.TRANSFERENCE_HF_PROVINCE = addressFieldItem.value;
                }
                if (fieldName === "address8") {
                    $scope.$parent.$parent.patient.TRANSFERENCE_HF_DISTRICT = addressFieldItem.value;
                }
                if (fieldName === "address10") {
                    $scope.$parent.patient.TRANSFERENCE_HF_NAME = addressFieldItem.value;
                }
                var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);

                var parent = addressFieldItem.addressField.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) {
                        return;
                    }
                    if (parentField === "address8") {
                        $scope.$parent.$parent.patient.TRANSFERENCE_HF_DISTRICT = parent.name;
                        document.getElementById("address8_transference").value = parent.name;
                        $scope.provenanceHealthFacilityDistrict = parent.name;
                        parent = parent.parent;
                    }
                    if (parentField === "address7") {
                        $scope.$parent.$parent.patient.TRANSFERENCE_HF_PROVINCE = parent.name;
                        document.getElementById("address7_transference").value = parent.name;
                        $scope.provenanceHealthFacilityProvince = parent.name;
                        parent = parent.parent;
                    }
                });
                $scope.$apply();
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
                return false;
            }
            return true;
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

        $scope.removeSelection = function (event, fieldName) {
            if (event.keyCode === 8) {
                $timeout(function () {
                    if (fieldName === "address7") {
                        $scope.$parent.$parent.patient.TRANSFERENCE_HF_DISTRICT = "";
                        document.getElementById("address8_transference").value = " ";
                        $scope.provenanceHealthFacilityDistrict = " ";
                        $scope.$parent.$parent.patient.TRANSFERENCE_HF_NAME = "";
                        document.getElementById("address10_transference").value = " ";
                        $scope.provenanceHealthFacilityName = "";
                    }

                    if (fieldName === "address8") {
                        $scope.$parent.$parent.patient.TRANSFERENCE_HF_NAME = "";
                        document.getElementById("address10_transference").value = " ";
                        $scope.provenanceHealthFacilityName = " ";
                    }
                }, 200);
            }
        };

        $scope.removeAutoCompleteEntry = function (fieldName) {
            return function () {
                if (fieldName === "address7") {
                    $scope.$parent.$parent.patient.TRANSFERENCE_HF_DISTRICT = "";
                    $scope.provenanceHealthFacilityDistrict = "";

                    $scope.$parent.$parent.patient.TRANSFERENCE_HF_NAME = "";
                    $scope.provenanceHealthFacilityName = "";
                }

                if (fieldName === "address8") {
                    $scope.$parent.$parent.patient.TRANSFERENCE_HF_NAME = "";
                    $scope.provenanceHealthFacilityName = "";
                }
                $scope.selectedValue[fieldName] = null;
            };
        };

        var init = function () {
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
