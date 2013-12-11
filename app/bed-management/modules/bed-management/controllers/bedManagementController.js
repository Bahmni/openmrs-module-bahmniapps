'use strict';

angular.module('opd.bedManagement.controllers')
    .controller('BedManagementController', ['$scope', '$rootScope', '$location', 'WardService', 'BedService', '$route', 'encounterService','ConceptSetService', function ($scope, $rootScope, $location, wardService, bedService, $route, encounterService, ConceptSetService) {
        $scope.wards = null;
        $scope.currentView = "wards";
        $scope.layout = [];
        $scope.bedLayouts = [];
        $scope.selectedBed = null;
        var maxX = 1;
        var maxY = 1;
        var minX = 1;
        var minY = 1;
        var currentWardUuid = null;
        var encounterUuid = $route.current.params.encounterUuid;
        
        var init = function () {
            $('.bed-info').hide();
            if ($rootScope.bedDetails && $rootScope.bedDetails.wardUuid) {
                $scope.showWardLayout($rootScope.bedDetails.wardUuid);
            } else {
                $scope.showWardList();
            }
        };

        $scope.showWardLayout = function (wardUuid) {
            currentWardUuid = wardUuid;
            $scope.layout = [];
            $scope.bedLayouts = [];
            $scope.selectedBed = null;
            maxX = maxY = minX = minY = 1;
            $scope.currentView = "wardLayout";
            getBedsForWard(wardUuid);
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
            if (!$scope.wards) {
                loadAllWards();
            }
        };

        var assignBedToPatient = function(bed, encUuid) {
            bedService.assignBed(bed.bed.bedId, $scope.patient.uuid, encUuid).success(function (result) {
                $rootScope.bed = bed.bed;
                $scope.layout = [];
                bedService.getBedDetailsForPatient($scope.patient.uuid);
                getBedsForWard(currentWardUuid);
                $scope.confirmationMessage = "Bed " + bed.bed.bedNumber + " is assigned successfully";
                $('.bed-info').hide();
            });
        };

        var showAssignmentError = function(errorMsg) {
            $rootScope.server_error = errorMsg;
            $('.bed-info').hide();
        };

        var clearAssignmentError = function() {
            $rootScope.server_error = "";
            $('.bed-info').hide();
        };


        var createTransferEncounterAndAssignBed = function(bed) {
            var encounterData = {};
            encounterData.patientUuid = $scope.patient.uuid;
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
        };

        var getBedsForWard = function (wardUuid) {
            wardService.bedsForWard(wardUuid).success(function (result) {
                $scope.bedLayouts = result.bedLayouts;
                createLayoutGrid();
            });
        };

        var createLayoutGrid = function () {
            findMaxYMaxX();
            var bedLayout;
            var rowLayout = [];
            for (var i = minX; i <= maxX; i++) {
                rowLayout = [];
                for (var j = minY; j <= maxY; j++) {
                    bedLayout = getBedLayoutWithCoordinates(i, j);
                    rowLayout.push({
                        empty: isEmpty(bedLayout),
                        available: isAvailable(bedLayout),
                        bed: {
                            bedId: bedLayout != null && bedLayout.bedId,
                            bedNumber: bedLayout != null && bedLayout.bedNumber,
                            bedType: bedLayout != null && bedLayout.bedType != null && bedLayout.bedType.displayName,
                        }
                    })
                }
                $scope.layout.push(rowLayout);
            }
        };

        var isEmpty = function (bedLayout) {
            return bedLayout == null || bedLayout.bedId == null;
        };

        var isAvailable = function (bedLayout) {
            if (bedLayout == null) {
                return false;
            }
            return bedLayout.status === "AVAILABLE";
        };

        var getBedLayoutWithCoordinates = function (rowNumber, columnNumber) {
            for (var i = 0, len = $scope.bedLayouts.length; i < len; i++) {
                if ($scope.bedLayouts[i].rowNumber === rowNumber && $scope.bedLayouts[i].columnNumber === columnNumber) {
                    return $scope.bedLayouts[i];
                }
            }
            return null;
        };

        var findMaxYMaxX = function () {
            for (var i = 0; i < $scope.bedLayouts.length; i++) {
                var bedLayout = $scope.bedLayouts[i];
                if (bedLayout.rowNumber > maxX) {
                    maxX = bedLayout.rowNumber;
                }
                if (bedLayout.columnNumber > maxY) {
                    maxY = bedLayout.columnNumber;
                }
            }
        };

        init();

    }]).directive('bedAssignmentDialog', function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('click', function (e) {
                    scope.setBedDetails(scope.cell);
                    var leftpos = $(elem).position().left + 28;
                    var toppos = $(elem).offset().top;
                    $(".bed-info").css('left', leftpos);
                    $(".bed-info").css('top', toppos);
                });
            }
        };
    });
