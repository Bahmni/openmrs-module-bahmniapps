'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')

    .directive('dashboard', [function() {
        var controller = function($scope) {

            var init = function() {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {});
            };
            $scope.isFullPageSection = function(sections) {
                return  this.checkDisplayType(sections, 'Full-Page', 0);
            };
            $scope.hasThreeFourthPageSection = function(sections, index) {
                return this.checkDisplayType(sections, 'LAYOUT_75_25', index);
            };
            $scope.isOneFourthPageSection = function(sections) {
                return this.checkDisplayType(sections, 'LAYOUT_25_75' ,0);
            };
            $scope.isHalfPageSection = function (sections) {
                return (sections[0] && (this.checkDisplayType(sections, 'Half-Page', 0) || this.isDisplayTypeWrong(sections) || !(sections[0]['displayType'])));
            };
            $scope.checkDisplayType = function(sections, typeToCheck , index)
            {
                return sections[index] && sections[index]['displayType'] && sections[index]['displayType'] === typeToCheck;
            };
            $scope.containsThreeFourthPageSection = function (sections) {
                var hasThreeFourthSection = this.hasThreeFourthPageSection(sections, 0) || this.hasThreeFourthPageSection(sections, 1);
                if(sections.length==1) {
                    return this.hasThreeFourthPageSection(sections, 0);
                }

                return hasThreeFourthSection;
            };
            $scope.isDisplayTypeWrong = function(sections) {
                var allDisplayTypes = ['Full-Page','LAYOUT_75_25','LAYOUT_25_75','Half-Page'];
                return (allDisplayTypes.indexOf(sections[0]['displayType']) <= -1);
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
                visitSummary: "=",
                enrollment: "="
            }
        }
    }]);
