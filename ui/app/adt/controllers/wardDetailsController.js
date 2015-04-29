'use strict';

angular.module('bahmni.adt')
    .controller('WardDetailsController', ['$scope', '$rootScope', '$window', '$document', 'spinner', 'WardService', 'bedService', 'BedManagementService', 'userService',
        function ($scope, $rootScope, $window, $document, spinner, wardService, bedService, bedManagementService, userService) {
            $scope.wards = null;
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

            var init = function () {
                $('.bed-info').hide();
                $document.bind('click', function () {
                    $scope.hideBedInfoPopUp();
                });
                return loadAllWards();
            };

            var loadAllWards = function () {
                currentWardUuid = null;
                $scope.confirmationMessage = null;
                return wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                });
            };

            var getBedsForWard = function (wardUuid) {
                return wardService.bedsForWard(wardUuid).success(function (result) {
                    $scope.bedLayouts = result.bedLayouts;
                    $scope.layout = bedManagementService.createLayoutGrid($scope.bedLayouts);
                });
            };

            $scope.toggle = function (ward) {
                $rootScope.currentUser.toggleFavoriteWard(ward.ward.name);
                spinner.forPromise(userService.savePreferences());
            };

            $scope.shouldBeShown = function (ward) {
                return $rootScope.currentUser.isFavouriteWard(ward.ward.name)
            };

            $scope.hideBedInfoPopUp = function () {
                $scope.selectedBed = null;
                $scope.$apply();
            };

            $scope.showWardLayout = function (wardUuid, wardName) {
                $scope.disableBedAssignment = true;
                currentWardUuid = wardUuid;
                $scope.wardName = wardName;
                $scope.currentView = "wardLayout";
                $scope.layout = [];
                $scope.bedLayouts = [];
                $scope.selectedBed = null;
                maxX = maxY = minX = minY = 1;
                spinner.forPromise(getBedsForWard(wardUuid));
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
                    spinner.forPromise(bedService.getBedInfo(cell.bed.bedId).success(function (data) {
                        $scope.layout[rowIndex][columnIndex].patientInfo = {
                            "name": data.patient.person.personName.givenName + " " + data.patient.person.personName.familyName,
                            "identifier": data.patient.identifiers[0].identifier,
                            "gender": data.patient.person.gender
                        }
                    }));
                }
                return null;
            };

            spinner.forPromise(init());

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
