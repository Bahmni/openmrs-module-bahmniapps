angular.module('bahmni.common.patient.filters')
	.filter('gender', function() {
	  return function(text) {
	    if(!text) return "Unknown";
	    return text === 'M' ? 'Male' : 'Female';
	  };
	});