"use strict";

angular.module('bahmni.common.displaycontrol.navigationlinks')
    .directive('navigationLinks', ['$state', '$urlMatcherFactory', function ($state, $urlMatcherFactory) {
        var controller = function ($scope) {
            if (_.isEmpty($scope.params.links)) {
                $scope.noNavigationLinksMessage = Bahmni.Common.Constants.noNavigationLinksMessage;
            }
            ;

            $scope.getUrl = function (link) {
                return $urlMatcherFactory.compile(link.url).format($scope.linkParams);
            };

            $scope.showUrl = function (link) {
                var params = $urlMatcherFactory.compile(link.url).params, isPropertyNotPresentInLinkParams;

                for (var property in params) {
                    if(!params.hasOwnProperty(property)) {
                        continue;
                    }
                    isPropertyNotPresentInLinkParams = isEmpty($scope.linkParams[property]) || !$scope.linkParams.hasOwnProperty(property);
                    if (isPropertyNotPresentInLinkParams) {
                        return false;
                    }
                }
                return true;
            };

            var isEmpty = function(property) {
                return (!property || property.length === 0);
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/navigationlinks/views/navigationLinks.html",
            scope: {
                params: "=",
                linkParams: "="
            }
        };
    }]);
