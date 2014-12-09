angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$location', '$anchorScroll', '$stateParams', 'conceptSetService', 'clinicalConfigService', 'messagingService',
        function ($scope, $rootScope, $location, $anchorScroll, $stateParams, conceptSetService, clinicalConfigService, messagingService) {

            $rootScope.consultation.selectedObsTemplate = $rootScope.consultation.selectedObsTemplate || [];
    $scope.scrollingEnabled = false;
    var extensions = clinicalConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
    var configs = clinicalConfigService.getAllConceptsConfig();
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
                var conceptSetExtension = _.find(extensions,function(extension){
                    return extension.extensionParams.conceptName === template.name.name;
                }) || {};
                var conceptSetConfig = configs[template.name.name] || {};
                return new Bahmni.ConceptSet.ConceptSetSection(conceptSetExtension, conceptSetConfig,  $scope.consultation.observations,template);
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

    $scope.toggleTemplate = function(template){
        $scope.scrollingEnabled = true;

        if(!template.canToggle()){
	        messagingService.showMessage("error","Templates having data cannot be unselected. Please Clear the data and try again");
        } else {
            template.toggle();
            if(template.isAdded){
                messagingService.showMessage("info",template.conceptName+" Added successfully");
            } else if(!template.isAdded){
                messagingService.showMessage("info",template.conceptName+" Removed successfully");
            }
        }
    };

}]);