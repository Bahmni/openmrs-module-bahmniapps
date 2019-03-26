'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function () {
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
        controller: function ($scope) {
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

            $scope.appendConceptNameToModel = function (attribute) {
                var attributeValueConceptType = $scope.targetModel[attribute.name];
                var concept = _.find(attribute.answers, function (answer) {
                    return answer.conceptId === attributeValueConceptType.conceptUuid;
                });
                attributeValueConceptType.value = concept && concept.fullySpecifiedName;
            };

            $scope.suggest = function (string) {
                $scope.hideList = false;
                $scope.showTag = true;
                var output = [];
                angular.forEach($scope.suggestions, function (suggestion) {
                    if (suggestion.description.toLowerCase().indexOf(string.value.toLowerCase()) >= 0) {
                        output.push(suggestion);
                    }
                });
                $scope.filterOcuppation = output;
            };

            $scope.hideSuggestions = function (object) {
                $scope.targetModel[$scope.attribute.name] = object;
                $scope.targetModel[$scope.attribute.name].value = object.description;
                $scope.targetModel[$scope.attribute.name].conceptUuid = object.conceptId;
                $scope.hideList = true;
            };
        }
    };
}]);
