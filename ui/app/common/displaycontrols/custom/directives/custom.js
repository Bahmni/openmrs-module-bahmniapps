'use strict';

angular.module('bahmni.common.displaycontrol.custom',[])
    .directive('custom',['observationsService','$compile','$http',function(observationsService,$compile,$http){
	    
	    var controller = function($scope){

	    };

	    var linkFunction = function(scope,elem,attr) {
		var customDirectiveHelper = new CustomDirectiveHelper(scope,$http,observationsService,$compile,elem);
		customDirectiveHelper.loadScopeAndCompileTemplate();
	    };

	    return {
		restrict: 'E',
		controller: controller,
		link: linkFunction,
		scope: {
		    patient:"=",
                    visitUuid:"@",
                    section:"=",
		    config:"=",
		    templateurl:"@"
                }
	    }
     }]);