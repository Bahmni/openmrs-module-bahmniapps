'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')
    .directive('dashboard', [function () {

        var controller = function ($scope) {

            var init = function () {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {});
                $scope.sections = $scope.dashboard.getSections($scope.diseaseTemplates);

            };

            $scope.getSectionLayout = function (section, index) {

                if (section['displayType'] && section['displayType'] === 'Full-Page') {
                    return "dashboard-section-fullpage";
                }

                if (index % 2 == 0) {
                    return "dashboard-sections dashboard-sections-left";
                } else {
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
