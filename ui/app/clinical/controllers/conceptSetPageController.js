angular.module('bahmni.clinical')
.controller('ConceptSetPageController', ['$scope', '$stateParams', function($scope, $stateParams) {
	$scope.conceptSetGroupExtensionId = 'org.bahmni.clinical.conceptSetGroup.' + $stateParams.conceptSetGroupName;
	var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.consultation.visitTypeUuid);
	$scope.context = {visitType:  visitType, patient: $scope.patient};
}]);