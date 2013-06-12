'use strict';

angular.module('registration.visitController', ['resources.patientService', 'resources.visitService', 'resources.concept', 'resources.bmi', 'resources.date', 'infrastructure.spinner', 'infrastructure.printer'])
    .controller('VisitController', ['$scope', '$location', 'patientService', 'visitService', 'concept', 'bmi', 'date', '$window', '$route', 'spinner', '$timeout', '$q', 'printer', function ($scope, $location, patientService, visitService, conceptService, bmiModule, date, $window, $route, spinner, $timeout, $q, printer) {
        var registrationConcepts = [];

        (function () {
            $scope.encounter = {};
            $scope.obs = {};
            $scope.visit = {};
            $scope.patient = patientService.getPatient();
            $scope.obs.registration_fees = defaults.registration_fees($scope.patient.isNew);

            var registrationConceptsPromise = conceptService.getRegistrationConcepts().success(function (data) {
                var concepts = data.results[0].setMembers;
                concepts.forEach(function (concept) {
                    registrationConcepts.push({name: concept.name.name, uuid: concept.uuid });
                });
            });
            spinner.forPromise(registrationConceptsPromise);
        })();

        $scope.calculateBMI = function () {
            if ($scope.obs.height && $scope.obs.weight) {
                var bmi = bmiModule.calculateBmi($scope.obs.height, $scope.obs.weight);
                var valid = bmi.valid();
                $scope.obs.bmi_error = !valid;
                $scope.obs.bmi = bmi.value;
                $scope.obs.bmi_status = valid ? bmi.status() : "Invalid";
            } else {
                $scope.obs.bmi_error = false;
                $scope.obs.bmi = null;
                $scope.obs.bmi_status = null;
            }
        };

        $scope.visit.encounters = [$scope.encounter];

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
            var datetime = date.now().toISOString();
            $scope.visit.patient = $scope.patient.uuid;
            $scope.visit.startDatetime = datetime;
            $scope.visit.visitType = $scope.patient.isNew ? constants.visitType.registration : constants.visitType.returningPatient;

            $scope.encounter.patient = $scope.patient.uuid;
            $scope.encounter.encounterDatetime = datetime;
            $scope.encounter.encounterType = constants.visitType.registration;

            $scope.encounter.obs = [];
            registrationConcepts.forEach(function (concept) {
                var conceptName = concept.name.replace(" ", "_").toLowerCase();
                var value = $scope.obs[conceptName];
                if (value != null && value != "") {
                    $scope.encounter.obs.push({concept: concept.uuid, value: value});
                }
            });
            $scope.visit.encounters = [$scope.encounter];

            var createPromise = visitService.create($scope.visit);
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
            if ($scope.obs.registration_fees === 0 && (!$scope.obs.comments || $scope.obs.comments === '')) {
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
