'use strict';

angular.module('bahmni.common.controllers', [])
    .controller('CommonHeaderController', ['$scope', '$rootScope', '$route', function ($scope, $rootScope, $route) {

        var createContext = function () {
            if (!$rootScope.context && $route.current) {
                $rootScope.context = {
                    visitUuid: $route.current.params.visitUuid,
                    redirectUrl:  $route.current.params["redirect-url"]
                };
            }
        };

        createContext();

        $scope.$on('$routeChangeStart', createContext);

        $scope.shouldShowBackButton = function () {
            return $rootScope.context 
                && $rootScope.context.redirectUrl 
                && $rootScope.context.redirectUrl.length > 0;
        };
}]);