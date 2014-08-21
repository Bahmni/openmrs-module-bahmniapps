angular.module('bahmni.common.conceptSet')
.controller('ConceptSetGroupController', ['$scope', 'appService', 'contextChangeHandler', function ($scope, appService, contextChangeHandler) {

    $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupValidationHandler($scope.conceptSets);

    contextChangeHandler.add($scope.validationHandler.validate);
}])
.directive('conceptSetGroup', function () {
    return {
        restrict: 'EA',
        scope: {
            conceptSetGroupExtensionId: "=",
            observations: "=",
            allTemplates: "=",
            context: "="
        },
        controller: 'ConceptSetGroupController',
        template: '<div ng-repeat="conceptSet in allTemplates" ng-if="conceptSet.isAvailable(context) && conceptSet.isAdded" class="concept-set-group section-grid">' +
                    '<div ng-click="conceptSet.toggle()" class="concept-set-title">' +
                        '<h2 class="section-title">' + 
                            '<i class="icon-caret-right" ng-hide="conceptSet.isOpen"></i>' +
                            '<i class="icon-caret-down" ng-show="conceptSet.isOpen"></i>' + 
                            '<strong>{{conceptSet.conceptName}}</strong>' +
                        '</h2>' +
                    '</div>' +
                    '<concept-set ng-if="conceptSet.isLoaded" ng-show="conceptSet.isOpen" concept-set-name="conceptSet.conceptName" required="conceptSet.options.required" observations="observations" show-title="false" validation-handler="validationHandler"></concept-set>' +
                  '</div>'
    }
});