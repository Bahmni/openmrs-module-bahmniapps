'use strict';

angular.module('bahmni.ot')
    .controller('NewSurgicalAppointmentController', ['$scope', '$q', '$window', 'patientService', 'surgicalAppointmentService', 'messagingService', 'programService', 'appService', 'ngDialog', 'spinner',
        function ($scope, $q, $window, patientService, surgicalAppointmentService, messagingService, programService, appService, ngDialog, spinner) {
            var init = function () {
                $scope.selectedPatient = $scope.ngDialogData && $scope.ngDialogData.patient;
                $scope.patient = $scope.ngDialogData && $scope.ngDialogData.patient && ($scope.ngDialogData.patient.value || $scope.ngDialogData.patient.display);
                $scope.otherSurgeons = _.cloneDeep($scope.surgeons);
                return $q.all([surgicalAppointmentService.getSurgicalAppointmentAttributeTypes()]).then(function (response) {
                    $scope.attributeTypes = response[0].data.results;
                    var attributes = {};
                    var mapAttributes = new Bahmni.OT.SurgicalBlockMapper().mapAttributes(attributes, $scope.attributeTypes);
                    $scope.attributes = $scope.ngDialogData && $scope.ngDialogData.surgicalAppointmentAttributes || mapAttributes;
                    if ($scope.isEditMode()) {
                        programService.getEnrollmentInfoFor($scope.ngDialogData.patient.uuid, "custom:(uuid,dateEnrolled,program:(uuid),patient:(uuid))").then(function (response) {
                            $scope.enrollmentInfo = response && response[0];
                        });
                    }
                });
            };

            $scope.isEditMode = function () {
                return $scope.patient && $scope.ngDialogData && $scope.ngDialogData.id;
            };

            $scope.search = function () {
                return patientService.search($scope.patient).then(function (response) {
                    return response.data.pageOfResults;
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.selectedPatient = data;
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "( " + patientInfo.identifier + " )";
                    return patientInfo;
                });
            };

            $scope.createAppointmentAndAdd = function () {
                if ($scope.surgicalAppointmentForm.$valid) {
                    var appointment = {
                        id: $scope.ngDialogData && $scope.ngDialogData.id,
                        patient: $scope.selectedPatient,
                        sortWeight: $scope.ngDialogData && $scope.ngDialogData.sortWeight,
                        actualStartDatetime: $scope.ngDialogData && $scope.ngDialogData.actualStartDatetime,
                        actualEndDatetime: $scope.ngDialogData && $scope.ngDialogData.actualEndDatetime,
                        status: $scope.ngDialogData && $scope.ngDialogData.status || Bahmni.OT.Constants.scheduled,
                        surgicalAppointmentAttributes: $scope.attributes
                    };
                    $scope.addSurgicalAppointment(appointment);
                }
                return $q.when({});
            };

            $scope.close = function () {
                ngDialog.close();
            };

            $scope.goToForwardUrl = function () {
                var forwardUrl = appService.getAppDescriptor().getConfigValue('patientDashboardUrl');
                if (!$scope.enrollmentInfo) {
                    messagingService.showMessage('error', forwardUrl.errorMessage);
                    return;
                }
                var params = {
                    patientUuid: $scope.enrollmentInfo.patient.uuid,
                    dateEnrolled: $scope.enrollmentInfo.dateEnrolled,
                    programUuid: $scope.enrollmentInfo.program.uuid,
                    enrollment: $scope.enrollmentInfo.uuid
                };
                var formattedUrl = appService.getAppDescriptor().formatUrl(forwardUrl.link, params);
                $window.open(formattedUrl);
            };

            spinner.forPromise(init());
        }]);
