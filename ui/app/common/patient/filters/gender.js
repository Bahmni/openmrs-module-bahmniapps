angular.module('bahmni.common.patient')
.filter('gender', function() {
	return function(text) {
		if(!text) return "Unknown";
		return text === 'M' ? 'Male' : 'Female';
	};
});