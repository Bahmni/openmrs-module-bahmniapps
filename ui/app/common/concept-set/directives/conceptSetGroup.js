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
                        '<fieldset>' +
                            '<legend>{{extension.label}}</legend>' +
                            '<show-concept-set concept-set-name="extension.extensionParams.conceptName" observations="observations"></show-concept-set>' +
                        '</fieldset>' +
                      '</div>'
        }
    }]);