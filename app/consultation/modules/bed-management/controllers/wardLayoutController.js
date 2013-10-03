'use strict';

angular.module('opd.bedManagement.controllers')
    .controller('WardLayoutController', ['$scope', '$route', 'WardLayoutService', function ($scope, $route, wardLayoutService) {

        var uuid = $route.current.params.wardId;
        $scope.layout = [];
        $scope.result = [];

        $scope.getBedsForWard = function () {
            wardLayoutService.bedsForWard(uuid).success(function (result) {
                $scope.result = result.bedLayouts;
                $scope.createLayoutGrid();
            });
        }

        //assuming minX,minY to be 1
        $scope.maxX = $scope.maxY = $scope.minX = $scope.minY = 1;

        $scope.createLayoutGrid = function () {
            findMaxYMaxX();
            var bedLayout;
            var rowLayout = [];
            for (var i = $scope.minX; i <= $scope.maxX; i++) {
                rowLayout = [];
                for (var j = $scope.minY; j <= $scope.maxY; j++) {
                    bedLayout = getBedLayoutWithCordinates(i, j);
                    rowLayout.push({empty: isEmpty(bedLayout), available: isAvailable(bedLayout)})
                }
                $scope.layout.push(rowLayout);
            }
        }
        var isEmpty = function (bedLayout) {
            if (bedLayout == null || bedLayout.bedId == null) {
                return true;
            }
            return false;
        }

        var isAvailable = function (bedLayout) {
            if (bedLayout == null) {
                return false;
            }
            return bedLayout.available;
        }

        var getBedLayoutWithCordinates = function (rowNumber, columnNumber) {
            var array = $scope.result;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].rowNumber === rowNumber && array[i].columnNumber === columnNumber) {
                    return array[i];
                }
            }
            return null;
        }

        var findMaxYMaxX = function () {
            for (var i=0; i < $scope.result.length; i++) {
                result = $scope.result[i];
                if (result.rowNumber > $scope.maxX) {
                    $scope.maxX = result.rowNumber;
                }
                if (result.columnNumber > $scope.maxY) {
                    $scope.maxY = result.columnNumber;
                }
            }
        }

        $scope.getBedsForWard();

    }]);

