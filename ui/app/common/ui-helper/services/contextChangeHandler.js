'use strict';

angular.module('bahmni.common.uiHelper')
 .service('contextChangeHandler', ['$rootScope', function($rootScope) {
	var callbacks = [];
    var self = this;

    $rootScope.$on('$stateChangeSuccess',function(){
        self.reset();
    });

	this.reset = function() {
	    callbacks = []; 
	};

	this.add = function(callback) {
	    callbacks.push(callback);
	};

    this.execute = function () {
        var allow = true;
        var callBackReturn = null;
        callbacks.forEach(function (callback) {
            callBackReturn = callback();
            allow = allow && callBackReturn["allow"];
        });
        if (callBackReturn && callBackReturn["errorMessage"] != null) {
            return {allow: allow, errorMessage: callBackReturn["errorMessage"]};
        }
        return {allow: allow};

    };
 }]);