'use strict';

angular.module('bahmni.common.displaycontrol.custom',[])
    .directive('custom',['observationsService','$compile','$http',function(observationsService,$compile,$http){
	    
	    var controller = function($scope){
		/*       		$scope.getContentUrl = function() {
		    return "../../bahmni_config/openmrs/customHTMLTemplates/" + $scope.templateurl;
		    }*/
	    };

	    var linkFunction = function(scope,elem,attr) {

		var getObservationsAndCompileTemplate = function() {
		    var observationsPromise = observationsService.getObservations(scope.patient.uuid,scope.config.conceptNames,"latest",scope.visitUuid);

		    var compileTemplate = function(){
			var compileFn = $compile(scope.template);
			var content = compileFn(scope);
			elem.append(content);
		    };

		    var successFunction = function (data){
			var observations=data.data;
			scope.observations = observations;
			compileTemplate();
		    };
		    var failureFunction = function(data){
			var observations=[];
			scope.observations = observations;
			compileTemplate();
		    };

		    observationsPromise.then(successFunction,failureFunction);
		};

		var templateUrl = "../../bahmni_config/openmrs/customHTMLTemplates/" + scope.templateurl;
		var templatePromise = $http.get(templateUrl);
		
		var templateSuccessFn = function(data){
		    scope.template = data.data;
		    getObservationsAndCompileTemplate();
		};
		
		var templateFailureFn = function(data){
		    elem.append("Failed to load custom template.");
		};

		templatePromise.then(templateSuccessFn, templateFailureFn);



	    };

	    return {
		restrict: 'E',
		controller: controller,
		link: linkFunction,
		    //template: '<div ng-include="getContentUrl()"></div>',
		scope: {
		    patient:"=",
                    visitUuid:"@",
                    section:"=",
		    config:"=",
		    templateurl:"@"
                }
	    }
     }]);