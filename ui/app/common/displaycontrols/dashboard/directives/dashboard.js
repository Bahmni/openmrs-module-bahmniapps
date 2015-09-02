'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')

    .directive('dashboard', [function() {
        var controller = function($scope) {

            var init = function() {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {});
            };

            $scope.isFullPageSection = function(sections) {
                return sections.length === 1 && sections[0]['displayType'] && sections[0]['displayType'] === 'Full-Page';
            };

            $scope.filterOdd = function(index) {
                return function() {
                    return index++ % 2 === 0;
                };
            };

            $scope.filterEven = function(index) {
                return function() {
                    return index++ % 2 === 1;
                };
            };
            var unbindWatch = $scope.$watch('config', init);
            $scope.$on("$stateChangeStart", unbindWatch);
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/dashboard/views/dashboard.html",
            scope: {
                config: "=",
                patient: "=",
                diseaseTemplates: "=",
                sectionGroups: "=",
                visitHistory: "=",
                activeVisitUuid: "=",
                visitSummary: "="
            }
        }
    }]);
