'use strict';

angular.module('bahmni.registration')
    .controller('VisitController', ['$window', '$scope', '$rootScope', '$state', 'patientService', 'encounterService', '$stateParams', 'spinner', '$timeout', '$q', 'appService', 'openmrsPatientMapper', 'contextChangeHandler', 'messagingService', 'sessionService', 'visitService', '$location',
        function ($window, $scope, $rootScope, $state, patientService, encounterService, $stateParams, spinner, $timeout, $q, appService, patientMapper, contextChangeHandler, messagingService, sessionService, visitService, $location) {
            var self = this;
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

            var findPrivilege = function (privilegeName) {
                return _.find($rootScope.currentUser.privileges, function (privilege) {
                    return privilegeName === privilege.name;
                });
            };

            var searchActiveVisitsPromise = function () {
                return visitService.search({
                    patient: patientUuid, includeInactive: false, v: "custom:(uuid)"
                }).success(function (data) {
                    var hasActiveVisit = data.results.length > 0;
                    self.visitUuid = hasActiveVisit ? data.results[0].uuid : "";
                    $scope.canCloseVisit = findPrivilege(Bahmni.Common.Constants.closeVisitPrivilege) && hasActiveVisit;
                });
            };


            $scope.closeVisitIfDischarged = function () {
                visitService.getVisitSummary(self.visitUuid).then(function (response) {
                    var visitSummary = response.data;
                    if (visitSummary.admissionDetails != null && visitSummary.dischargeDetails === null) {
                        messagingService.showMessage("formError", "Admitted patient's visit cannot be closed. Discharge the patient and try again");
                    } else {
                        closeVisit();
                    }
                });
            };

            var closeVisit = function () {
                var confirmed = $window.confirm("Are you sure you want to close this visit?");
                if (confirmed) {
                    visitService.endVisit(self.visitUuid).then(function () {
                        $location.url(Bahmni.Registration.Constants.patientSearchURL);
                    });
                }
            };

            $scope.getMessage = function () {
                return $scope.message;
            };
            var validate = function () {
                mandatoryValidate();
                var deferred = $q.defer();
                var contxChange = contextChangeHandler.execute();
                var allowContextChange = contxChange["allow"];
                if (!allowContextChange) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "Please correct errors in the form. Information not saved";
                    messagingService.showMessage('formError', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                }else if(!mandatoryValidate()){ // This ELSE IF condition is to be deleted later.
                    var errorMessage =  "Please enter data into mandatory field(s).";
                    messagingService.showMessage('formError', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                } else {
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            //Start :: Registration Page validation
            //To be deleted later - Hacky fix only for Registration Page
            var mandatoryConceptGroup = [];
            var mandatoryValidate = function () {
                conceptGroupValidation($scope.observations);
                return isValid(mandatoryConceptGroup);
            };

            var conceptGroupValidation = function(observations){
                var concepts = _.filter(observations, function(observationNode){
                    return isMandatoryConcept(observationNode);
                });
                if(!_.isEmpty(concepts)){
                    mandatoryConceptGroup = _.union(mandatoryConceptGroup, concepts);
                }
            };
            var isMandatoryConcept = function (observation) {
                if (!_.isEmpty(observation.groupMembers)) {
                    conceptGroupValidation(observation.groupMembers);
                } else {
                    return observation.conceptUIConfig && observation.conceptUIConfig.required;
                }
            };
            var isValid = function (mandatoryConcepts){
                var concept = mandatoryConcepts.filter(function(mandatoryConcept){
                    return !mandatoryConcept.value;
                });
                return _.isEmpty(concept);
            };
            //End :: Registration Page validation

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

            spinner.forPromise($q.all([getPatient(), getActiveEncounter(), searchActiveVisitsPromise()]).then(getConceptSet));
        }]);
