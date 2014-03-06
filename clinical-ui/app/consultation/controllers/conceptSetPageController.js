angular.module('opd.consultation')
.controller('ConceptSetPageController', ['$scope','$routeParams', function($scope, $routeParams) {
	$scope.conceptSetName = $routeParams.conceptSetName;
}]);