'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function() {
    return {
        scope : {
            targetModel : '=',
            attribute : '=',
            fieldValidation : '=',
            isAutoComplete: '&',
            getAutoCompleteList: '&',
            getDataResults: '&',
            isReadOnly: '&'
        },
        templateUrl : '../common/attributeTypes/views/attributeInformation.html',
        restrict : 'E',
        controller: function($scope){
            $scope.getAutoCompleteList = $scope.getAutoCompleteList();
            $scope.getDataResults = $scope.getDataResults();
            //to avoid watchers in one way binding
            $scope.isAutoComplete = $scope.isAutoComplete() || function(){return false};
            $scope.isReadOnly = $scope.isReadOnly() || function(){return false};
        }
    }
}]);