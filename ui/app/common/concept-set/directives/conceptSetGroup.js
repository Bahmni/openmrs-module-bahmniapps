angular.module('bahmni.common.conceptSet')
.controller('ConceptSetGroupController', ['$scope', 'appService', function ($scope, appService) {
    var extensions = appService.getAppDescriptor().getExtensions($scope.conceptSetGroupExtensionId, "config");
    $scope.conceptSets = extensions.map(function(extension) { return new Bahmni.ConceptSet.ConceptSetSection(extension.extensionParams); });
    var availableConceptSets = $scope.conceptSets.filter(function(conceptSet){ return conceptSet.isAvailable($scope.context); });
    if (availableConceptSets.length) {
        availableConceptSets[0].show();
    };
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
        template: '<div ng-repeat="conceptSet in conceptSets" class="concept-set-group">' +
                    '<span ng-click="conceptSet.toggle()" ng-if="conceptSet.isAvailable()">' +
                        '<legend class="mylegend">' + 
                            '<i class="icon-caret-right" ng-hide="conceptSet.isOpen"></i>' +
                            '<i class="icon-caret-down" ng-show="conceptSet.isOpen"></i>' + 
                            '<strong>{{conceptSet.options.conceptName}}</strong>' + 
                        '</legend>' +
                    '</span>' +
                    '<concept-set ng-if="conceptSet.isLoaded" ng-show="conceptSet.isOpen" concept-set-name="conceptSet.options.conceptName" observations="observations" show-title="false"></concept-set>' +
                  '</div>'
    }
});