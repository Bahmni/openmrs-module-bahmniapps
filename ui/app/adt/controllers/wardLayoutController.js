'use strict';

angular.module('bahmni.adt')
    .controller('WardLayoutController', ['$scope', '$rootScope', '$window', '$anchorScroll', 'spinner', 'WardService', 'BedManagementService','bedService', 'encounterService', 'messagingService','$document', '$element',
        function ($scope, $rootScope, $window, $anchorScroll, spinner, wardService, bedManagementService, bedService, encounterService, messagingService, $document, $element) {
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
                    if (oldValue != newValue && oldValue != undefined && (oldValue.wardUuid === $scope.ward.ward.uuid || newValue.wardUuid === $scope.ward.ward.uuid)) {
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
                var assignmentType = $rootScope.bedDetails ? 'TRANSFER' : 'ADMISSION';
                if ($scope.encounterUuid) {
                    assignBedToPatient(bed, $scope.encounterUuid);
                } else {
                    checkEncounterBeforeBedAssignment(bed, assignmentType);
                }
            };

            var clearAssignmentError = function () {
                $element.find('.bed-info').hide();
            };

            var assignBedToPatient = function (bed, encUuid) {
                spinner.forPromise(bedService.assignBed(bed.bed.bedId, $scope.patientUuid, encUuid).success(function () {
                    $rootScope.bed = bed.bed;
                    bedService.setBedDetailsForPatientOnRootScope($scope.patientUuid);
                    $scope.confirmationMessage = "Bed " + bed.bed.bedNumber + " is assigned successfully";
                    $element.find('.bed-info').hide();
                }));
            };

            var checkEncounterBeforeBedAssignment = function (bed, assignmentType) {
                var encounterTypeUuid = $rootScope.encounterConfig.encounterTypes[assignmentType];
                spinner.forPromise(encounterService.identifyEncounterForType($scope.patientUuid, encounterTypeUuid).then(
                    function (encounter) {
                        if (encounter) {
                            $scope.encounterUuid = encounter.uuid;
                            assignBedToPatient(bed, $scope.encounterUuid);
                        } else if (assignmentType == 'TRANSFER') {
                            createTransferEncounterAndAssignBed(bed);
                        } else {
                            showAssignmentError("There is no appropriate encounter for " + assignmentType);
                        }
                    },
                    function (errorMsg) {
                        showAssignmentError(errorMsg);
                    }
                ));
            };

            var createTransferEncounterAndAssignBed = function (bed) {
                var encounterData = {};
                encounterData.patientUuid = $scope.patientUuid;
                encounterData.locationUuid = sessionService.getLoginLocationUuid();
                encounterData.encounterTypeUuid = $rootScope.encounterConfig.encounterTypes['TRANSFER'];
                spinner.forPromise(encounterService.create(encounterData).success(function (encounter) {
                    $scope.encounterUuid = encounter.encounterUuid;
                    assignBedToPatient(bed, $scope.encounterUuid);
                }).error(function (error) {
                    showAssignmentError("An error occurred while tranferring the patient.");
                }));
            };


            var showAssignmentError = function (errorMsg) {
                messagingService.showMessage('error', errorMsg);
                $element.find('.bed-info').hide();
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

            init();
        }]);
