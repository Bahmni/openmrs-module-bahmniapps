'use strict';

angular.module('registration.patient.controllers')
    .controller('VisitController', ['$scope', '$location', 'patientService', 'visitService', 'bmi', 'date', '$window', '$route', 'spinner', '$timeout', '$q', 'printer',
                    function ($scope, $location, patientService, visitService, bmiModule, date, $window, $route, spinner, $timeout, $q, printer) {
        (function () {
            $scope.patient = patientService.getPatient();

            var visitTypeUUID = $scope.encounterConfiguration.visitTypeId($scope.patient.isNew);
            var encounterTypeUUID = $scope.encounterConfiguration.encounterTypes[constants.encounterType.registration];
            var encounterObservationsPromise = visitService.get($scope.patient.uuid, visitTypeUUID, encounterTypeUUID)
                    .success(function (data) {
                        $scope.registrationObservations = new RegistrationObservations(data, $scope.patient.isNew, $scope.encounterConfiguration);
                        $scope.obs = {};
                        $scope.registrationObservations.observations.forEach(function(observation) { $scope.obs[observation.conceptName] = observation.value});
                        $scope.calculateBMI();
                    });

            $scope.encounter = {visitTypeUUID: visitTypeUUID, encounterTypeUUID: encounterTypeUUID, patientUUID: $scope.patient.uuid};
            spinner.forPromise(encounterObservationsPromise);
        })();

        $scope.calculateBMI = function () {
            if ($scope.obs.HEIGHT && $scope.obs.WEIGHT) {
                var bmi = bmiModule.calculateBmi($scope.obs.HEIGHT, $scope.obs.WEIGHT);
                var valid = bmi.valid();
                $scope.obs.bmi_error = !valid;
                $scope.obs.BMI = bmi.value;
                $scope.obs.bmi_status = valid ? bmi.status() : "Invalid";
            } else {
                $scope.obs.bmi_error = false;
                $scope.obs.BMI = null;
                $scope.obs.bmi_status = null;
            }
        };

        $scope.back = function () {
            $window.history.back();
        };

        $scope.updatePatientImage = function(image) {
            var updateImagePromise = patientService.updateImage($scope.patient.uuid, image.replace("data:image/jpeg;base64,", ""));
            spinner.forPromise(updateImagePromise);
            return updateImagePromise;
        }

        $scope.print = function () {
            return $timeout(function () {
                printer.print('registrationCard');
            }, 0);
        };

        $scope.registrationFeeLabel = $scope.patient.isNew ? "Registration Fee" : "Consultation Fee";

        $scope.save = function () {
            $scope.encounter.observations = $scope.registrationObservations.updateObservations($scope.obs);
            var createPromise = visitService.create($scope.encounter);
            spinner.forPromise(createPromise);
            return createPromise;
        }

        $scope.moveToNextPage = function () {
            return $timeout(function () {
                var path = $scope.patient.isNew ? "/patient/new" : "/search";
                $location.path(path);
            }, 100);
        };

        $scope.validate = function () {
            if ($scope.obs['REGISTRATION FEES'] === 0 && (!$scope.obs.COMMENTS || $scope.obs.COMMENTS === '')) {
                return $scope.confirmDialog.show();
            } else {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
        }

        $scope.submit = function () {
            if ($scope.patient.isNew) {
                return $scope.saveAndPrint();
            }
            else {
                return $scope.validate().then($scope.save).then(patientService.clearPatient).then($scope.moveToNextPage);
            }
        };

        $scope.saveAndPrint = function () {
            return $scope.validate().then($scope.save).then(patientService.clearPatient).then($scope.print).then($scope.moveToNextPage);
        };

        $scope.today = function () {
            return new Date();
        };

        $scope.printLayout = function () {
            return $route.routes['/printPatient'].templateUrl;
        };
    }])

    .directive('confirmDialog', function ($q) {
        return function (scope, element, attrs) {
            var dialogObject = {};
            dialogObject.dialogElement = $('#dialog-confirm');
            dialogObject.continue = false;
            dialogObject.dialogElement.dialog({autoOpen: false,
                buttons: {
                    "Continue": function () {
                        dialogObject.continue = true;
                        $(this).dialog("close");
                    },
                    "Go back": function () {
                        dialogObject.continue = false;
                        $(this).dialog("close");
                    }
                }
            });

            dialogObject.show = function () {
                var deferred = $q.defer();

                var dialogObject = this;
                this.dialogElement.on("dialogclose", function () {
                    scope.$apply(function () {
                        if (dialogObject.continue) {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                        }
                    });
                });
                this.dialogElement.dialog('open');
                return deferred.promise;
            };

            scope[attrs['handle']] = dialogObject;
        }
    });
