angular.module('opd.consultation')
.controller('ConceptSetPageController', ['$scope','$stateParams', function($scope, $stateParams) {
	$scope.conceptSetName = $stateParams.conceptSetName;
}]);