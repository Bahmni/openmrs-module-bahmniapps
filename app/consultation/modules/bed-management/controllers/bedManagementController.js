'use strict';

angular.module('opd.bedManagement.controllers')
    .controller('BedManagementController', ['$scope', '$rootScope', '$location', 'WardService', 'BedService', function ($scope, $rootScope, $location, wardService, bedService) {
        $scope.wards = null;
        $scope.currentView = "wards";
        var currentWardUuid = null;

        var loadAllWards = function () {
            currentWardUuid = null;
            wardService.getWardsList().success(function (wardsList) {
                $scope.wards = wardsList.results;
            });
        };

        $scope.showWardLayout = function (wardUuid) {
            //$location.url("/visit/" + $rootScope.visit.uuid + "/bed-management/wardLayout/" + wardUuid.uuid);
            currentWardUuid = wardUuid;
            $scope.currentView = "wardLayout";
            $scope.getBedsForWard(wardUuid);
        };

        var init = function () {
            if ($rootScope.bedDetails && $rootScope.bedDetails.wardUuid) {
                $scope.showWardLayout($rootScope.bedDetails.wardUuid);
            } else {
                $scope.showWardList();
            }
        };


        $scope.layout = [];
        $scope.result = [];
        $scope.bed = null;

//        var uuid = $route.current.params.wardId;

        $('.bed-info').hide();
        $scope.getBedDetails = function (cell) {
            $('.bed-info').hide();
            $scope.bed = cell;
            $scope.$apply();
            if (!cell.empty) {
                $('.bed-info').show();
            }
        };

        $scope.showWardList = function () {
            $scope.currentView = "wards";
            if (!$scope.wards) {
                loadAllWards();
            }
        };

        $scope.assignBed = function (bed) {
            wardService.assignBed(bed.bed.bedId, $scope.patient.uuid).success(function (result) {
                $rootScope.bed = bed.bed;
                $scope.layout = [];
                $rootScope.getBedDetailsForPatient($scope.patient.uuid);
                $scope.getBedsForWard(currentWardUuid);
                $scope.confirmationMessage = "Bed " + bed.bed.bedNumber + " is assigned successfully";
                $('.bed-info').hide();
            });
        };

        $scope.getCurrentBed = function () {
            return $rootScope.bedDetails;
        };

        $scope.getBedsForWard = function (wardUuid) {
            wardService.bedsForWard(wardUuid).success(function (result) {
                $scope.result = result.bedLayouts;
                $scope.createLayoutGrid();
            });
        };

        $scope.maxX = $scope.maxY = $scope.minX = $scope.minY = 1;

        $scope.createLayoutGrid = function () {
            findMaxYMaxX();
            var bedLayout;
            var rowLayout = [];
            for (var i = $scope.minX; i <= $scope.maxX; i++) {
                rowLayout = [];
                for (var j = $scope.minY; j <= $scope.maxY; j++) {
                    bedLayout = getBedLayoutWithCordinates(i, j);
                    rowLayout.push({
                        empty: isEmpty(bedLayout),
                        available: isAvailable(bedLayout),
                        bed: {
                            bedId: bedLayout != null && bedLayout.bedId,
                            bedNumber: bedLayout != null && bedLayout.bedNumber
                        }
                    })
                }
                $scope.layout.push(rowLayout);
            }
        };

        $scope.fetchBedInfo = function (cell, rowIndex, columnIndex) {
            if (!cell.available && !cell.empty) {
                return bedService.getBedInfo(cell.bed.bedId).success(function (data) {
                    $scope.layout[rowIndex][columnIndex].patientInfo = {
                        "name": data.patient.person.personName.givenName + " " + data.patient.person.personName.familyName,
                        "identifier": data.patient.identifiers[0].identifier,
                        "gender": data.patient.person.gender
                    }
                })
            }
        };

        var isEmpty = function (bedLayout) {
            if (bedLayout == null || bedLayout.bedId == null) {
                return true;
            }
            return false;
        };

        var isAvailable = function (bedLayout) {
            if (bedLayout == null) {
                return false;
            }
            return bedLayout.status === "AVAILABLE";
        };

        var getBedLayoutWithCordinates = function (rowNumber, columnNumber) {
            var array = $scope.result;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].rowNumber === rowNumber && array[i].columnNumber === columnNumber) {
                    return array[i];
                }
            }
            return null;
        };

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
        };

        init();
    }]).
    directive('bedAssignmentDialog', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('click', function (e) {
                    scope.getBedDetails(scope.cell);
                    var leftpos = $(elem).position().left + 28;
                    var toppos = $(elem).offset().top;
                    $(".bed-info").css('left', leftpos);
                    $(".bed-info").css('top', toppos);
                });
            }
        };
    });
