'use strict';

angular.module('bahmni.adt')
    .controller('WardLayoutController', ['$scope', '$rootScope', '$window', '$anchorScroll', 'spinner', 'WardService', 'BedManagementService', 'bedService', 'messagingService', '$document', '$element',
        function ($scope, $rootScope, $window, $anchorScroll, spinner, wardService, bedManagementService, bedService, messagingService, $document, $element) {
            $scope.selectedBed = null;

            var init = function () {
                $element.find('.bed-info').hide();
                spinner.forPromise(getBeds());

                $document.bind('click', function () {
                    $scope.hideBedInfoPopUp();
                });

                $scope.$watch(function () {
                    return $rootScope.bedDetails;
                }, function (newValue, oldValue) {
                    if (oldValue != newValue && ((oldValue && oldValue.wardUuid === $scope.ward.ward.uuid) || newValue.wardUuid === $scope.ward.ward.uuid)) {
                        getBeds();
                    }
                });
            };

            var getBeds = function () {
                return wardService.bedsForWard($scope.ward.ward.uuid).success(function (result) {
                    var groupedLayoutsByLocation = _.groupBy(result.bedLayouts, 'location');
                    $scope.ward.layouts = [];
                    _.map(groupedLayoutsByLocation, function (value, key) {
                        var layout = {
                            name: key,
                            beds: bedManagementService.createLayoutGrid(value)
                        };
                        $scope.ward.layouts.push(layout);
                    });
                });
            };

            $scope.assignBed = function (bed) {
                clearAssignmentError();
                assignBedToPatient(bed, $scope.encounterUuid);
            };

            var clearAssignmentError = function () {
                $element.find('.bed-info').hide();
            };

            var assignBedToPatient = function (bed, encUuid) {
                spinner.forPromise(bedService.assignBed(bed.bed.bedId, $scope.patientUuid, encUuid).success(function () {
                    $rootScope.bed = bed.bed;
                    bedService.setBedDetailsForPatientOnRootScope($scope.patientUuid);
                    messagingService.showMessage('info', "Bed " + bed.bed.bedNumber + " is assigned successfully");
                    $element.find('.bed-info').hide();
                }));
            };

            $scope.getCurrentBed = function () {
                return $rootScope.bedDetails;
            };

            $scope.fetchBedInfo = function (cell, rowIndex, columnIndex) {
                if (!cell.available && !cell.empty && !cell.patientInfo) {
                    spinner.forPromise(bedService.getBedInfo(cell.bed.bedId).success(function (data) {
                        cell.patientInfo = {
                            "name": data.patient.person.personName.givenName + " " + data.patient.person.personName.familyName,
                            "identifier": data.patient.identifiers[0].identifier,
                            "gender": data.patient.person.gender
                        }
                    }));
                }
            };

            $scope.hideBedInfoPopUp = function () {
                $scope.selectedBed = null;
                $scope.$apply();
            };

            $scope.setBedDetails = function (cell) {
                $element.find('.bed-info').hide();
                $scope.selectedBed = cell;
                $scope.$apply();
                if (!cell.empty) {
                    $element.find('.bed-info').show();
                }
            };

            $scope.highlightCurrentPatient = function (cell) {
                var currentBed = $scope.getCurrentBed();
                return !$scope.readOnly && (currentBed && currentBed.bedId == cell.bed.bedId);
            };

            init();
        }]);
