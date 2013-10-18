'use strict';

angular.module('opd.bedManagement.controllers')
    .controller('WardLayoutController', ['$scope', '$route','$location','$rootScope', 'WardLayoutService', function ($scope, $route, $location, $rootScope, wardLayoutService) {

        $scope.layout = [];
        $scope.result = [];



        var uuid = $route.current.params.wardId;
        $scope.bed;

        $('.bed-info').hide();
        $scope.bedDetails = function(cell){
            $('.bed-info').hide();
            $scope.bed = cell;
            $scope.$apply();
            if(!cell.empty) {
                $('.bed-info').show();
            }
        }

        $scope.back = function(){
            $location.url("/visit/"+ $rootScope.visit.uuid +"/bed-management");
        }

        $scope.assignBed = function (bed) {
            wardLayoutService.assignBed(bed.bed.bedId,$scope.patient.uuid).success(function(result){
                $rootScope.bed = bed.bed;
                $scope.layout = [];
                $rootScope.getBedDetailsForPatient($scope.patient.uuid);
                $scope.getBedsForWard();
                $scope.confirmationMessage = "Bed " + bed.bed.bedNumber + " is assigned successfully";
                $('.bed-info').hide();
            });
//            $scope.$apply();
        }

        $scope.getBedsForWard = function () {
            wardLayoutService.bedsForWard(uuid).success(function (result) {
                $scope.result = result.bedLayouts;
                $scope.createLayoutGrid();
            });
        }

        $scope.maxX = $scope.maxY = $scope.minX = $scope.minY = 1;

        $scope.createLayoutGrid = function () {
            console.log("creating layout");
            findMaxYMaxX();
            var bedLayout;
            var rowLayout = [];
            for (var i = $scope.minX; i <= $scope.maxX; i++) {
                rowLayout = [];
                for (var j = $scope.minY; j <= $scope.maxY; j++) {
                    bedLayout = getBedLayoutWithCordinates(i, j);
                    rowLayout.push({empty: isEmpty(bedLayout), available: isAvailable(bedLayout), bed: { bedId:bedLayout!= null && bedLayout.bedId , bedNumber: bedLayout!= null && bedLayout.bedNumber }})
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
            return bedLayout.status === "AVAILABLE";
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
            for (var i = 0; i < $scope.result.length; i++) {
                var result = $scope.result[i];
                if (result.rowNumber > $scope.maxX) {
                    $scope.maxX = result.rowNumber;
                }
                if (result.columnNumber > $scope.maxY) {
                    $scope.maxY = result.columnNumber;
                }
            }
        }


        $scope.getCurrentBed = function(){
            return $rootScope.bedDetails;
        }

        $scope.getBedsForWard();

    }])
    .directive('dialog', function () {
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {
                elem.bind('click', function(e) {
                    scope.bedDetails(scope.cell);
                    var leftpos=$(elem).position().left+28;
                    var toppos=$(elem).offset().top;
                    $(".bed-info").css('left',leftpos);
                    $(".bed-info").css('top',toppos);
                });
            }
        };
    });

