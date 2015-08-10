"use strict";

angular.module('bahmni.common.displaycontrol.navigationlinks')
    .directive('navigationLinks', ['$state', 'appService', function ($state, appService) {
        var controller = function ($scope) {
            if (_.isEmpty($scope.params.links)) {
                $scope.noNavigationLinksMessage = Bahmni.Common.Constants.noNavigationLinksMessage;
            }

            $scope.getUrl = function (link) {
                var url = getFormattedURL(link);
                window.open(url, link.title);
            };

            $scope.showUrl = function (link) {
                var params = getParamsToBeReplaced(link.url), isPropertyNotPresentInLinkParams;

                for (var i in params) {
                    var property = params[i];
                    isPropertyNotPresentInLinkParams = _.isEmpty($scope.linkParams[property]);
                    if (isPropertyNotPresentInLinkParams) {
                        return false;
                    }
                }
                return true;
            };

            var getFormattedURL = function (link) {
                return appService.getAppDescriptor().formatUrl(link.url, $scope.linkParams);
            };

            var getParamsToBeReplaced = function (link) {
                var pattern = /{{([^}]*)}}/g,
                    matches = link.match(pattern), params = [];
                if (matches) {
                    matches.forEach(function (el) {
                        var key = el.replace("{{", '').replace("}}", '');
                        params.push(key);
                    });
                }
                return params;
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
