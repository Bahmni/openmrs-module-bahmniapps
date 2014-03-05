angular.module('opd.consultation.controllers')
.controller('ConceptSetPageController', ['$scope','$routeParams', function($scope, $routeParams) {
	$scope.conceptSetName = $routeParams.conceptSetName;
}]);