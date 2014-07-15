angular.module('bahmni.common.uiHelper')
.directive('toggle', function() {
	var link = function($scope, element, attrs) {
		$scope.$watch("toggle", function(value) {
			$(element).toggleClass('active', value) 
		});

		$(element).click(function() {
			$scope.$apply(function() {
				$scope.toggle = !$scope.toggle
			});
		});
	} 

	return {
		scope: {
		  toggle: "="
		},
		link: link
	}
});