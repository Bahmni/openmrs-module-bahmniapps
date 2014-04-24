angular.module('bahmni.common.conceptSet')
.controller('ConceptSetGroupController', ['$scope', 'appService', function ($scope, appService) {
    $scope.extensions = appService.getAppDescriptor().getExtensions($scope.conceptSetGroupExtensionId, "config");

    $scope.showConceptSet = function(extension) {
        var context = $scope.context || {};
        var extensionParams = extension.extensionParams || {};
        var showIfFunctionStrings = extensionParams.showIf || [];
        if(showIfFunctionStrings.length === 0) return true;
        var showIf = new Function("context", showIfFunctionStrings.join('\n'));
        return showIf(context);
    }
}])
.directive('conceptSetGroup', function () {
    return {
        restrict: 'EA',
        scope: {
            conceptSetGroupExtensionId: "=",
            observations: "=",
            context: "="
        },
        controller: 'ConceptSetGroupController',
        template: '<div ng-repeat="extension in extensions">' +
                    '<concept-set ng-if=showConceptSet(extension) concept-set-name="extension.extensionParams.conceptName" observations="observations"></concept-set>' +
                  '</div>'
    }
});