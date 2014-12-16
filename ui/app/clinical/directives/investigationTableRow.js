'use strict';

angular.module('bahmni.clinical')
    .directive('investigationTableRow', function () {
        var controller = function ($scope) {
            var urlFrom = function(fileName) {
                return Bahmni.Common.Constants.labResultUploadedFileNameUrl + fileName;
                }, defaultParams = {
                showCommentsExpanded: true
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.hasNotes = function () {
                return $scope.test.notes || $scope.test.showNotes ? true : false;
            };

            $scope.showTestNotes = function () {
                return $scope.hasNotes($scope.test);
            };

            $scope.test.showNotes = $scope.hasNotes() && $scope.params.showCommentsExpanded;
            $scope.test.labReportUrl = $scope.test.uploadedFileName? urlFrom($scope.test.uploadedFileName): null;

            $scope.toggle = function () {
                $scope.test.showNotes = !$scope.test.showNotes;
            };

        };
        return {
            restrict: 'A',
            controller: controller,
            scope: {
                test: "=",
                params: "="
            },
            templateUrl: "views/displayControls/investigationTableRow.html"
        };
    });