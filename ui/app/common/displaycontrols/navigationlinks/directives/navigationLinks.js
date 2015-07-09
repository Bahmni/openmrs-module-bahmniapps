"use strict";

angular.module('bahmni.common.displaycontrol.navigationlinks')
    .directive('navigationLinks', ['$state', '$urlMatcherFactory', function ($state, $urlMatcherFactory) {
        var controller = function($scope) {
            if (_.isEmpty($scope.params.links)) {
                $scope.noNavigationLinksMessage = Bahmni.Common.Constants.noNavigationLinksMessage;
            }

            $scope.getUrl = function(link) {
                return $urlMatcherFactory.compile(link.url).format($scope.linkParams);
            }
        };

        return {
            restrict: 'E',
            controller:controller,
            templateUrl: "../common/displaycontrols/navigationlinks/views/navigationLinks.html",
            scope: {
                params: "=",
                linkParams: "="
            }
        };
    }]);
