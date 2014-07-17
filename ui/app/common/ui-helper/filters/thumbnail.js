angular.module('bahmni.common.uiHelper')
.filter('thumbnail', function() {
	return function(url) {
	    return Bahmni.Common.Constants.documentsPath + '/' + url.replace(/(.*)\.(.*)$/, "$1_thumbnail.$2") || null;
	};
});