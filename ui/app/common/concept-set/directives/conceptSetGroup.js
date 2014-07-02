angular.module('bahmni.common.conceptSet')
.controller('ConceptSetGroupController', ['$scope', 'appService', 'contextChangeHandler', function ($scope, appService, contextChangeHandler) {
    var extensions = appService.getAppDescriptor().getExtensions($scope.conceptSetGroupExtensionId, "config");
    $scope.conceptSets = extensions.map(function(extension) { return new Bahmni.ConceptSet.ConceptSetSection(extension.extensionParams); });
    var availableConceptSets = $scope.conceptSets.filter(function(conceptSet){ return conceptSet.isAvailable($scope.context); });
    if (availableConceptSets.length) { availableConceptSets[0].show(); };

    $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupValidationHandler($scope.conceptSets);

    contextChangeHandler.add($scope.validationHandler.validate);

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
        template: '<div ng-repeat="conceptSet in conceptSets" ng-if="conceptSet.isAvailable(context)" class="concept-set-group section-grid">' +
                    '<div ng-click="conceptSet.toggle()" class="concept-set-title">' +
                        '<legend class="mylegend">' + 
                            '<i class="icon-caret-right" ng-hide="conceptSet.isOpen"></i>' +
                            '<i class="icon-caret-down" ng-show="conceptSet.isOpen"></i>' + 
                            '<strong>{{conceptSet.options.conceptName}}</strong>' + 
                        '</legend>' +
                    '</div>' +
                    '<concept-set ng-if="conceptSet.isLoaded" ng-show="conceptSet.isOpen" concept-set-name="conceptSet.options.conceptName" required="conceptSet.options.required" observations="observations" show-title="false" validation-handler="validationHandler"></concept-set>' +
                  '</div>'
    }
});