"use strict";

angular.module('bahmni.ipd')
    .directive('backLinksCacheBuster', ['$state', '$window', function ($state, $window) {
        var controller = function ($scope, $state, $window) {
            $scope.navigationLinks = $state.current.data.navigationLinks;
            $scope.homeBackLink = $state.current.data.homeBackLink;
            $scope.isCurrentState = function (link) {
                if (($state.current.name === "home" || $state.current.name === "bedManagement.patient") && link.name === "ADMIT_HOME_KEY") {
                    return true;
                } else if (($state.current.name === "bedManagement" || $state.current.name === "bedManagement.bed") && link.name === "BED_MANAGEMENT_KEY") {
                    return true;
                }
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
