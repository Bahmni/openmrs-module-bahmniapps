'use strict';

angular.module('bahmni.registration')
    .controller('VisitController', ['$scope', '$rootScope', '$state', 'patientService', 'encounterService', '$stateParams', 'spinner', '$timeout', '$q', 'appService', 'openmrsPatientMapper', 'contextChangeHandler', 'messagingService', 'sessionService',
        function ($scope, $rootScope, $state, patientService, encounterService, $stateParams, spinner, $timeout, $q, appService, patientMapper, contextChangeHandler, messagingService, sessionService) {
            var patientUuid = $stateParams.patientUuid;
            var extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config");
            var locationUuid = sessionService.getLoginLocationUuid();
            $scope.conceptSets = extensions.map(function (extension) {
                return new Bahmni.ConceptSet.ConceptSetSection(extension, $rootScope.currentUser, {}, [], {});
            });
            $scope.availableConceptSets = $scope.conceptSets.filter(function (conceptSet) {
                return conceptSet.isAvailable($scope.context);
            });
            var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType];

            var getPatient = function () {
                return patientService.get(patientUuid).success(function (openMRSPatient) {
                    $scope.patient = patientMapper.map(openMRSPatient);
                    $scope.patient.name = openMRSPatient.person.names[0].display;
                    $scope.patient.uuid = openMRSPatient.uuid;
                })
            };

            var getActiveEncounter = function () {
                return encounterService.activeEncounter({
                    "patientUuid": patientUuid,
                    "providerUuid": $scope.currentProvider.uuid,
                    "includeAll": false,
                    locationUuid: locationUuid,
                    encounterTypeUuid: regEncounterTypeUuid
                })
                    .success(function (data) {
                        $scope.encounterDateTime = data.encounterDateTime;
                        $scope.visitTypeUuid = data.visitTypeUuid;
                        $scope.observations = data.observations;
                    });
            };

            $scope.hideFields = appService.getAppDescriptor().getConfigValue("hideFields");

            $scope.back = function () {
                $state.go('patient.edit');
            };

            $scope.updatePatientImage = function (image) {
                var updateImagePromise = patientService.updateImage($scope.patient.uuid, image.replace("data:image/jpeg;base64,", ""));
                spinner.forPromise(updateImagePromise);
                return updateImagePromise;
            };

            var save = function () {
                $scope.encounter = {
                    patientUuid: $scope.patient.uuid,
                    locationUuid: locationUuid,
                    encounterTypeUuid: regEncounterTypeUuid
                };

                $scope.encounter.observations = $scope.observations;
                $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);

                var createPromise = encounterService.create($scope.encounter);
                spinner.forPromise(createPromise);
                return createPromise;
            };

            var validate = function () {
                var deferred = $q.defer();
                var contxChange = contextChangeHandler.execute();
                var allowContextChange = contxChange["allow"];
                if (!allowContextChange) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"]: "Please correct errors in the form. Information not saved";
                    messagingService.showMessage('formError', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                }
                else {
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            var reload = function () {
                $state.transitionTo($state.current, $state.params, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
                messagingService.showMessage('info', 'Saved');
            };

            $scope.submit = function () {
                return validate().then(save).then(reload);
            };

            $scope.today = function () {
                return new Date();
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
