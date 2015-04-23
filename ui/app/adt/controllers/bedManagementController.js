'use strict';

angular.module('bahmni.adt')
    .controller('BedManagementController', ['$scope', '$rootScope', '$location', 'WardService', 'BedManagementService', 'bedService', '$stateParams', 'encounterService', 'sessionService', 'messagingService', 'backlinkService', '$timeout', '$document',
        function ($scope, $rootScope, $location, wardService, bedManagementService, bedService, $stateParams, encounterService, sessionService, messagingService, backlinkService, $timeout, $document) {
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
        var encounterUuid = $stateParams.encounterUuid;
        var visitUuid = $stateParams.visitUuid;

        var init = function () {
            $('.bed-info').hide();
            if ($rootScope.bedDetails && $rootScope.bedDetails.wardUuid) {
                $scope.showWardLayout($rootScope.bedDetails.wardUuid, $rootScope.bedDetails.wardName);
            } else {
                $scope.showWardList();
            }

            $document.bind('click', function () {
                $scope.hideBedInfoPopUp();
            });
        };


            $scope.$on('$stateChangeSuccess', function (event, state, params, fromState, fromParams) {
                backlinkService.addUrl({ image: $scope.patient.image, url: "#/patient/" + $scope.patient.uuid + "/visit/" + visitUuid + "/", title: "Back to patient dashboard"});
            });

        $scope.hideBedInfoPopUp = function () {
            $scope.selectedBed = null;
            $scope.$apply();
        };

        $scope.showWardLayout = function(wardUuid, wardName) {
            $scope.currentView = "wardLayout";
            $scope.wardName = wardName;
            $scope.layout = [];
            $scope.bedLayouts = [];
            $scope.selectedBed = null;
            maxX = maxY = minX = minY = 1; 
            getBedsForWard(wardUuid);
            currentWardUuid = wardUuid;
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

        var assignBedToPatient = function(bed, encUuid) {
            bedService.assignBed(bed.bed.bedId, $scope.patient.uuid, encUuid).success(function (result) {
                $rootScope.bed = bed.bed;
                $scope.layout = [];
                bedService.setBedDetailsForPatientOnRootScope($scope.patient.uuid);
                getBedsForWard(currentWardUuid);
                $scope.confirmationMessage = "Bed " + bed.bed.bedNumber + " is assigned successfully";
                $('.bed-info').hide();
            });
        };

        var showAssignmentError = function(errorMsg) {
            messagingService.showMessage('error', errorMsg);
            $('.bed-info').hide();
        };

        var clearAssignmentError = function() {
            $('.bed-info').hide();
        };


        var createTransferEncounterAndAssignBed = function(bed) {
            var encounterData = {};
            encounterData.patientUuid = $scope.patient.uuid;
            encounterData.locationUuid = sessionService.getLoginLocationUuid();
            encounterData.encounterTypeUuid = $rootScope.encounterConfig.encounterTypes['TRANSFER'];
            encounterService.create(encounterData).success(function(encounter) {
                encounterUuid = encounter.encounterUuid;
                assignBedToPatient(bed, encounterUuid);
            }).error(function(error) {
                showAssignmentError("An error occurred while tranferring the patient.");
            });
        };

        var checkEncounterBeforeBedAssignment = function(bed, assignmentType) {
            var encounterTypeUuid = $rootScope.encounterConfig.encounterTypes[assignmentType];
            encounterService.identifyEncounterForType($scope.patient.uuid, encounterTypeUuid).then(
                function(encounter) {
                    if (encounter) {
                        encounterUuid = encounter.uuid;
                        assignBedToPatient(bed, encounterUuid);
                    } else if (assignmentType == 'TRANSFER') {
                        createTransferEncounterAndAssignBed(bed);
                    } else {
                        showAssignmentError("There is no appropriate encounter for " + assignmentType);
                    }
                },
                function(errorMsg) {
                    showAssignmentError(errorMsg);
                }
            );
        };

        $scope.assignBed = function (bed) {
            clearAssignmentError();
            var assignmentType = $rootScope.bedDetails ? 'TRANSFER' : 'ADMISSION';
            if (encounterUuid) {
                assignBedToPatient(bed, encounterUuid);
            } else {
                checkEncounterBeforeBedAssignment(bed, assignmentType);
            }
        };

        $scope.getCurrentBed = function () {
            return $rootScope.bedDetails;
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

        var loadAllWards = function () {
            currentWardUuid = null;
            wardService.getWardsList().success(function (wardsList) {
                $scope.wards = wardsList.results;
            });
            $scope.confirmationMessage = null;
        };

        var getBedsForWard = function (wardUuid) {
            wardService.bedsForWard(wardUuid).success(function (result) {
                $scope.bedLayouts = result.bedLayouts;
                $scope.layout = bedManagementService.createLayoutGrid($scope.bedLayouts);  
            });
        };

        init();

    }]).directive('bedAssignmentDialog', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('click', function (e) {
                    scope.setBedDetails(scope.cell);
                    var leftpos = $(elem).offset().left - 132;
                    var toppos = $(elem).offset().top;
                    $(".bed-info").css('left', leftpos);
                    $(".bed-info").css('top', toppos);
                    e.stopPropagation();
                });
            }
        };
    });
