'use strict';

angular.module('bahmni.common.uiHelper')
 .service('contextChangeHandler', [function() {
	var callbacks = []; 

	this.reset = function() {
	    callbacks = []; 
	};

	this.add = function(callback) {
	    callbacks.push(callback);
	};

	this.execute = function() {
	    var allow = true;
	    callbacks.forEach(function(callback){
	        allow = allow && callback();
	    });
	    return allow;
	};
}]);