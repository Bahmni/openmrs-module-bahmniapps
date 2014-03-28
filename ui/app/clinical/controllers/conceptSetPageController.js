angular.module('bahmni.clinical')
.controller('ConceptSetPageController', ['$scope','$stateParams', function($scope, $stateParams) {
	$scope.conceptSetGroupExtensionId = 'org.bahmni.clinical.conceptSetGroup.' + $stateParams.conceptSetGroupName;
}]);