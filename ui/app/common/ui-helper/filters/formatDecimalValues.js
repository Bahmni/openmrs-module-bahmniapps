angular.module('bahmni.common.uiHelper')
.filter('formatDecimalValues', function() {
	return function(value) {
	    return value.replace(/.0/g,"");
	};
});