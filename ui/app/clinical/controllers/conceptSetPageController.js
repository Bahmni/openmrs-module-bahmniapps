angular.module('bahmni.clinical')
.controller('ConceptSetPageController', ['$scope','$rootScope','$location', '$anchorScroll', '$stateParams', 'conceptSetService','appService','MessagingService',
        function($scope,$rootScope,$location, $anchorScroll, $stateParams, conceptSetService,appService,messagingService) {

	$rootScope.consultation.selectedObsTemplate = $rootScope.consultation.selectedObsTemplate || [];
    $scope.scrollingEnabled = false;
	$scope.conceptSetGroupExtensionId = 'org.bahmni.clinical.conceptSetGroup.' + $stateParams.conceptSetGroupName;
    var extensions = appService.getAppDescriptor().getExtensions($scope.conceptSetGroupExtensionId, "config");
	var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.consultation.visitTypeUuid);
	$scope.context = {visitType:  visitType, patient: $scope.patient};
	var numberOfLevels = 2;
    var fields = ['uuid','name', 'names'];
    var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);

    var showFirstTemplate = function () {
        for (var index in $rootScope.consultation.selectedObsTemplate) {
            var template = $rootScope.consultation.selectedObsTemplate[index];
            if (template.isAdded) {
                template.show();
                break;
            }
        }
    };

    if($rootScope.consultation.selectedObsTemplate.length == 0){
        conceptSetService.getConceptSetMembers({name:"All Observation Templates",v:"custom:"+customRepresentation}).success(function(response){
            var allTemplates = response.results[0].setMembers;
            var allConceptSections  = allTemplates.map(function(template){
                var conceptSetConfig = _.find(extensions,function(extension){
                    return extension.extensionParams.conceptName === template.name.name;
                }) || {};
                return new Bahmni.ConceptSet.ConceptSetSection(conceptSetConfig, $scope.consultation.observations,template);
            });
            $rootScope.consultation.selectedObsTemplate= allConceptSections.filter(function(conceptSet){
                if(conceptSet.isAvailable($scope.context)){
                    if(conceptSet.conceptName !== Bahmni.Clinical.Constants.dischargeSummaryConceptName || $rootScope.visit.hasAdmissionEncounter()){
                        return true;
                    }
                }
            });
            showFirstTemplate();
        });
    }


    $scope.showOrHideTemplate = function(template){
         $scope.scrollingEnabled = true;
        if(!template.toggleAdded()){
	        messagingService.showMessage("error","Templates having data cannot be unselected. Please Clear the data and try again");
        } else if(template.isAdded){
    		messagingService.showMessage("info",template.conceptName+" Added successfully");
        } else if(!template.isAdded){
    		messagingService.showMessage("info",template.conceptName+" Removed successfully");
        }

        $scope.showTemplates = !$scope.showTemplates;
    };

    $scope.closeTemplatesPopup = function(){
        $scope.showTemplates = false;
    }
}]);