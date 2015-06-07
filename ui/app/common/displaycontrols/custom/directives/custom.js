'use strict';

angular.module('bahmni.common.displaycontrol.custom',[])
    .directive('custom',['observationsService',function(observationsService){
	    
	    var controller = function($scope){
		var observationsPromise = observationsService.getObservations($scope.patient.uuid,$scope.config.conceptNames,"latest",$scope.visitUuid);
		var observations = [];
		var successFunction = function (data){
		    observations=data;
		};
		var failureFunction = function(data){
		    window.alert("failure");
		};
		observationsPromise.then(successFunction, failureFunction);
		$scope.observations = observations;
	    };

	    var linkFunction = function(scope,elem,attr) {
		scope.getContentUrl = function() {
		    return "../../bahmni_config/openmrs/customHTMLTemplates/" + attr.templateurl;
		}
	    };

	    return {
		restrict: 'E',
		controller: controller,
		link: linkFunction,
		template: '<div ng-include="getContentUrl()"></div>',
		scope: {
		    patient:"=",
                    visitUuid:"@",
                    section:"=",
                    config:"="
                }
	    }
     }]);