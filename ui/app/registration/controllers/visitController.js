'use strict';

angular.module('bahmni.registration')
    .controller('VisitController', ['$scope', '$rootScope', '$location', 'patientService', 'encounterService', '$window', '$stateParams', 'spinner', '$timeout', '$q', 'registrationCardPrinter', 'appService', 'openmrsPatientMapper','contextChangeHandler','messagingService', 'sessionService',
        function ($scope, $rootScope, $location, patientService, encounterService, $window, $stateParams, spinner, $timeout, $q, registrationCardPrinter, appService, patientMapper,contextChangeHandler, messagingService, sessionService) {
            var patientUuid = $stateParams.patientUuid;
            var isNewPatient = $stateParams.newpatient;

            var extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config");
            var locationUuid = sessionService.getLoginLocationUuid();
            $scope.conceptSets = extensions.map(function(extension) { return new Bahmni.ConceptSet.ConceptSetSection(extension,[],{}); });
            $scope.availableConceptSets = $scope.conceptSets.filter(function(conceptSet){ return conceptSet.isAvailable($scope.context); });
            var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType];

            var getPatient = function () {
                return patientService.get(patientUuid).success(function (openMRSPatient) {
                    $scope.patient = patientMapper.map(openMRSPatient);
                    $scope.patient.name = openMRSPatient.person.names[0].display;
                    $scope.patient.uuid = openMRSPatient.uuid;
                    $scope.patient.isNew = isNewPatient;
                })
            };

            var getActiveEncounter = function () {
                return encounterService.activeEncounter({"patientUuid": patientUuid, "providerUuid" : $scope.currentProvider.uuid, "includeAll" : false, locationUuid : locationUuid, encounterTypeUuid: regEncounterTypeUuid})
                    .success(function (data) {
                        $scope.visitTypeUuid = data.visitTypeUuid;
                        $scope.observations = data.observations;
                        mapRegistrationObservations();
                    });
            };

            var mapRegistrationObservations = function () {
                var obs = {};
                var getValue = function(observation) {
                    obs[observation.concept.name] = observation.value;
                    observation.groupMembers.forEach(getValue);
                };
                $scope.observations.forEach(getValue);
                return obs;
            };


            $scope.hideFields = appService.getAppDescriptor().getConfigValue("hideFields");
            $scope.allowPrintingSupplementalPaper = appService.getAppDescriptor().getConfigValue("supplementalPaperPrintLayout") != null;

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

            $scope.printSupplemental = function() {
                return registrationCardPrinter.printSupplementalPaper($scope.patient, mapRegistrationObservations());
            };

            $scope.save = function () {
                $scope.encounter = {patientUuid: $scope.patient.uuid, locationUuid : locationUuid, encounterTypeUuid: regEncounterTypeUuid};
                $scope.encounter.observations = $scope.observations;
                $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);

                var createPromise = encounterService.create($scope.encounter);
                spinner.forPromise(createPromise);
                return createPromise;
            };

            $scope.moveToNextPage = function () {
                return $timeout(function () {
                    var path = $scope.patient.isNew ? "/patient/new" : "/search";
                    $location.path(path);
                }, 100);
            };

            $scope.validate = function () {
                var deferred = $q.defer();
                var allowContextChange = contextChangeHandler.execute()["allow"];
                if(!allowContextChange){
                    messagingService.showMessage('error', 'Please correct errors in the form. Information not saved');
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                }
                else {
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            $scope.submit = function () {
                if ($scope.submittedFrom === 'savePrint') {
                    return $scope.saveAndPrint();
                }
                else {
                    if ($scope.patient.isNew) {
                        return $scope.saveAndPrint();
                    }
                    else {
                        return $scope.validate().then($scope.save).then($scope.moveToNextPage);
                    }
                }

            };

            $scope.saveAndPrint = function () {
                return $scope.validate().then($scope.save).then($scope.print).then($scope.moveToNextPage);
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

            var getConceptSet = function () {
                var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.visitTypeUuid);
                $scope.context = {visitType: visitType, patient: $scope.patient};
            };

            spinner.forPromise($q.all([getPatient(), getActiveEncounter()]).then(getConceptSet));
        }]);
