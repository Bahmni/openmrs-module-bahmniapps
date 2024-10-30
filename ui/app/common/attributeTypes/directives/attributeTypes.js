'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function () {
    return {
        scope: {
            targetModel: '=',
            attribute: '=',
            fieldValidation: '=',
            isAutoComplete: '&',
            getAutoCompleteList: '&',
            getDataResults: '&',
            handleUpdate: '&',
            isReadOnly: '&',
            isForm: '=?',
            defaultDescription: "="
        },
        templateUrl: '../common/attributeTypes/views/attributeInformation.html',
        restrict: 'E',
        controller: function ($scope, $translate) {
            $scope.getAutoCompleteList = $scope.getAutoCompleteList();
            $scope.getDataResults = $scope.getDataResults();
            // to avoid watchers in one way binding
            $scope.isAutoComplete = $scope.isAutoComplete() || function () { return false; };
            $scope.isReadOnly = $scope.isReadOnly() || function () { return false; };
            $scope.handleUpdate = $scope.handleUpdate() || function () { return false; };

            $scope.appendConceptNameToModel = function (attribute) {
                var attributeValueConceptType = $scope.targetModel[attribute.name];
                var concept = _.find(attribute.answers, function (answer) {
                    return answer.conceptId === attributeValueConceptType.conceptUuid;
                });
                attributeValueConceptType.value = concept && concept.fullySpecifiedName;
            };
            $scope.getTranslatedAttributeTypes = function (attribute) {
                var translatedName = Bahmni.Common.Util.TranslationUtil.translateAttribute(attribute, Bahmni.Common.Constants.patientAttribute, $translate);
                return translatedName;
            };
            /**
             * Initialize default selection
             */
            $scope.setDefaultOption = function () {
                if ($scope.defaultDescription) {
                    var defaultOption = _.find($scope.attribute.answers, function (answer) {
                        return answer.description === $scope.defaultDescription;
                    });

                    if (
                        defaultOption &&
                        $scope &&
                        $scope.attribute &&
                        $scope.attribute.name &&
                        !$scope.targetModel[$scope.attribute.name] &&
                        (!$scope.targetModel[$scope.attribute.name] || !$scope.targetModel[$scope.attribute.name].conceptUuid)) {
                        $scope.targetModel[$scope.attribute.name] = {
                            conceptUuid: defaultOption.conceptId,
                            value: defaultOption.fullySpecifiedName
                        };
                    }
                }
            };
        }
    };
}]);
