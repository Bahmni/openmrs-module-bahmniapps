'use strict';

angular.module('bahmni.adt')
    .controller('WardDetailsController', ['$scope', '$rootScope', '$window', 'WardService', 'bedService', 'BedManagementService', '$document',
        function ($scope, $rootScope, $window, wardService, bedService, bedManagementService, $document) {
            $scope.wards = null;
            $scope.ward = null;
            $scope.currentView = "wards";
            $scope.layout = [];
            $scope.bedLayouts = [];
            $scope.selectedBed = null;
            $scope.wardName = null;
            var maxX = 1;
            var maxY = 1;
            var minX = 1;
            var minY = 1;
            var currentWardUuid = null;

            var params = {
                q: "emrapi.sqlGet.wardsListDetails",
                v: "full"
            };
            var init = function () {
                $('.bed-info').hide();
                $document.bind('click', function () {
                    $scope.hideBedInfoPopUp();
                });
                loadAllWards();
            };

            var loadAllWards = function () {
                currentWardUuid = null;
                wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                });
                $scope.confirmationMessage = null;
            };

            $scope.toggle = function (ward) {
                $scope.ward = ward;
                ward.showDetails = !ward.showDetails && $scope.showDetailsButton(ward);
            };
            $scope.showDetailsButton = function (ward) {
                return ward.occupiedBeds > 0;
            };
            $scope.getParams = function (ward) {
                params.location_name = $scope.ward.ward.childLocations[0].display;
                return params;
            };

            $scope.hideBedInfoPopUp = function () {
                $scope.selectedBed = null;
                $scope.$apply();
            };

            $scope.showWardLayout = function(wardUuid, wardName) {
                $scope.disableBedAssignment = true;
                currentWardUuid = wardUuid;
                $scope.wardName = wardName;
                $scope.currentView = "wardLayout";
                $scope.layout = [];
                $scope.bedLayouts = [];
                $scope.selectedBed = null;
                maxX = maxY = minX = minY = 1; 
                getBedsForWard(wardUuid);  
            };

            var getBedsForWard = function (wardUuid) {
                wardService.bedsForWard(wardUuid).success(function (result) {
                    $scope.bedLayouts = result.bedLayouts;
                    $scope.layout = bedManagementService.createLayoutGrid($scope.bedLayouts); 

                });
            };

            $scope.setBedDetails = function (cell) {
                $('.bed-info').hide();
                $scope.selectedBed = cell;
                $scope.$apply();
                if (!cell.empty) {
                    $('.bed-info').show();
                }
            };

            $scope.showWardList = function () {
                $scope.currentView = "wards";
                loadAllWards();
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
                return null;
            };

        init();

}]).directive('bedAssignmentDialog', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('click', function (e) {
                    var leftpos = $(elem).offset().left - 132;
                    var toppos = $(elem).offset().top;
                    $(".bed-info").css('left', leftpos);
                    $(".bed-info").css('top', toppos);
                    e.stopPropagation();
                });
            }
        };
    });
