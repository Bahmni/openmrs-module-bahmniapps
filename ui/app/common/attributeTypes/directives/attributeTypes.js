'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', ['messagingService', function (messagingService) {
    return {
        scope: {
            targetModel: '=',
            attribute: '=',
            fieldValidation: '=',
            isAutoComplete: '&',
            handleLocationChange: '&',
            handleSectorChange: '&',
            getAutoCompleteList: '&',
            getDataResults: '&',
            handleUpdate: '&',
            isReadOnly: '&',
            isForm: '=?'
        },
        templateUrl: '../common/attributeTypes/views/attributeInformation.html',
        restrict: 'E',
        controller: function ($scope, $timeout, $rootScope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.getAutoCompleteList = $scope.getAutoCompleteList();
            $scope.getDataResults = $scope.getDataResults();
            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());
            // to avoid watchers in one way binding
            $scope.isAutoComplete = $scope.isAutoComplete() || function () { return false; };
            $scope.isReadOnly = $scope.isReadOnly() || function () { return false; };
            $scope.handleUpdate = $scope.handleUpdate() || function () { return false; };
            $scope.handleLocationChange = $scope.handleLocationChange() || function () { return false; };
            $scope.handleSectorChange = $scope.handleSectorChange() || function () { return false; };
            $scope.suggestions = $scope.attribute.answers;

            $scope.showTag = false;
            $scope.borderColor = "1px solid #d1d1d1";
            $rootScope.canSave = true;

            if ($scope.attribute.name === "PATIENT_STATUS") {
                for (var i = 0; i < $scope.attribute.answers.length; i++) {
                    if ($scope.attribute.answers[i].fullySpecifiedName === "Pre TARV") {
                        $rootScope.patientPreTARVStatusUiid = $scope.attribute.answers[i].conceptId;
                    }
                }
            }

            $scope.appendConceptNameToModel = function (attribute) {
                $timeout(function () {
                    if (attribute.name === "TYPE_OF_REGISTRATION") {
                        if ($scope.targetModel.TYPE_OF_REGISTRATION.value === "NEW_PATIENT") {
                            $scope.targetModel.PATIENT_STATUS.conceptUuid = $rootScope.patientPreTARVStatusUiid;
                        }
                    } }, 15);

                var attributeValueConceptType = $scope.targetModel[attribute.name];
                var concept = _.find(attribute.answers, function (answer) {
                    return answer.conceptId === attributeValueConceptType.conceptUuid;
                });
                attributeValueConceptType.value = concept && concept.fullySpecifiedName;
                $rootScope.typeOfRegistrationSelected = attributeValueConceptType.value;
            };

            $scope.suggest = function (string) {
                $scope.borderColor = "1px solid #d1d1d1";
                $scope.hideList = false;
                $scope.showTag = true;
                var output = [];
                if (string.value.length >= 2) {
                    angular.forEach($scope.suggestions, function (suggestion) {
                        if (suggestion.description.toLowerCase().indexOf(string.value.toLowerCase()) >= 0) {
                            output.push(suggestion);
                        }
                    });
                    $scope.filterOcuppation = output;
                } else {
                    $scope.hideList = true;
                }
            };

            $scope.hideSuggestions = function (object) {
                $scope.targetModel[$scope.attribute.name] = object;
                $scope.targetModel[$scope.attribute.name].value = object.description;
                $scope.targetModel[$scope.attribute.name].conceptUuid = object.conceptId;
                $scope.hideList = true;
                $rootScope.canSave = true;
                $scope.borderColor = "1px solid #d1d1d1";
            };

            $scope.validateField = function (isMouse) {
                if ($scope.targetModel[$scope.attribute.name] !== undefined && $scope.targetModel[$scope.attribute.name].value !== "" && $scope.targetModel[$scope.attribute.name] !== null) {
                    var alert = true;
                    $timeout(function () {
                        for (var i = 0; i < $scope.suggestions.length; i++) {
                            if ($scope.targetModel[$scope.attribute.name].value.toLowerCase() === $scope.suggestions[i].description.toLowerCase()) {
                                alert = false;
                            }
                        }
                        if (alert) {
                            $scope.borderColor = "1px solid #ff5252";
                            if (!isMouse) {
                                messagingService.showMessage("error", "INVALID_OCCUPATION");
                                $scope.hideList = true;
                            }
                            $rootScope.canSave = false;
                        }
                    }, 500);
                } else {
                    $rootScope.canSave = true;
                    if (!isMouse) { $scope.hideList = true; }
                    $scope.targetModel[$scope.attribute.name] = { value: "", conceptUuid: null };
                }
            };
        }
    };
}]);
