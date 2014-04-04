angular.module('bahmni.common.conceptSet')
    .directive('conceptSetGroup', ['appService', function (appService) {
        var controller = function($scope) {
            $scope.extensions = appService.getAppDescriptor().getExtensions($scope.conceptSetGroupExtensionId, "config");
        }

        return {
            restrict: 'EA',
            scope: {
                conceptSetGroupExtensionId: "=",
                observations: "="
            },
            controller: controller,
            template: '<div ng-repeat="extension in extensions">' +
                            '<concept-set concept-set-name="extension.extensionParams.conceptName" observations="observations"></concept-set>' +
                      '</div>'
        }
    }]);