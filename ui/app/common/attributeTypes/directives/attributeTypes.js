'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', ['$translate', function ($translate) {
    var modulePrefixMap = {
        'registration': 'REGISTRATION',
        'program': 'PROGRAM',
        'OT': 'OT'
    };
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
            isForm: '=?'
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
            $scope.translateAttributeName = function (attribute, moduleName) {
                var keyPrefix = moduleName && modulePrefixMap[moduleName] ? modulePrefixMap[moduleName] : '';
                keyPrefix = (keyPrefix == '' && attribute.keyPrefix) ? attribute.keyPrefix : '';
                var keyName = attribute.name.toUpperCase().replace(/\s\s+/g, ' ').replace(/[^a-zA-Z0-9 _]/g, "").trim().replace(/ /g, "_");
                var translationKey = keyPrefix + keyName;
                var translation = $translate.instant(translationKey);
                if (translation == translationKey) {
                    return attribute.description;
                }
                return translation;
            };
        }
    };
}]);
