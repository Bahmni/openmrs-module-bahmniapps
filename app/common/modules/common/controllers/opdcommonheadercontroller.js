'use strict';

angular.module('bahmni.common.controllers', [])
    .controller('CommonHeaderController', ['$scope', '$rootScope', '$route', function ($scope, $rootScope, $route) {

        if (!$rootScope.context) {
            $rootScope.context = {
                visitUuid: $route.current.params.visitUuid,
                redirectUrl:  $route.current.params["redirect-url"]
            };
        }

        $scope.shouldShowBackButton = function() {
            return $rootScope.context && $rootScope.context.redirectUrl && $rootScope.context.redirectUrl.length > 0;
        };
}]);

