'use strict';

angular.module('bahmni.common.controllers', [])
    .controller('CommonHeaderController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
        var redirectUrl = $location.search()['redirect-url'] || '/home';

        if (!$rootScope.context) {
            $rootScope.context = {redirectUrl:  redirectUrl};
        }

        $scope.shouldShowBackButton = function () {
            return $rootScope.context
                && $rootScope.context.redirectUrl
                && $rootScope.context.redirectUrl.length > 0;
        };
    }]);