'use strict';

angular.module('bahmni.registration')
    .controller('VisitController', ['$scope', '$rootScope', '$location', 'patientService', 'encounterService', 'bmi', '$window', '$route', 'spinner', '$timeout', '$q', 'registrationCardPrinter', 'appService', 'openmrsPatientMapper','contextChangeHandler',
        function ($scope, $rootScope, $location, patientService, encounterService, bmiModule, $window, $route, spinner, $timeout, $q, registrationCardPrinter, appService, patientMapper,contextChangeHandler) {

            var patientUuid = $route.current.params['patientUuid'];
            var isNewPatient = ($location.search()).newpatient;
            var encounterTypeUuid = $scope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.encounterType.registration];

            var getPatient = function () {
                return patientService.get(patientUuid).success(function (openMRSPatient) {
                    $scope.patient = patientMapper.map(openMRSPatient);
                    $scope.patient.name = openMRSPatient.person.names[0].display;
                    $scope.patient.uuid = openMRSPatient.uuid;
                    $scope.patient.isNew = isNewPatient;
                })
            };

            var getActiveEncounter = function () {
                return encounterService.activeEncounter({"patientUuid": patientUuid, "encounterTypeUuid" : encounterTypeUuid, "providerUuid" : $scope.currentProvider.uuid, "includeAll" : false})
                    .success(function (data) {
                        $scope.visitTypeUuid = data.visitTypeUuid;
                        $scope.observations = data.observations;
                        $scope.registrationFeeLabel = isNewPatient ? "Registration Fee" : "Consultation Fee";
                        mapRegistrationObservations();
                    });
            };

            var mapRegistrationObservations = function () {
                $scope.obs = {};
                $scope.registrationObservations = new Bahmni.Registration.RegistrationObservations($scope.observations, isNewPatient, $scope.regEncounterConfiguration);
                $scope.registrationObservations.observations.forEach(function (observation) {
                    $scope.obs[observation.concept.name] = observation.value
                    observation.groupMembers = [];
                });
                $scope.calculateBMI();
            };


            $scope.hideFields = appService.getAppDescriptor().getConfigValue("hideFields");

            $scope.isHiddenInConfig = function (fieldname) {
                if (!$scope.hideFields) return false;

                var toUpper = function (s){
                    return s.toUpperCase();
                }
                return $scope.hideFields.map(toUpper).indexOf(fieldname.toUpperCase()) > -1;
            };

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

            $scope.updatePatientImage = function (image) {
                var updateImagePromise = patientService.updateImage($scope.patient.uuid, image.replace("data:image/jpeg;base64,", ""));
                spinner.forPromise(updateImagePromise);
                return updateImagePromise;
            };

            $scope.print = function () {
                return registrationCardPrinter.print($scope.patient);
            };


            $scope.save = function () {
                $scope.encounter = {encounterTypeUuid: encounterTypeUuid, patientUuid: $scope.patient.uuid};
                var registrationObservations = $scope.registrationObservations.updateObservations($scope.obs);
                $scope.encounter.observations = $scope.observations;
                $scope.encounter.observations = $scope.encounter.observations.concat(registrationObservations);
                $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);

                var createPromise = encounterService.create($scope.encounter);
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
                var deferred = $q.defer();
                if(!contextChangeHandler.execute()){
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                }
                if ($scope.obs['REGISTRATION FEES'] === 0 && (!$scope.obs.COMMENTS || $scope.obs.COMMENTS === '') && !($scope.isHiddenInConfig('Comments') && $scope.isHiddenInConfig('REGISTRATION FEES'))) {
                    return $scope.confirmDialog.show();
                } else {
                    deferred.resolve();
                    return deferred.promise;
                }

            }

            $scope.submit = function () {
                if ($scope.submittedFrom === 'savePrint') {
                    return $scope.saveAndPrint();
                }
                else {
                    if ($scope.patient.isNew) {
                        return $scope.saveAndPrint();
                    }
                    else {
                        return $scope.validate().then($scope.save).then(patientService.clearPatient).then($scope.moveToNextPage);
                    }
                }

            };

            $scope.saveAndPrint = function () {
                return $scope.validate().then($scope.save).then(patientService.clearPatient).then($scope.print).then($scope.moveToNextPage);
            };


            $scope.today = function () {
                return new Date();
            };

            $scope.submitBtnClicked = function (name) {
                $scope.submittedFrom = name;
            };

            $scope.disableFormSubmitOnEnter = function () {
                $('.visit-patient').find('input').keypress(function (e) {
                    if (e.which === 13) // Enter key = keycode 13
                    {
                        return false;
                    }
                });
            };

            var getConceptSet = function(){
                $scope.conceptSetGroupExtensionId = 'org.bahmni.registration.conceptSetGroup.observations';
                var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.visitTypeUuid);
                $scope.context = {visitType:  visitType, patient: $scope.patient};
            };

            spinner.forPromise(getPatient().then(getActiveEncounter).then(getConceptSet));
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
