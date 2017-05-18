'use strict';

angular.module('bahmni.ot')
    .controller('NewSurgicalAppointmentController', ['$scope','$q', 'patientService', 'surgicalAppointmentService', 'messagingService', 'ngDialog', 'spinner',
        function ($scope, $q, patientService, surgicalAppointmentService, messagingService, ngDialog, spinner) {
            var init = function () {
                $scope.selectedPatient = $scope.ngDialogData && $scope.ngDialogData.patient;
                $scope.notes = $scope.ngDialogData && $scope.ngDialogData.notes;

                return $q.all([surgicalAppointmentService.getSurgicalAppointmentAttributeTypes()]).then(function (response) {
                    $scope.attributeTypes = response[0].data.results;
                    $scope.attributes = $scope.ngDialogData && $scope.ngDialogData.attributes || {
                            procedure: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("procedure")
                            },

                            cleaningTime: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("cleaningTime"),
                                value: 15
                            },
                            estTimeMinutes: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("estTimeMinutes"),
                                value: 0
                            },
                            estTimeHours: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("estTimeHours"),
                                value: 0
                            },
                            otherSurgeon: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("otherSurgeon"),
                                value: null
                            },
                            anaesthetist: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("anaesthetist"),
                                value: null
                            },
                            scrubNurse: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("scrubNurse"),
                                value: null
                            },
                            circulatingNurse: {
                                surgicalAppointmentAttributeType: getAttributeTypeByName("circulatingNurse"),
                                value: null
                            }
                        };
                });
            };


            var getAttributeTypeByName = function(name){
              return _.find($scope.attributeTypes, function (attributeType) {
                  return attributeType.name === name;
              });

            };

            var getAppointmentDuration = function () {
                return $scope.attributes.cleaningTime.value +
                    $scope.attributes.estTimeMinutes.value +
                    $scope.attributes.estTimeHours.value * 60;

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
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            var isValidAppointment = function () {
              return $scope.selectedPatient != null;
            };


            $scope.createAppointmentAndAdd = function () {
                if (!isValidAppointment()) {
                    messagingService.showMessage('error', "{{'OT_ENTER_MANDATORY_FIELDS' | translate}}");
                    return;
                }

                var otherSurgeonName = $scope.attributes.otherSurgeon.value &&  $scope.attributes.otherSurgeon.value.person.display;
                $scope.attributes.otherSurgeon.value = $scope.attributes.otherSurgeon.value.id;
                var appointment = {
                    patient: $scope.selectedPatient,
                    notes: $scope.notes,
                    surgicalAppointmentAttributes: $scope.attributes,
                    otherSurgeon:  otherSurgeonName,
                    duration: getAppointmentDuration()
                };

                    $scope.addSurgicalAppointment(appointment);

            };

            $scope.close = function () {
                ngDialog.close();
            };

            spinner.forPromise(init());
        }]);
