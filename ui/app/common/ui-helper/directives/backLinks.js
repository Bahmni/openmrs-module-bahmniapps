'use strict';

angular.module('bahmni.common.uiHelper')
.directive('bmBackLinks', function() {
	return {
		template: '<ul>' +
					    '<li ng-repeat="backLink in backLinks">' +
					        '<a class="back-btn" ng-if="backLink.action" ng-click="backLink.action()"> <span>{{backLink.label}}</span> </a>' +
					        '<a class="back-btn" ng-if="backLink.url" ng-href="{{backLink.url}}"> <span>{{backLink.label}}</span> </a>' +
					        '<a class="back-btn" ng-if="backLink.state" ui-sref="{{backLink.state}}"> <span>{{backLink.label}}</span> </a>' +
					    '</li>' +
					'</ul>',
		controller: function ($scope, backlinkService) {
	        $scope.backLinks = backlinkService.getAllUrls();
	        $scope.$on('$stateChangeSuccess', function (event, state, params, fromState, fromParams) {
	            if (state.data && state.data.backLinks) {
	                backlinkService.setUrls(state.data.backLinks);
	                $scope.backLinks = backlinkService.getAllUrls();
	            }
	        });
	    },
	    restrict: 'E'
	}
});
