"use strict";

angular.module('bahmni.common.displaycontrol.admissiondetails')
    .directive('admissionDetails', ['bedService', function (bedService) {
        var controller = function ($scope) {
            $scope.showDetailsButton = function (encounter) {
                return $scope.params && $scope.params.showDetailsButton && !encounter.notes;
            };
            $scope.toggle = function (element) {
                element.show = !element.show;
            };
            init($scope);
        };
        var isReady = function ($scope) {
            return !_.isUndefined($scope.patientUuid) && !_.isUndefined($scope.visitSummary);
        };
        var onReady = function ($scope) {
            var visitUuid = _.get($scope.visitSummary, 'uuid');
            bedService.getAssignedBedForPatient($scope.patientUuid, visitUuid).then(function (bedDetails) {
                $scope.bedDetails = bedDetails;
            });
        };
        var init = function ($scope) {
            var stopWatching = $scope.$watchGroup(['patientUuid', 'visitSummary'], function () {
                if (isReady($scope)) {
                    stopWatching();
                    onReady($scope);
                    calculateDaysAdmitted($scope);
                }
            });

            $scope.isDataPresent = function () {
                if (!$scope.visitSummary || (!$scope.visitSummary.admissionDetails && !$scope.visitSummary.dischargeDetails)) {
                    return $scope.$emit("no-data-present-event") && false;
                }
                return true;
            };
        };
        var calculateDaysAdmitted = function ($scope) {
            if ($scope.visitSummary) {
                if ($scope.visitSummary.admissionDetails && $scope.visitSummary.dischargeDetails) {
                    var admissionDate = new Date($scope.visitSummary.admissionDetails.date);
                    var dischargeDate = new Date($scope.visitSummary.dischargeDetails.date);
                    var timeDifference = dischargeDate - admissionDate;
                    var daysAdmitted = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
                    $scope.visitSummary.daysAdmitted = daysAdmitted;
                    $scope.visitSummary.showDaysAdmitted = true;
                } else {
                    $scope.visitSummary.showDaysAdmitted = false;
                }
            }
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: function (element, attrs) {
                if (attrs.templateUrl) {
                    return attrs.templateUrl;
                } else {
                    return "../common/displaycontrols/admissiondetails/views/admissionDetails.html";
                }
            },
            scope: {
                params: "=",
                patientUuid: "=",
                visitSummary: "="
            }
        };
    }]);
