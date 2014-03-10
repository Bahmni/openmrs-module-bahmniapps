angular.module('bahmni.clinical')
.controller('ConceptSetPageController', ['$scope','$stateParams', function($scope, $stateParams) {
	$scope.conceptSetName = $stateParams.conceptSetName;
}]);