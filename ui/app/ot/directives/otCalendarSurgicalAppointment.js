/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalAppointment', ['surgicalAppointmentHelper', 'appService', '$window', 'otUtils', function (surgicalAppointmentHelper, appService, $window, otUtils) {
        var link = function ($scope) {
            $scope.attributes = surgicalAppointmentHelper.getSurgicalAttributes($scope.surgicalAppointment);
            if (!$scope.conceptFormatAttributeName) {
                $scope.conceptFormatAttributeName = otUtils.getConceptFormatAttributeName();
            }
            $scope.conceptFormatDropdownConstants = Bahmni.OT.Constants.notApplicableValues;
            var patientUrls = appService.getAppDescriptor().getConfigValue("patientDashboardUrl");
            $scope.patientDashboardUrl = patientUrls && patientUrls.link && appService.getAppDescriptor().formatUrl(patientUrls.link, {'patientUuid': $scope.surgicalAppointment.patient.uuid});
            $scope.goToForwardUrl = function ($event) {
                $window.open($scope.patientDashboardUrl);
                $event.stopPropagation();
            };

            var hasAppointmentStatusInFilteredStatusList = function () {
                if (_.isEmpty($scope.filterParams.statusList)) {
                    return true;
                }
                return _.find($scope.filterParams.statusList, function (selectedStatus) {
                    return selectedStatus.name === $scope.surgicalAppointment.status;
                });
            };

            var hasAppointmentIsOfTheFilteredPatient = function () {
                if (_.isEmpty($scope.filterParams.patient)) {
                    return true;
                }
                return $scope.surgicalAppointment.patient.uuid === $scope.filterParams.patient.uuid;
            };

            $scope.canTheSurgicalAppointmentBeShown = function () {
                return hasAppointmentIsOfTheFilteredPatient() && hasAppointmentStatusInFilteredStatusList();
            };

            var getDataForSurgicalAppointment = function () {
                $scope.height = getHeightForSurgicalAppointment();
                $scope.patient = surgicalAppointmentHelper.getPatientDisplayLabel($scope.surgicalAppointment.patient.display);
            };

            var getHeightForSurgicalAppointment = function () {
                return $scope.surgicalAppointment.derivedAttributes.height * $scope.heightPerMin;
            };

            $scope.selectSurgicalAppointment = function ($event) {
                $scope.$emit("event:surgicalAppointmentSelect", $scope.surgicalAppointment, $scope.$parent.surgicalBlock);
                $event.stopPropagation();
            };

            var showToolTipForSurgery = function () {
                $('.surgical-block-appointment').tooltip({
                    content: function () {
                        return $(this).prop('title');
                    },
                    track: true
                });
            };

            getDataForSurgicalAppointment();
            showToolTipForSurgery();
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalAppointment: "=",
                weekOrDay: "=",
                operationTheatre: "=",
                heightPerMin: "=",
                backgroundColor: "=",
                filterParams: "=",
                conceptFormatAttributeName: "=?"

            },
            templateUrl: "../ot/views/calendarSurgicalAppointment.html"
        };
    }]);
