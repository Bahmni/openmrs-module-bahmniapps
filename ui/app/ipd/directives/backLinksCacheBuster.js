"use strict";

angular.module('bahmni.ipd')
    .directive('backLinksCacheBuster', ['$state', '$window', function ($state, $window) {
        var controller = function ($scope, $state, $window) {
            $scope.navigationLinks = $state.current.data.navigationLinks;
            $scope.homeBackLink = $state.current.data.homeBackLink;
            $scope.isCurrentState = function (link) {
                return _.includes($state.current.name, link.value);
            };
            $scope.linkAction = function (type, value, params) {
                if (type === 'state') {
                    onClickState(value, params);
                } else {
                    $window.location.href = value;
                }
            };

            var onClickState = function (value, params) {
                if (!params) {
                    params = {};
                }
                params['dashboardCachebuster'] = Math.random();
                $state.go(value, params);
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "views/backLinks.html",
            scope: {
                type: "=",
                name: "=",
                value: "=",
                params: "=",
                icon: "=",
                accessKey: "="
            }
        };
    }]);
