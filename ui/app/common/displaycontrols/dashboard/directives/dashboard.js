'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')
    .directive('dashboard', [function () {

        var controller = function ($scope) {

            var init = function () {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {});
                $scope.sections = $scope.dashboard.getSections($scope.diseaseTemplates);

            };

            var shouldCurrentSectionBeLeft = true;

            $scope.getSectionLayout = function (section) {
                if (section['displayType'] && section['displayType'] === 'Full-Page') {
                    shouldCurrentSectionBeLeft = true;
                    return "dashboard-section-fullpage";
                }
                if (shouldCurrentSectionBeLeft === true) {
                    shouldCurrentSectionBeLeft = false;
                    return "dashboard-sections dashboard-sections-left";
                } else {
                    shouldCurrentSectionBeLeft = true;
                    return "dashboard-sections dashboard-sections-right";
                }
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
                visitHistory: "=",
                activeVisitUuid: "=",
                visitSummary: "="
            }
        }
    }]);
