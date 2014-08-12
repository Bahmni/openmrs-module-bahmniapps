angular.module('bahmni.clinical')
.controller('ConceptSetPageController', ['$scope', '$stateParams', 'conceptSetService','appService','MessagingService', function($scope, $stateParams, conceptSetService,appService,messagingService) {
	$scope.selectedObsTemplate = [];
	$scope.conceptSetGroupExtensionId = 'org.bahmni.clinical.conceptSetGroup.' + $stateParams.conceptSetGroupName;
    var extensions = appService.getAppDescriptor().getExtensions($scope.conceptSetGroupExtensionId, "config");

	var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.consultation.visitTypeUuid);
	$scope.context = {visitType:  visitType, patient: $scope.patient};

	var numberOfLevels = 2;
    var fields = ['uuid','name'];
    var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
    conceptSetService.getConceptSetMembers({name:"All Observation Templates",v:"custom:"+customRepresentation}).success(function(response){
        var allTemplates = response.results[0].setMembers;
	    var allConceptSections  = allTemplates.map(function(template){
		    var conceptSetConfig = _.find(extensions,function(extension){
			    return extension.extensionParams.conceptName === template.name.name;
		    }) || {};
		    return new Bahmni.ConceptSet.ConceptSetSection(conceptSetConfig, $scope.consultation.observations,template);
	    });
        $scope.selectedObsTemplate= allConceptSections.filter(function(conceptSet){ return conceptSet.isAvailable($scope.context); });
	    if ($scope.selectedObsTemplate.length) { $scope.selectedObsTemplate[0].show(); };
    });

    $scope.showOrHideTemplate = function(template){
        if(!template.toggleAdded()){
	        messagingService.showMessage("error","Templates having data cannot be unselected. Please Clear the data and try again");
        };
        $scope.showTemplates = !$scope.showTemplates;
    }
}]);